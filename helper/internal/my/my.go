// Package my is the MySQL driver: one *sql.Conn per (session, tab) from a
// *sql.DB capped at tabs+2, read-only enforced by wrapping each statement in
// a READ ONLY transaction, and cancel done with KILL QUERY from a side
// connection so the tab's connection survives.
package my

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"database/sql"
	"database/sql/driver"
	"errors"
	"net"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/go-sql-driver/mysql"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
	"github.com/rahuldr07/xray-extension/helper/internal/session"
	"github.com/rahuldr07/xray-extension/helper/internal/values"
)

const (
	connectTimeout = 10 * time.Second
	// cleanupTimeout bounds ROLLBACK on a fresh context.
	cleanupTimeout = 5 * time.Second
	// killTimeout bounds one KILL QUERY, including getting a side connection.
	killTimeout = time.Second
	// killRetry is how often a cancel repeats KILL QUERY: a KILL that lands
	// between statements is lost, so it is sent again until the statement ends.
	killRetry = 250 * time.Millisecond
	// giveUp is how long a cancel or a cursor close waits for the statement to
	// stop before closing the tab's socket; the next execute then redials.
	giveUp = 1500 * time.Millisecond
)

// Connect opens the pool, reads the server version and returns the session.
// Tab connections are dialled on each tab's first execute.
func Connect(ctx context.Context, p session.Params) (session.Session, error) {
	cfg, err := buildConfig(p)
	if err != nil {
		return nil, err
	}
	connector, err := mysql.NewConnector(cfg)
	if err != nil {
		return nil, session.Errorf(session.CodeBadRequest, "Invalid connection settings.")
	}
	db := sql.OpenDB(connector)
	// No idle connections: every tab connection is a fresh dial, so its
	// socket is known (see sockSlot), and KILL/introspect connections close
	// after use.
	db.SetMaxIdleConns(0)
	db.SetMaxOpenConns(2)
	base, stop := context.WithCancel(context.Background())
	s := &mySession{db: db, password: p.Password, readOnly: p.ReadOnly, timeout: p.StatementTimeout,
		base: base, stop: stop, tabs: map[string]*tab{}, socks: map[*sockSlot]bool{}}
	vctx, cancel := context.WithTimeout(ctx, connectTimeout)
	defer cancel()
	var version string
	if err := db.QueryRowContext(vctx, "SELECT VERSION()").Scan(&version); err != nil {
		e := s.dialErr(err)
		if ctx.Err() != nil {
			e = session.Errorf(session.CodeCancelled, "Connect cancelled.")
		}
		s.Close()
		return nil, e
	}
	s.version = version
	if !strings.Contains(strings.ToLower(version), "mariadb") {
		s.version = "MySQL " + version
	}
	return s, nil
}

// buildConfig turns Params into a driver config without a DSN, so the
// password is never formatted into text.
func buildConfig(p session.Params) (*mysql.Config, error) {
	if p.TLS == "disable" && !session.IsLoopback(p.Host) {
		return nil, session.Errorf(session.CodeTLSFailed, session.TLSRequiredMessage)
	}
	host := strings.TrimSuffix(strings.TrimPrefix(p.Host, "["), "]")
	port := p.Port
	if port == 0 {
		port = 3306
	}
	cfg := mysql.NewConfig()
	cfg.Net = "tcp"
	cfg.Addr = net.JoinHostPort(host, strconv.Itoa(port))
	cfg.User = p.User
	cfg.Passwd = p.Password
	cfg.DBName = p.Database
	cfg.Timeout = connectTimeout
	cfg.MultiStatements = false
	cfg.ParseTime = false
	cfg.InterpolateParams = false
	// affected counts matched rows, as Postgres reports them.
	cfg.ClientFoundRows = true
	// The driver logs connection errors to stderr; stderr carries only codes.
	cfg.Logger = &mysql.NopLogger{}
	cfg.DialFunc = dialSock
	if err := cfg.Apply(mysql.Charset("utf8mb4", "")); err != nil {
		return nil, session.Errorf(session.CodeBadRequest, "Invalid connection settings.")
	}
	switch p.TLS {
	case "disable":
		cfg.TLS = nil
	case "require":
		// Encryption without certificate checks, as libpq sslmode=require.
		cfg.TLS = &tls.Config{InsecureSkipVerify: true, ServerName: host}
	case "verify-full":
		tc := &tls.Config{ServerName: host}
		if p.CAFile != "" {
			pem, err := os.ReadFile(p.CAFile)
			if err != nil {
				return nil, session.Errorf(session.CodeTLSFailed, "Could not read the CA file.")
			}
			pool := x509.NewCertPool()
			if !pool.AppendCertsFromPEM(pem) {
				return nil, session.Errorf(session.CodeTLSFailed, "The CA file holds no PEM certificate.")
			}
			tc.RootCAs = pool
		}
		cfg.TLS = tc
	}
	return cfg, nil
}

