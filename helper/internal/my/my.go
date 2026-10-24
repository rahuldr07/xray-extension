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

// Idle cursors (final review Important 5): a cursor nobody fetched from for
// cursorIdle is closed, ending its read-only transaction. Connect reads these
// once, so a test may replace them first.
var (
	cursorIdle = 60 * time.Second
	sweepEvery = 10 * time.Second
	clock      = time.Now
)

const (
	noMoreRows    = "There are no more rows to fetch. Run the query again."
	cursorExpired = "Cursor expired, run the query again."
	txFailed      = "The transaction had failed and was rolled back."
	txLostMsg     = "The connection to the database was lost, so the open transaction was rolled back."
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
		base: base, stop: stop, tabs: map[string]*tab{}, socks: map[*sockSlot]bool{}, now: clock}
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
	s.mariaDB = strings.Contains(strings.ToLower(version), "mariadb")
	if !s.mariaDB {
		s.version = "MySQL " + version
	}
	go s.sweep(sweepEvery, cursorIdle)
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
	for k, v := range testSessionParams {
		if cfg.Params == nil {
			cfg.Params = map[string]string{}
		}
		cfg.Params[k] = v
	}
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
	mariaDB  bool            // MariaDB executes /*M! … */ comments; MySQL does not
	base     context.Context // cancelled by Close
	stop     context.CancelFunc
	now      func() time.Time

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
	// autocommitOff: @@autocommit is 0 (a server or session default, or SET
	// autocommit = 0), so every statement runs inside a transaction that only
	// COMMIT or ROLLBACK ends (Ruling M3-R28).
	autocommitOff bool
}