// sockSlot receives the socket of a connection dialled with it in the
// context, so a stuck statement can be given up on by closing the socket.
type sockSlot struct {
	mu sync.Mutex
	c  net.Conn
}

func (s *sockSlot) close() {
	if s == nil {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.c != nil {
		s.c.Close()
	}
}

func (s *sockSlot) recorded() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.c != nil
}

type sockKey struct{}

func dialSock(ctx context.Context, network, addr string) (net.Conn, error) {
	var d net.Dialer
	c, err := d.DialContext(ctx, network, addr)
	if err != nil {
		return nil, err
	}
	if slot, ok := ctx.Value(sockKey{}).(*sockSlot); ok {
		slot.mu.Lock()
		slot.c = c
		slot.mu.Unlock()
	}
	return c, nil
}

type mySession struct {
	db       *sql.DB
	password string
	readOnly bool
	timeout  time.Duration
	version  string
	base     context.Context // cancelled by Close
	stop     context.CancelFunc

	mu     sync.Mutex
	tabs   map[string]*tab
	socks  map[*sockSlot]bool // every live tab socket, closed by Close
	closed bool
}

// tabConn is a tab's connection.
type tabConn struct {
	conn *sql.Conn
	id   int64 // CONNECTION_ID(), the KILL QUERY target
	sock *sockSlot
}

type tab struct {
	mu        sync.Mutex
	c         *tabConn
	cur       *cursor
	stopWatch func() // ends the running statement's cancel watch
}

// cursor is the tab's current statement. A result left open after maxRows
// stays here; in read-only mode its READ ONLY transaction stays open with it.
type cursor struct {
	rows   *sql.Rows // nil for a statement run with Exec
	types  []string  // driver type names, for values.FromMySQL
	cancel context.CancelFunc
	inTx   bool
	// complete marks a read-write statement that may write (Ruling M3-R11):
	// it runs to completion inside its own execute, so "ok" always means
	// committed. Rows past maxRows are counted, not sent, and no cursor stays.
	complete   bool
	pending    []values.Cell // the look-ahead row that proved hasMore
	pendingCut []bool
}

func (s *mySession) ServerVersion() string { return s.version }
func (s *mySession) ReadOnly() bool        { return s.readOnly }

func (s *mySession) getTab(id string) (*tab, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return nil, session.Errorf(session.CodeConnectionLost, "The session is closed.")
	}
	t, ok := s.tabs[id]
	if !ok {
		t = &tab{}
		s.tabs[id] = t
		// One connection per tab, plus one each for introspect and KILL.
		s.db.SetMaxOpenConns(len(s.tabs) + 2)
	}
	return t, nil
}

// dialTab opens a tab connection, reads its id and sets the statement timeout.
func (s *mySession) dialTab(ctx context.Context) (*tabConn, error) {
	slot := &sockSlot{}
	ctx, cancel := context.WithTimeout(context.WithValue(ctx, sockKey{}, slot), connectTimeout)
	defer cancel()
	var c *tabConn
	for attempt := 0; ; attempt++ {
		conn, err := s.db.Conn(ctx)
		if err != nil {
			return nil, s.dialErr(err)
		}
		c = &tabConn{conn: conn, sock: slot}
		if slot.recorded() {
			break
		}
		// database/sql handed over a connection this dial did not open, so
		// its socket is unknown and the socket fallback could not close it.
		discard(c)
		if attempt == 2 {
			return nil, session.Errorf(session.CodeNetwork, "Could not reach the server.")
		}
	}
	conn := c.conn
	var err error
	err = conn.QueryRowContext(ctx, "SELECT CONNECTION_ID()").Scan(&c.id)
	if err == nil && s.timeout > 0 {
		_, err = conn.ExecContext(ctx, "SET SESSION max_execution_time = "+strconv.FormatInt(s.timeout.Milliseconds(), 10))
	}
	if err != nil {
		discard(c)
		return nil, s.dialErr(err)
	}
	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		discard(c)
		return nil, session.Errorf(session.CodeConnectionLost, "The session is closed.")
	}
	s.socks[slot] = true
	s.mu.Unlock()
	return c, nil
}

// drop discards the tab's connection; the next execute redials.
func (s *mySession) drop(t *tab) {
	if t.c == nil {
		return
	}
	s.mu.Lock()
	delete(s.socks, t.c.sock)
	s.mu.Unlock()
	discard(t.c)
	t.c = nil
}

// discard closes c's socket and tells database/sql not to reuse it.
func discard(c *tabConn) {
	c.sock.close()
	c.conn.Raw(func(any) error { return driver.ErrBadConn })
	c.conn.Close()
}

// valid reports whether the driver still considers c usable.
func valid(c *tabConn) bool {
	ok := false
	err := c.conn.Raw(func(dc any) error {
		if v, is := dc.(driver.Validator); is {
			ok = v.IsValid()
		}
		return nil
	})
	return err == nil && ok
}

// killSQL is the statement that stops connection <id>'s running statement.
// Tests replace it to check the socket fallback.
var killSQL = "KILL QUERY "

// kill sends KILL QUERY for connection id from a side connection.
func (s *mySession) kill(id int64) {
	ctx, cancel := context.WithTimeout(context.Background(), killTimeout)
	defer cancel()
	s.db.ExecContext(ctx, killSQL+strconv.FormatInt(id, 10))
}

// watch kills the tab's running statement once ctx is done, repeating
// until the statement ends; after giveUp it closes the tab's socket. The
// watch is stopped (and waited for) by t.stopWatch, before anything else
// runs on the connection, so a KILL never reaches a later statement.
func (s *mySession) watch(ctx context.Context, t *tab) {
	c := t.c
	stop := make(chan struct{})
	finished := make(chan struct{})
	stopAfter := context.AfterFunc(ctx, func() {
		defer close(finished)
		deadline := time.Now().Add(giveUp)
		for {
			s.kill(c.id)
			select {
			case <-stop:
				return
			case <-time.After(killRetry):
			}
			if time.Now().After(deadline) {
				c.sock.close()
				<-stop
				return
			}
		}
	})
	t.stopWatch = func() {
		if !stopAfter() {
			close(stop)
			<-finished
		}
	}
}

func (t *tab) unwatch() {
	if t.stopWatch != nil {
		t.stopWatch()
		t.stopWatch = nil
	}
}