type tab struct {
	mu        sync.Mutex
	c         *tabConn
	cur       *cursor
	stopWatch func() // ends the running statement's cancel watch
	// txOpen: the user's transaction was open after the tab's last statement
	// (tracked by txAfter: the driver does not expose the server's flag). If
	// the connection goes while it is, the next statement reports the rollback
	// instead of running on a fresh connection.
	txOpen bool
	// txFailed: the server rolled the transaction back (a deadlock); its
	// COMMIT reports that instead of committing nothing.
	txFailed bool
	expired  bool // the idle sweep closed the tab's cursor
	gone     bool // CloseTab removed the tab
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
	last       time.Time // when the cursor last sent rows, for the idle sweep
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
	if err == nil && s.readOnly {
		// The server enforces read-only too, beneath the per-statement READ
		// ONLY wrapper: a statement that commits implicitly (DDL, a CALL that
		// COMMITs) starts its next transaction read-only (Ruling M3-R15).
		_, err = conn.ExecContext(ctx, "SET SESSION transaction_read_only = ON")
	}
	if err == nil && s.timeout > 0 {
		_, err = conn.ExecContext(ctx, "SET SESSION max_execution_time = "+strconv.FormatInt(s.timeout.Milliseconds(), 10))
	}
	if err == nil && !s.readOnly {
		err = readAutocommit(ctx, c)
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

// readAutocommit records whether the connection's @@autocommit is 0.
func readAutocommit(ctx context.Context, c *tabConn) error {
	var on int
	if err := c.conn.QueryRowContext(ctx, "SELECT @@autocommit").Scan(&on); err != nil {
		return err
	}
	c.autocommitOff = on == 0
	return nil
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

// testSessionParams are session variables a test sets at connect (the driver
// sends each as SET), standing in for a server default such as autocommit=0.
var testSessionParams map[string]string

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

func (s *mySession) Execute(ctx context.Context, tabID, sql string, maxRows int, out *session.Emitter) (sum session.Summary, err error) {
	if s.readOnly {
		if msg := s.ReadOnlyRefusal(sql); msg != "" {
			return session.Summary{}, session.Errorf(session.CodeReadOnly, msg)
		}
	}
	t, err := s.getTab(tabID)
	if err != nil {
		return session.Summary{}, err
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	defer s.errTx(t, &sum, &err)
	defer t.unwatch()
	// The request may have been cancelled while it waited for the tab, or
	// while the tab's previous cursor closed: then it must not run at all.
	if ctx.Err() != nil || t.gone {
		return session.Summary{}, cancelled()
	}
	s.closeCursor(t)
	if ctx.Err() != nil {
		return session.Summary{}, cancelled()
	}
	t.expired = false
	if t.c != nil && !valid(t.c) {
		s.drop(t)
	}
	if t.c == nil && t.txOpen {
		// The connection went (a cursor or cancel that had to close the
		// socket, a network failure) inside the user's transaction, so the
		// server rolled it back. Say so rather than run this statement,
		// perhaps the COMMIT, on a fresh connection where it would succeed.
		t.txOpen, t.txFailed = false, false
		return session.Summary{}, session.Errorf(session.CodeServer, txLostMsg)
	}
	kw := keyword(sql, s.mariaDB)
	if t.txFailed && kw == "COMMIT" {
		t.txFailed = false
		return session.Summary{}, session.Errorf(session.CodeServer, txFailed)
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
	if s.timeout > 0 && !deadlineFree[kw] {
		// max_execution_time bounds only SELECT; bound everything else here,
		// including WITH … UPDATE and statements without a known keyword.
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
		return session.Summary{Affected: &n, Notices: []string{}, InTransaction: s.noteTx(t, sql)}, nil
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

func (s *mySession) FetchMore(ctx context.Context, tabID string, n int, out *session.Emitter) (sum session.Summary, err error) {
	t, err := s.getTab(tabID)
	if err != nil {
		return session.Summary{}, err
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	defer s.errTx(t, &sum, &err)
	defer t.unwatch()
	if ctx.Err() != nil || t.gone {
		return session.Summary{}, cancelled()
	}
	if t.cur == nil || t.cur.rows == nil {
		if t.expired {
			return session.Summary{}, session.Errorf(session.CodeServer, cursorExpired)
		}
		return session.Summary{}, session.Errorf(session.CodeBadRequest, noMoreRows)
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
		c.last = s.now()
		return session.Summary{HasMore: true, Notices: []string{}, InTransaction: s.noteTx(t, "")}, nil
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
	sum := session.Summary{Notices: []string{}, InTransaction: s.noteTx(t, sql)}
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
	var me *mysql.MySQLError
	switch {
	case errors.As(err, &me) && me.Number == 1213 && t.txOpen:
		// A deadlock rolls the whole transaction back.
		t.txOpen, t.txFailed = false, true
	case !s.readOnly && t.c != nil && t.c.autocommitOff:
		// With autocommit off the failed statement still began a transaction.
		t.txOpen = true
	}
	return mapped
}

// errTx gives an error answer the tab's transaction state, so the page's
// view of it does not go stale (Ruling M3-R28).
func (s *mySession) errTx(t *tab, sum *session.Summary, err *error) {
	if *err != nil {
		*sum = session.Summary{InTransaction: !s.readOnly && t.txOpen}
	}
}

// noteTx records the user's transaction state after a statement that
// succeeded ("" for one that leaves it as it was) and returns it.
func (s *mySession) noteTx(t *tab, sql string) bool {
	if s.readOnly {
		return false
	}
	if sql != "" {
		was := t.txOpen
		next := txAfter(was, sql, s.mariaDB)
		if t.c != nil && strings.Contains(strings.ToUpper(sql), "AUTOCOMMIT") {
			ctx, cancel := context.WithTimeout(context.Background(), cleanupTimeout)
			if readAutocommit(ctx, t.c) != nil {
				s.drop(t) // the state is unknown: start afresh, and report a lost transaction
			}
			cancel()
		}
		if t.c != nil && t.c.autocommitOff && !endsChain(sql, s.mariaDB) {
			next = true
		}
		t.txOpen = next
		if t.txOpen != was || endsTx(sql, s.mariaDB) {
			t.txFailed = false
		}
	} else if t.c != nil && t.c.autocommitOff {
		t.txOpen = true
	}
	return t.txOpen
}

// endsChain reports COMMIT or ROLLBACK (not ROLLBACK TO a savepoint) without
// AND CHAIN: with autocommit off, only these leave no transaction open.
func endsChain(sql string, mariaDB bool) bool {
	w := words(sql, mariaDB, 6)
	if len(w) == 0 || (w[0] != "COMMIT" && w[0] != "ROLLBACK") {
		return false
	}
	chain, no := false, false
	for _, x := range w[1:] {
		switch x {
		case "TO":
			return false
		case "CHAIN":
			chain = true
		case "NO":
			no = true
		}
	}
	return !chain || no
}

// implicitCommit are first keywords of statements that commit the open
// transaction before they run (MySQL "Statements That Cause an Implicit
// Commit"; CREATE/DROP TEMPORARY TABLE excepted).
var implicitCommit = map[string]bool{
	"ALTER": true, "CREATE": true, "DROP": true, "RENAME": true, "TRUNCATE": true, "GRANT": true,
	"REVOKE": true, "LOCK": true, "ANALYZE": true, "OPTIMIZE": true, "REPAIR": true, "FLUSH": true,
	"CACHE": true, "INSTALL": true, "UNINSTALL": true, "RESET": true, "IMPORT": true, "CHANGE": true,
	"STOP": true, "XA": true,
}

// words returns up to n leading words of sql, upper-cased, read as keyword
// reads them (comments skipped); it stops at the first other byte.
func words(sql string, mariaDB bool, n int) []string {
	var out []string
	i := 0
	for i < len(sql) && len(out) < n {
		c := sql[i]
		switch {
		case c <= 0x20 || c == ';':
			i++
		case commentEnd(sql, i, mariaDB) >= 0:
			i = commentEnd(sql, i, mariaDB)
		case isWordByte(c):
			j := i
			for j < len(sql) && isWordByte(sql[j]) {
				j++
			}
			out = append(out, strings.ToUpper(sql[i:j]))
			i = j
		default:
			return out
		}
	}
	return out
}

// txAfter is whether the user's transaction is open after sql succeeded,
// given whether it was open before. MySQL's driver keeps the server's
// SERVER_STATUS_IN_TRANS flag private, so this follows the statements:
// BEGIN and START TRANSACTION open one; COMMIT and ROLLBACK end it (unless AND
// CHAIN, or ROLLBACK TO a savepoint); statements that commit implicitly end
// it. With autocommit off (read at dial and after a statement that mentions
// it) noteTx keeps the transaction open until COMMIT or ROLLBACK. Known gap: a
// transaction the server rolls back on an error other than a deadlock.
func txAfter(open bool, sql string, mariaDB bool) bool {
	w := words(sql, mariaDB, 6)
	if len(w) == 0 {
		return open
	}
	has := func(word string) bool {
		for _, x := range w[1:] {
			if x == word {
				return true
			}
		}
		return false
	}
	switch w[0] {
	case "BEGIN":
		return true
	case "START":
		return len(w) > 1 && w[1] == "TRANSACTION"
	case "COMMIT", "ROLLBACK":
		if w[0] == "ROLLBACK" && has("TO") {
			return open
		}
		return has("CHAIN") && !has("NO")
	case "CREATE", "DROP":
		if len(w) > 1 && w[1] == "TEMPORARY" {
			return open
		}
		return false
	case "SET":
		if strings.Contains(strings.ToUpper(sql), "AUTOCOMMIT") {
			return false
		}
		return open
	}
	if implicitCommit[w[0]] {
		return false
	}
	return open
}

// endsTx reports a statement that ends or starts a transaction whatever the
// tracked state was (it clears a reported failure).
func endsTx(sql string, mariaDB bool) bool {
	w := words(sql, mariaDB, 1)
	return len(w) == 1 && (w[0] == "BEGIN" || w[0] == "START" || w[0] == "ROLLBACK" || w[0] == "COMMIT")
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
//
// Unlike Postgres, this is safe inside the user's transaction: KILL QUERY
// ends only the SELECT, and the transaction stays open. If the socket has to
// be closed instead (giveUp), the transaction is lost with the connection;
// the next statement reports that (see Execute).
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

// deadlineFree are the first keywords whose statements cannot write; the
// server's max_execution_time bounds them. Every other statement gets the
// statement timeout as a client deadline (Ruling M3-R14, M3-R15).
var deadlineFree = map[string]bool{"SELECT": true, "VALUES": true, "TABLE": true, "SHOW": true}

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

// guardDisabled switches the statement guard off, so a test can show the
// server's own read-only enforcement.
var guardDisabled bool

// ReadOnlyRefusal is the MySQL read-only guard; Ops uses it in place of the
// shared session.Guard (session.ReadOnlyGuard).
func (s *mySession) ReadOnlyRefusal(sql string) string {
	if guardDisabled {
		return ""
	}
	return readOnlyRefusal(sql, s.mariaDB)
}

const fileWriteMsg = "Writing files on the server needs Read-only off."

// writesFile reports SELECT/TABLE … INTO OUTFILE/DUMPFILE, which writes a
// file on the server even inside a READ ONLY transaction (Rulings M3-R16,
// M3-R17). It matches on a normalized token stream: comments removed, every
// byte up to 0x20 a separator, words compared case-insensitively.
//
// Removing comments needs to know where string literals are (a "/*" inside
// a string is not a comment), and that depends on server modes
// (NO_BACKSLASH_ESCAPES, ANSI_QUOTES). So the statement is read under every
// combination, and any reading that finds INTO OUTFILE/DUMPFILE refuses it.
// The words of a string literal's contents count too (fail closed).
func writesFile(sql string, mariaDB bool) bool {
	// The readings differ only in how a backslash inside a literal is read.
	if !strings.Contains(sql, "\\") {
		return intoFile(sql, mariaDB, lexMode{})
	}
	for _, m := range []lexMode{{true, true}, {true, false}, {false, true}, {false, false}} {
		if intoFile(sql, mariaDB, m) {
			return true
		}
	}
	return false
}

// lexMode says whether a backslash escapes the next byte inside '…' and
// "…" literals.
type lexMode struct{ singleBackslash, doubleBackslash bool }

// intoFile reads sql under one lexMode. It relies on the version-comment
// refusal that readOnlyRefusal applies right after it: commentEnd does not
// skip an executable comment ("/*!", "/*M!" on MariaDB), so its body is read
// here as ordinary tokens, and whatever this reading gets wrong about such a
// body never runs, because any statement holding one is refused next.
func intoFile(sql string, mariaDB bool, m lexMode) bool {
	prevInto := false
	// word takes one token and reports whether it ends INTO OUTFILE/DUMPFILE.
	word := func(tok string) bool {
		hit := prevInto && (strings.EqualFold(tok, "OUTFILE") || strings.EqualFold(tok, "DUMPFILE"))
		prevInto = strings.EqualFold(tok, "INTO")
		return hit
	}
	i := 0
	for i < len(sql) {
		c := sql[i]
		if c <= 0x20 {
			i++
			continue
		}
		if c == '#' || c == '-' || c == '/' {
			if e := commentEnd(sql, i, mariaDB); e >= 0 {
				i = e
				continue
			}
		}
		if c == '\'' || c == '"' || c == '`' {
			bs := (c == '\'' && m.singleBackslash) || (c == '"' && m.doubleBackslash)
			end := quotedEnd(sql, i, bs)
			prevInto = false // the opening quote is a token
			// The literal's words count as tokens too (fail closed).
			for j := i + 1; j < end; {
				for j < end && literalSep(sql[j]) {
					j++
				}
				k := j
				for k < end && !literalSep(sql[k]) {
					k++
				}
				if k > j && word(sql[j:k]) {
					return true
				}
				j = k
			}
			prevInto = false // the closing quote is a token
			i = end
			continue
		}
		j := i
		for j < len(sql) && isTokenByte(sql[j]) {
			j++
		}
		if j == i {
			prevInto = false // one punctuation byte
			i++
			continue
		}
		if word(sql[i:j]) {
			return true
		}
		i = j
	}
	return false
}

// literalSep separates the words read inside a literal.
func literalSep(b byte) bool { return b <= 0x20 || b == '\'' || b == '"' || b == '`' }

// quotedEnd returns the index just past the literal that opens at sql[i]. A
// doubled quote stays inside; with backslash, "\x" does too. An unclosed
// literal runs to the end.
func quotedEnd(sql string, i int, backslash bool) int {
	q := sql[i]
	for j := i + 1; j < len(sql); j++ {
		switch {
		case backslash && sql[j] == '\\':
			j++
		case sql[j] == q && j+1 < len(sql) && sql[j+1] == q:
			j++
		case sql[j] == q:
			return j + 1
		}
	}
	return len(sql)
}

// commentEnd returns the index just past the comment that starts at sql[i],
// or -1 when none starts there. "#" and "--" plus a byte up to 0x20 run to
// the end of the line. Executable comments ("/*!", and "/*M!" on MariaDB)
// are not comments: their body may run.
func commentEnd(sql string, i int, mariaDB bool) int {
	switch {
	case sql[i] == '#' || (strings.HasPrefix(sql[i:], "--") && (i+2 == len(sql) || sql[i+2] <= 0x20)):
		if j := strings.IndexByte(sql[i:], '\n'); j >= 0 {
			return i + j + 1
		}
		return len(sql)
	case strings.HasPrefix(sql[i:], "/*!") || (mariaDB && strings.HasPrefix(sql[i:], "/*M!")):
		return -1
	case strings.HasPrefix(sql[i:], "/*"):
		if j := strings.Index(sql[i+2:], "*/"); j >= 0 {
			return i + j + 4
		}
		return len(sql)
	}
	return -1
}

// isTokenByte is a byte of an unquoted MySQL word: ASCII letters, digits,
// "_", "$", and every byte of a multibyte character (MySQL identifiers may
// hold them, so "into\u00a0outfile" is one word).
func isTokenByte(b byte) bool { return isWordByte(b) || b == '$' || b >= 0x80 }

const versionCommentMsg = "Version comments (/*! … */) are not allowed with Read-only on."

// readOnlyRefusal returns the refusal text when read-only mode must refuse
// the statement, and "" otherwise. It fails closed:
//   - any executable comment, anywhere (even inside a string literal), is
//     refused: the server may or may not run its body, by version, so the
//     guard cannot know what runs (Ruling M3-R15);
//   - a statement without a first keyword is refused;
//   - INTO OUTFILE/DUMPFILE, which writes server files, is refused.
//
// The keyword is read the way MySQL reads it.
func readOnlyRefusal(sql string, mariaDB bool) string {
	if writesFile(sql, mariaDB) {
		return fileWriteMsg
	}
	if strings.Contains(sql, "/*!") || (mariaDB && strings.Contains(sql, "/*M!")) {
		return versionCommentMsg
	}
	kw := keyword(sql, mariaDB)
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
// any byte up to 0x20 start line comments. "" means there is no first word,
// or an executable comment ("/*!…", and "/*M!…" on MariaDB) comes before it:
// whether the server runs its body depends on the version, so the statement
// is treated as unknown (run to completion, under the write deadline).
// MySQL reads "/*M! … */" as a plain comment.
func keyword(sql string, mariaDB bool) string {
	i := 0
	for i < len(sql) {
		c := sql[i]
		switch {
		case c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '\f' || c == '\v' || c == ';':
			i++
		case commentEnd(sql, i, mariaDB) >= 0:
			i = commentEnd(sql, i, mariaDB)
		case strings.HasPrefix(sql[i:], "/*!") || (mariaDB && strings.HasPrefix(sql[i:], "/*M!")):
			return ""
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

// sweep closes cursors left idle for idle, checking every every, until the
// session closes. A tab busy with a request is skipped, and so is a cursor in
// the user's transaction, which holds its locks whether or not the cursor
// stays (and closing it could cost the transaction, see closeCursor).
func (s *mySession) sweep(every, idle time.Duration) {
	tick := time.NewTicker(every)
	defer tick.Stop()
	for {
		select {
		case <-s.base.Done():
			return
		case <-tick.C:
		}
		s.mu.Lock()
		tabs := make([]*tab, 0, len(s.tabs))
		for _, t := range s.tabs {
			tabs = append(tabs, t)
		}
		s.mu.Unlock()
		for _, t := range tabs {
			if !t.mu.TryLock() {
				continue
			}
			if c := t.cur; c != nil && c.rows != nil && s.now().Sub(c.last) >= idle && !(t.txOpen && !s.readOnly) {
				s.closeCursor(t)
				t.expired = true
			}
			t.mu.Unlock()
		}
	}
}

// CloseTab closes the tab's cursor and connection (the editor tab closed).
// The server rolls back a transaction left open on it.
func (s *mySession) CloseTab(id string) {
	s.mu.Lock()
	t, ok := s.tabs[id]
	delete(s.tabs, id)
	if ok {
		s.db.SetMaxOpenConns(len(s.tabs) + 2)
	}
	s.mu.Unlock()
	if !ok {
		return
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	t.gone = true
	t.unwatch()
	if t.c != nil {
		// Closing the socket first makes an open result fail at once.
		t.c.sock.close()
	}
	if c := t.cur; c != nil {
		if c.rows != nil {
			c.rows.Close()
		}
		c.cancel()
		t.cur = nil
	}
	s.drop(t)
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