func (s *mySession) Execute(ctx context.Context, tabID, sql string, maxRows int, out *session.Emitter) (session.Summary, error) {
	if s.readOnly {
		if msg := readOnlyRefusal(sql); msg != "" {
			return session.Summary{}, session.Errorf(session.CodeReadOnly, msg)
		}
	}
	t, err := s.getTab(tabID)
	if err != nil {
		return session.Summary{}, err
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	defer t.unwatch()
	// The request may have been cancelled while it waited for the tab, or
	// while the tab's previous cursor closed: then it must not run at all.
	if ctx.Err() != nil {
		return session.Summary{}, cancelled()
	}
	s.closeCursor(t)
	if ctx.Err() != nil {
		return session.Summary{}, cancelled()
	}
	if t.c != nil && !valid(t.c) {
		s.drop(t)
	}
	if t.c == nil {
		c, err := s.dialTab(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return session.Summary{}, cancelled()
			}
			return session.Summary{}, err
		}
		t.c = c
	}

	kw := keyword(sql)
	curCtx, curCancel := context.WithCancel(s.base)
	cur := &cursor{cancel: curCancel, complete: !s.readOnly && !readKeywords[kw]}
	t.cur = cur
	if s.readOnly {
		if _, err := t.c.conn.ExecContext(curCtx, "START TRANSACTION READ ONLY"); err != nil {
			return session.Summary{}, s.abort(ctx, t, sql, err)
		}
		cur.inTx = true
	}
	if ctx.Err() != nil {
		s.finish(t)
		return session.Summary{}, cancelled()
	}
	if s.timeout > 0 && !readKeywords[kw] {
		// max_execution_time bounds only SELECT; bound everything else here.
		// The watch KILLs the statement when the deadline passes.
		limited, cancelLimit := context.WithTimeout(ctx, s.timeout)
		defer func() {
			t.unwatch() // before the deadline's cancel can start a KILL
			cancelLimit()
		}()
		ctx = limited
	}
	s.watch(ctx, t)

	if !queryKeywords[kw] {
		// No result set: Exec gives the affected count.
		res, err := t.c.conn.ExecContext(curCtx, sql)
		if err != nil {
			return session.Summary{}, s.abort(ctx, t, sql, err)
		}
		s.finish(t)
		// In read-only mode nothing is kept, so a cancel that came too late
		// to interrupt is still reported. A read-write statement that
		// finished has committed: report it.
		if s.readOnly && ctx.Err() != nil {
			return session.Summary{}, ctxErr(ctx)
		}
		if err := out.Columns(nil); err != nil {
			return session.Summary{}, err
		}
		n, _ := res.RowsAffected()
		return session.Summary{Affected: &n, Notices: []string{}}, nil
	}

	rows, err := t.c.conn.QueryContext(curCtx, sql)
	if err != nil {
		return session.Summary{}, s.abort(ctx, t, sql, err)
	}
	cur.rows = rows
	cts, err := rows.ColumnTypes()
	if err != nil {
		return session.Summary{}, s.abort(ctx, t, sql, err)
	}
	cols := make([]protocol.Column, len(cts))
	cur.types = make([]string, len(cts))
	for i, ct := range cts {
		cur.types[i] = ct.DatabaseTypeName()
		cols[i] = protocol.Column{Name: ct.Name(), Type: typeName(cur.types[i])}
	}
	if err := out.Columns(cols); err != nil {
		return session.Summary{}, s.abort(ctx, t, sql, err)
	}
	return s.read(ctx, t, sql, maxRows, out)
}

func (s *mySession) FetchMore(ctx context.Context, tabID string, n int, out *session.Emitter) (session.Summary, error) {
	t, err := s.getTab(tabID)
	if err != nil {
		return session.Summary{}, err
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	defer t.unwatch()
	if ctx.Err() != nil {
		return session.Summary{}, cancelled()
	}
	if t.cur == nil || t.cur.rows == nil {
		return session.Summary{}, session.Errorf(session.CodeBadRequest, "No open cursor")
	}
	s.watch(ctx, t)
	return s.read(ctx, t, "", n, out)
}

// scan reads the current row as cells.
func (c *cursor) scan() ([]values.Cell, []bool, error) {
	raw := make([]sql.RawBytes, len(c.types))
	dest := make([]any, len(raw))
	for i := range raw {
		dest[i] = &raw[i]
	}
	if err := c.rows.Scan(dest...); err != nil {
		return nil, nil, err
	}
	cells := make([]values.Cell, len(raw))
	cut := make([]bool, len(raw))
	for i, b := range raw {
		cells[i], cut[i] = values.FromMySQL(c.types[i], b, b == nil)
	}
	return cells, cut, nil
}

// read sends up to n rows from the tab's cursor. When n rows were sent and
// another exists, the cursor stays open; otherwise it is closed.
func (s *mySession) read(ctx context.Context, t *tab, sql string, n int, out *session.Emitter) (session.Summary, error) {
	c := t.cur
	sent := 0
	if c.pending != nil {
		row, cut := c.pending, c.pendingCut
		c.pending, c.pendingCut = nil, nil
		if err := out.Row(row, cut); err != nil {
			return session.Summary{}, s.abort(ctx, t, sql, err)
		}
		sent++
	}
	for sent < n && c.rows.Next() {
		row, cut, err := c.scan()
		if err == nil {
			err = out.Row(row, cut)
		}
		if err != nil {
			return session.Summary{}, s.abort(ctx, t, sql, err)
		}
		sent++
	}
	extra := 0
	if c.complete {
		for c.rows.Next() {
			extra++
		}
	} else if sent == n && c.rows.Next() {
		row, cut, err := c.scan()
		if err != nil {
			return session.Summary{}, s.abort(ctx, t, sql, err)
		}
		if ctx.Err() != nil {
			return session.Summary{}, s.abort(ctx, t, sql, nil)
		}
		c.pending, c.pendingCut = row, cut
		return session.Summary{HasMore: true, Notices: []string{}}, nil
	}
	if err := c.rows.Close(); err != nil {
		return session.Summary{}, s.abort(ctx, t, sql, err)
	}
	if err := c.rows.Err(); err != nil {
		return session.Summary{}, s.abort(ctx, t, sql, err)
	}
	s.finish(t)
	// A KILL QUERY can end a statement without an error (SLEEP returns 1):
	// a statement that was cancelled is reported as cancelled. Statements
	// that may write are read with Exec or complete, never here unread.
	if ctx.Err() != nil && (s.readOnly || !c.complete) {
		return session.Summary{}, ctxErr(ctx)
	}
	sum := session.Summary{Notices: []string{}}
	if extra > 0 {
		sum.Notices = append(sum.Notices, "Showing the first "+strconv.Itoa(sent)+" of "+strconv.Itoa(sent+extra)+" returned rows.")
	}
	return sum, nil
}

// abort ends the tab's statement after err and returns err mapped. A nil err
// means the request was cancelled.
func (s *mySession) abort(ctx context.Context, t *tab, sql string, err error) error {
	t.unwatch()
	if c := t.cur; c != nil && c.rows != nil {
		s.closeRows(t, c)
	}
	mapped := ctxErr(ctx)
	if err != nil {
		mapped = s.execErr(ctx, t, sql, err)
	}
	s.finish(t)
	return mapped
}

func cancelled() error { return session.Errorf(session.CodeCancelled, "Query cancelled.") }

// ctxErr maps a done request context: past the statement timeout (writes,
// Ruling M3-R14) is a timeout, anything else a cancel.
func ctxErr(ctx context.Context) error {
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		return session.Errorf(session.CodeTimeout, "The statement ran past the connection's statement timeout.")
	}
	return cancelled()
}

// closeRows closes c's rows. Rows.Close reads the rest of the result, so the
// statement is killed first; if the close still takes past giveUp, the
// socket is closed and the connection is dropped by finish.
func (s *mySession) closeRows(t *tab, c *cursor) {
	if t.c == nil {
		c.rows.Close()
		return
	}
	deadline := time.Now().Add(giveUp)
	done := make(chan struct{})
	go func() {
		c.rows.Close()
		close(done)
	}()
	select {
	case <-done:
		return
	case <-time.After(5 * time.Millisecond):
	}
	// Still reading: stop the statement on the server.
	s.kill(t.c.id)
	select {
	case <-done:
	case <-time.After(time.Until(deadline)):
		t.c.sock.close()
		<-done
	}
}

// closeCursor ends an open cursor before the tab's next statement. The
// cursor is cancelled, not drained (see closeRows). Only statements that
// cannot write keep cursors (see complete).
func (s *mySession) closeCursor(t *tab) {
	c := t.cur
	if c == nil {
		return
	}
	if c.rows != nil {
		s.closeRows(t, c)
	}
	s.finish(t)
}

// finish drops the cursor, ends its read-only transaction and releases its
// context. The cursor's rows must already be closed.
func (s *mySession) finish(t *tab) {
	t.unwatch()
	c := t.cur
	t.cur = nil
	if t.c != nil && !valid(t.c) {
		s.drop(t)
	}
	if c == nil {
		return
	}
	if c.inTx && t.c != nil {
		// The wrapper must end; if ROLLBACK fails, discard the connection.
		ctx, cancel := context.WithTimeout(context.Background(), cleanupTimeout)
		if _, err := t.c.conn.ExecContext(ctx, "ROLLBACK"); err != nil {
			s.drop(t)
		}
		cancel()
	}
	c.cancel()
}

// execErr maps an execute error. ctx is the request's context.
func (s *mySession) execErr(ctx context.Context, t *tab, sql string, err error) error {
	var se *session.Error
	if errors.As(err, &se) {
		return se
	}
	if ctx.Err() != nil {
		return ctxErr(ctx)
	}
	if s.base.Err() != nil {
		// Close cancels the session's base context: also cancelled.
		return cancelled()
	}
	var me *mysql.MySQLError
	if errors.As(err, &me) {
		return s.myError(me, sql)
	}
	if t.c == nil || !valid(t.c) || errors.Is(err, driver.ErrBadConn) || errors.Is(err, mysql.ErrInvalidConn) {
		return session.Errorf(session.CodeConnectionLost, "The connection to the database was lost.")
	}
	return session.Errorf(session.CodeServer, s.scrub(err.Error()))
}

func (s *mySession) myError(me *mysql.MySQLError, sql string) *session.Error {
	code := session.CodeServer
	switch me.Number {
	case 1064:
		code = session.CodeSyntax
	case 1792, 1290:
		code = session.CodeReadOnly
	case 1045:
		code = session.CodeAuthFailed
	case 3024:
		code = session.CodeTimeout
	}
	// 1317 (interrupted) stays "server": a cancel of this request is mapped
	// before this, so here someone else killed the statement.
	e := &session.Error{ErrorBody: protocol.ErrorBody{Code: code, Message: s.scrub(me.Message)}}
	if me.SQLState != [5]byte{} {
		e.SQLState = string(me.SQLState[:])
	}
	if code == session.CodeSyntax {
		if p := nearPosition(sql, me.Message); p >= 0 {
			e.Position = &p
		}
	}
	return e
}

var nearRe = regexp.MustCompile(`(?s)near '(.*)' at line (\d+)$`)

// nearPosition finds the 0-based character offset of a 1064 error from the
// "near '…' at line N" text, or -1. The near text is the rest of the
// statement from the error, cut to 80 characters.
func nearPosition(sql, msg string) int {
	m := nearRe.FindStringSubmatch(msg)
	if m == nil {
		return -1
	}
	near := m[1]
	if strings.HasSuffix(sql, near) {
		return utf8.RuneCountInString(sql[:len(sql)-len(near)])
	}
	line, _ := strconv.Atoi(m[2])
	start := 0
	for i := 1; i < line; i++ {
		j := strings.IndexByte(sql[start:], '\n')
		if j < 0 {
			break
		}
		start += j + 1
	}
	if i := strings.Index(sql[start:], near); i >= 0 {
		return utf8.RuneCountInString(sql[:start+i])
	}
	return -1
}

// dialErr maps a connect failure. Messages are fixed text or server text,
// never the connection settings.
func (s *mySession) dialErr(err error) error {
	var me *mysql.MySQLError
	if errors.As(err, &me) {
		if me.Number == 1045 {
			return session.Errorf(session.CodeAuthFailed, "The server rejected the user name or password.")
		}
		return s.myError(me, "")
	}
	if isTLSErr(err) {
		return session.Errorf(session.CodeTLSFailed, "The TLS connection to the server failed.")
	}
	if errors.Is(err, context.DeadlineExceeded) || isTimeout(err) {
		return session.Errorf(session.CodeNetwork, "The server did not answer within 10 seconds.")
	}
	return session.Errorf(session.CodeNetwork, "Could not reach the server.")
}

func isTimeout(err error) bool {
	var ne net.Error
	return errors.As(err, &ne) && ne.Timeout()
}

func isTLSErr(err error) bool {
	var (
		cv  *tls.CertificateVerificationError
		rh  tls.RecordHeaderError
		ua  x509.UnknownAuthorityError
		hn  x509.HostnameError
		ci  x509.CertificateInvalidError
		alt tls.AlertError
	)
	if errors.Is(err, mysql.ErrNoTLS) || errors.As(err, &cv) || errors.As(err, &rh) || errors.As(err, &ua) ||
		errors.As(err, &hn) || errors.As(err, &ci) || errors.As(err, &alt) {
		return true
	}
	return strings.Contains(err.Error(), "tls: ")
}

// scrub removes the password from text that came back from the network. It
// replaces only whole tokens (not inside a longer word), and only passwords
// of at least 4 characters, so a short or common password does not mangle
// server messages such as a database name that happens to contain it.
func (s *mySession) scrub(msg string) string {
	pw := s.password
	if len(pw) < 4 {
		return msg
	}
	var b strings.Builder
	for {
		i := strings.Index(msg, pw)
		if i < 0 {
			b.WriteString(msg)
			return b.String()
		}
		end := i + len(pw)
		whole := (i == 0 || !isWordByte(msg[i-1])) && (end == len(msg) || !isWordByte(msg[end]))
		b.WriteString(msg[:i])
		if whole {
			b.WriteString("********")
		} else {
			b.WriteString(pw)
		}
		msg = msg[end:]
	}
}

// readKeywords are first keywords of statements that return rows without
// writing. In read-write mode only these keep a cursor past maxRows; every
// other statement runs to completion first (Ruling M3-R11), including one
// without a first keyword ("").
var readKeywords = map[string]bool{
	"SELECT": true, "WITH": true, "SHOW": true, "VALUES": true, "TABLE": true,
	"EXPLAIN": true, "DESCRIBE": true, "DESC": true, "HELP": true, "(": true,
}

// queryKeywords are the statements run with Query, since they may return a
// result set. Everything else runs with Exec, which reports affected rows.
// A statement without a first keyword ("") may return rows too.
var queryKeywords = map[string]bool{
	"": true, "CALL": true, "CHECK": true, "CHECKSUM": true, "ANALYZE": true, "OPTIMIZE": true,
	"REPAIR": true, "HANDLER": true, "XA": true,
}

func init() {
	for k := range readKeywords {
		queryKeywords[k] = true
	}
}

// refusedReadOnly are first keywords read-only mode refuses besides the
// shared guard's: statements that MySQL runs after an implicit COMMIT,
// outside the READ ONLY transaction, and that change data, schema,
// privileges or server state; and KILL, which ends other sessions' work.
var refusedReadOnly = map[string]bool{
	"KILL":  true,
	"ALTER": true, "ANALYZE": true, "BINLOG": true, "CHANGE": true, "CLONE": true, "CREATE": true,
	"DROP": true, "FLUSH": true, "GRANT": true, "IMPORT": true, "INSTALL": true, "LOAD": true,
	"OPTIMIZE": true, "PURGE": true, "RENAME": true, "REPAIR": true, "RESTART": true, "REVOKE": true,
	"SHUTDOWN": true, "STOP": true, "TRUNCATE": true, "UNINSTALL": true, "UNLOCK": true, "XA": true,
}

// readOnlyRefusal returns the refusal text when read-only mode must refuse
// the statement, and "" otherwise. It fails closed: a statement without a
// first keyword is refused. The keyword is read the way MySQL reads it.
func readOnlyRefusal(sql string) string {
	kw := keyword(sql)
	switch {
	case kw == "CALL":
		// A procedure can COMMIT or run DDL, escaping the READ ONLY wrapper.
		return "Procedures can commit, so CALL needs Read-only off."
	case kw == "" || session.Blocked(kw) || refusedReadOnly[kw]:
		return session.ReadOnlyMessage(kw)
	}
	return ""
}

// keyword returns the statement's first keyword, upper-cased, or "(" for a
// parenthesised statement, the way MySQL reads it: "#" and "--" followed by
// any byte up to 0x20 start line comments, and the body of an executable
// comment ("/*! … */", "/*!80000 … */", MariaDB "/*M! … */") is statement
// text. "" means there is no first word.
func keyword(sql string) string {
	i := 0
	for i < len(sql) {
		c := sql[i]
		switch {
		case c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '\f' || c == '\v' || c == ';':
			i++
		case c == '#' || (strings.HasPrefix(sql[i:], "--") && (i+2 == len(sql) || sql[i+2] <= 0x20)):
			for i < len(sql) && sql[i] != '\n' {
				i++
			}
		case strings.HasPrefix(sql[i:], "/*!") || strings.HasPrefix(sql[i:], "/*M!"):
			i += strings.IndexByte(sql[i:], '!') + 1
			for i < len(sql) && sql[i] >= '0' && sql[i] <= '9' {
				i++
			}
		case strings.HasPrefix(sql[i:], "/*"):
			j := strings.Index(sql[i+2:], "*/")
			if j < 0 {
				return ""
			}
			i += j + 4
		case strings.HasPrefix(sql[i:], "*/"): // the end of an executable comment
			i += 2
		case c == '(':
			return "("
		default:
			j := i
			for j < len(sql) && isWordByte(sql[j]) {
				j++
			}
			return strings.ToUpper(sql[i:j])
		}
	}
	return ""
}

func isWordByte(b byte) bool {
	return b == '_' || (b >= 'a' && b <= 'z') || (b >= 'A' && b <= 'Z') || (b >= '0' && b <= '9')
}

// typeName is the column type shown for a driver type name: lower case, with
// "unsigned" after the type as MySQL writes it ("bigint unsigned").
func typeName(dbType string) string {
	t := strings.ToLower(dbType)
	if rest, ok := strings.CutPrefix(t, "unsigned "); ok {
		return rest + " unsigned"
	}
	if t == "" {
		return "unknown"
	}
	return t
}

func (s *mySession) Close() {
	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		return
	}
	s.closed = true
	tabs := s.tabs
	s.tabs = map[string]*tab{}
	socks := s.socks
	s.socks = map[*sockSlot]bool{}
	s.mu.Unlock()
	s.stop() // cancels running statements and open cursors
	// Closing the sockets makes every running statement and open cursor
	// fail at once instead of reading the rest of its result.
	for sk := range socks {
		sk.close()
	}
	for _, t := range tabs {
		t.mu.Lock()
		t.unwatch()
		if c := t.cur; c != nil {
			if c.rows != nil {
				c.rows.Close()
			}
			c.cancel()
			t.cur = nil
		}
		if t.c != nil {
			discard(t.c)
			t.c = nil
		}
		t.mu.Unlock()
	}
	s.db.Close()
}
