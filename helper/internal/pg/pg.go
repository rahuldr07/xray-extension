// Package pg is the Postgres driver: one *pgx.Conn per (session, tab), no
// pool, no statement cache, and read-only enforced by wrapping each statement
// in a READ ONLY transaction so it holds through transaction poolers.
package pg

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"net"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgconn/ctxwatch"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
	"github.com/rahuldr07/xray-extension/helper/internal/session"
	"github.com/rahuldr07/xray-extension/helper/internal/values"
)

const (
	connectTimeout = 10 * time.Second
	// cleanupTimeout bounds ROLLBACK and Close, which run on a fresh context.
	cleanupTimeout = 5 * time.Second
	// deadlineDelay is how long a cancelled query (or a cursor being closed)
	// may take to stop after the cancel request before the socket deadline
	// gives up on the connection; the next execute then redials.
	deadlineDelay = 2 * time.Second
)

// Connect dials the probe connection, reads the server version and returns
// the session. Tab connections are dialled on each tab's first execute.
func Connect(ctx context.Context, p session.Params) (session.Session, error) {
	cfg, err := buildConfig(p)
	if err != nil {
		return nil, err
	}
	base, stop := context.WithCancel(context.Background())
	s := &pgSession{cfg: cfg, password: p.Password, readOnly: p.ReadOnly, base: base, stop: stop, tabs: map[string]*tab{}}
	probe, err := s.dial(ctx)
	if err != nil && p.StatementTimeout > 0 && refusedStartupParam(err) {
		// Transaction poolers (PgBouncer, Supavisor) refuse statement_timeout
		// as a startup parameter, and a session SET would not survive them.
		// Enforce the limit here instead: each statement's context gets a
		// deadline, and pgx sends a cancel request when it passes.
		delete(s.cfg.RuntimeParams, "statement_timeout")
		s.clientTimeout = p.StatementTimeout
		probe, err = s.dial(ctx)
	}
	if err != nil {
		stop()
		return nil, s.dialErr(err)
	}
	s.probe = probe
	if err := probe.conn.QueryRow(ctx, "SELECT version()").Scan(&s.version); err != nil {
		e := s.connErr(ctx, err)
		s.Close()
		return nil, e
	}
	return s, nil
}

// buildConfig turns Params into a pgx config without a connection string, so
// the password is never formatted into text.
func buildConfig(p session.Params) (*pgx.ConnConfig, error) {
	if p.TLS == "disable" && !session.IsLoopback(p.Host) {
		return nil, session.Errorf(session.CodeTLSFailed, session.TLSRequiredMessage)
	}
	cfg, err := pgx.ParseConfig("")
	if err != nil {
		return nil, session.Errorf(session.CodeBadRequest, "Invalid connection settings.")
	}
	host := strings.TrimSuffix(strings.TrimPrefix(p.Host, "["), "]")
	port := p.Port
	if port == 0 {
		port = 5432
	}
	cfg.Host = host
	cfg.Port = uint16(port)
	cfg.Database = p.Database
	cfg.User = p.User
	cfg.Password = p.Password
	cfg.Fallbacks = nil
	cfg.ConnectTimeout = connectTimeout
	cfg.DefaultQueryExecMode = pgx.QueryExecModeExec
	cfg.StatementCacheCapacity = 0
	cfg.DescriptionCacheCapacity = 0
	cfg.RuntimeParams = map[string]string{}
	if p.StatementTimeout > 0 {
		cfg.RuntimeParams["statement_timeout"] = strconv.FormatInt(p.StatementTimeout.Milliseconds(), 10)
	}
	cfg.BuildContextWatcherHandler = func(c *pgconn.PgConn) ctxwatch.Handler {
		return &pgconn.CancelRequestContextWatcherHandler{Conn: c, DeadlineDelay: deadlineDelay}
	}
	switch p.TLS {
	case "disable":
		cfg.TLSConfig = nil
	case "require":
		// Encryption without certificate checks, as libpq sslmode=require.
		cfg.TLSConfig = &tls.Config{InsecureSkipVerify: true, ServerName: host}
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
		cfg.TLSConfig = tc
	}
	return cfg, nil
}

type pgSession struct {
	cfg      *pgx.ConnConfig
	password string
	readOnly bool
	// clientTimeout is the statement timeout enforced by the helper when the
	// server refused it as a startup parameter; zero otherwise.
	clientTimeout time.Duration
	version       string
	base          context.Context // cancelled by Close
	stop          context.CancelFunc

	probeMu sync.Mutex
	probe   *tabConn

	// types caches format_type names by OID. OIDs are database-wide, so one
	// cache serves every connection of the session.
	typesMu sync.Mutex
	types   map[uint32]string

	mu     sync.Mutex
	tabs   map[string]*tab
	closed bool
}

// tabConn is a connection and the notices it has collected.
type tabConn struct {
	conn    *pgx.Conn
	mu      sync.Mutex
	notices []string
}

func (c *tabConn) takeNotices() []string {
	c.mu.Lock()
	defer c.mu.Unlock()
	n := c.notices
	c.notices = nil
	return n
}

type tab struct {
	mu  sync.Mutex
	c   *tabConn
	cur *cursor
}

// cursor is a result left open after maxRows. In read-only mode its READ ONLY
// transaction stays open with it.
type cursor struct {
	rows   pgx.Rows
	cancel context.CancelFunc
	inTx   bool
	// drain marks a read-write cursor over a statement that may write: it is
	// read to the end when the tab moves on, so its write still commits.
	drain      bool
	pending    []values.Cell // the look-ahead row that proved hasMore
	pendingCut []bool
}

func (s *pgSession) ServerVersion() string { return s.version }
func (s *pgSession) ReadOnly() bool        { return s.readOnly }

func (s *pgSession) dial(ctx context.Context) (*tabConn, error) {
	tc := &tabConn{}
	cfg := s.cfg.Copy()
	cfg.OnNotice = func(_ *pgconn.PgConn, n *pgconn.Notice) {
		tc.mu.Lock()
		tc.notices = append(tc.notices, n.Message)
		tc.mu.Unlock()
	}
	ctx, cancel := context.WithTimeout(ctx, connectTimeout)
	defer cancel()
	conn, err := pgx.ConnectConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	tc.conn = conn
	return tc, nil
}

func (s *pgSession) getTab(id string) (*tab, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return nil, session.Errorf(session.CodeConnectionLost, "The session is closed.")
	}
	t, ok := s.tabs[id]
	if !ok {
		t = &tab{}
		s.tabs[id] = t
	}
	return t, nil
}

func (s *pgSession) Execute(ctx context.Context, tabID, sql string, maxRows int, out *session.Emitter) (session.Summary, error) {
	t, err := s.getTab(tabID)
	if err != nil {
		return session.Summary{}, err
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	// The request may have been cancelled while it waited for the tab, or
	// while the tab's previous cursor closed: then it must not run at all.
	if ctx.Err() != nil {
		return session.Summary{}, cancelled()
	}
	s.closeCursor(ctx, t)
	if ctx.Err() != nil {
		return session.Summary{}, cancelled()
	}
	if t.c == nil || t.c.conn.IsClosed() {
		t.c = nil
		c, err := s.dial(ctx)
		if err != nil {
			return session.Summary{}, s.dialErr(err)
		}
		t.c = c
	}
	t.c.takeNotices()

	ctx, cancelLimit := s.limit(ctx)
	defer cancelLimit()
	curCtx, curCancel := context.WithCancel(s.base)
	stopWatch := context.AfterFunc(ctx, curCancel)
	defer stopWatch()
	cur := &cursor{cancel: curCancel, drain: !s.readOnly && !readsOnly(sql)}
	if s.readOnly {
		if _, err := t.c.conn.Exec(curCtx, "BEGIN TRANSACTION READ ONLY"); err != nil {
			curCancel()
			return session.Summary{}, s.execErr(ctx, t, err)
		}
		cur.inTx = true
	}
	// Exec mode with no arguments: one unnamed extended-protocol statement,
	// text format for every column, nothing prepared that a pooler could lose.
	rows, err := t.c.conn.Query(curCtx, sql, pgx.QueryResultFormats{pgx.TextFormatCode})
	if err != nil {
		cur.rows = rows
		t.cur = cur
		return session.Summary{}, s.abort(ctx, t, err)
	}
	cur.rows = rows
	t.cur = cur
	fields := rows.FieldDescriptions()
	names := s.typeNames(ctx, fields)
	cols := make([]protocol.Column, len(fields))
	for i, f := range fields {
		cols[i] = protocol.Column{Name: f.Name, Type: names[i]}
	}
	if err := out.Columns(cols); err != nil {
		return session.Summary{}, s.abort(ctx, t, err)
	}
	return s.read(ctx, t, maxRows, out)
}

func (s *pgSession) FetchMore(ctx context.Context, tabID string, n int, out *session.Emitter) (session.Summary, error) {
	t, err := s.getTab(tabID)
	if err != nil {
		return session.Summary{}, err
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	if ctx.Err() != nil {
		return session.Summary{}, cancelled()
	}
	if t.cur == nil {
		return session.Summary{}, session.Errorf(session.CodeBadRequest, "No open cursor")
	}
	ctx, cancelLimit := s.limit(ctx)
	defer cancelLimit()
	stopWatch := context.AfterFunc(ctx, t.cur.cancel)
	defer stopWatch()
	return s.read(ctx, t, n, out)
}

func mapRow(fields []pgconn.FieldDescription, raw [][]byte) ([]values.Cell, []bool) {
	cells := make([]values.Cell, len(raw))
	cut := make([]bool, len(raw))
	for i, b := range raw {
		cells[i], cut[i] = values.FromPG(fields[i].DataTypeOID, b, b == nil)
	}
	return cells, cut
}

// read sends up to n rows from the tab's cursor. When n rows were sent and
// another exists, the cursor stays open; otherwise it is closed.
func (s *pgSession) read(ctx context.Context, t *tab, n int, out *session.Emitter) (session.Summary, error) {
	c := t.cur
	fields := c.rows.FieldDescriptions()
	sent := 0
	if c.pending != nil {
		row, cut := c.pending, c.pendingCut
		c.pending, c.pendingCut = nil, nil
		if err := out.Row(row, cut); err != nil {
			return session.Summary{}, s.abort(ctx, t, err)
		}
		sent++
	}
	for sent < n && c.rows.Next() {
		row, cut := mapRow(fields, c.rows.RawValues())
		if err := out.Row(row, cut); err != nil {
			return session.Summary{}, s.abort(ctx, t, err)
		}
		sent++
	}
	if sent == n && c.rows.Next() {
		c.pending, c.pendingCut = mapRow(fields, c.rows.RawValues())
		return session.Summary{HasMore: true, Notices: t.c.takeNotices()}, nil
	}
	c.rows.Close()
	if err := c.rows.Err(); err != nil {
		return session.Summary{}, s.abort(ctx, t, err)
	}
	tag := c.rows.CommandTag()
	s.finish(t)
	sum := session.Summary{Notices: t.c.takeNotices()}
	if !tag.Select() {
		n := tag.RowsAffected()
		sum.Affected = &n
	}
	return sum, nil
}

// abort ends the tab's cursor after err and returns err mapped.
func (s *pgSession) abort(ctx context.Context, t *tab, err error) error {
	if c := t.cur; c != nil && c.rows != nil {
		c.rows.Close()
		if err == nil {
			err = c.rows.Err()
		}
	}
	mapped := s.execErr(ctx, t, err)
	s.finish(t)
	return mapped
}

func cancelled() error { return session.Errorf(session.CodeCancelled, "Query cancelled.") }

// readOnlyFirst are first keywords whose statements return rows without
// writing, so an unfinished cursor over them can be cancelled safely.
var readOnlyFirst = map[string]bool{"SELECT": true, "VALUES": true, "TABLE": true, "SHOW": true, "FETCH": true}

func readsOnly(sql string) bool { return readOnlyFirst[session.FirstKeyword(sql)] }

// closeCursor ends an open cursor before the tab's next statement. ctx is the
// next statement's request.
//
// A cursor is normally cancelled, not drained: cancelling its context makes
// pgx send a protocol cancel request and set a socket deadline, so Close
// returns at once, or within deadlineDelay with the connection closed (the
// next execute redials). A read-write cursor over a statement that may write
// is drained instead, so its write commits; ctx can still cancel that drain.
func (s *pgSession) closeCursor(ctx context.Context, t *tab) {
	c := t.cur
	if c == nil {
		return
	}
	if c.drain {
		stop := context.AfterFunc(ctx, c.cancel)
		c.rows.Close()
		stop()
	} else {
		c.cancel()
		c.rows.Close()
	}
	s.finish(t)
}

// finish drops the cursor, ends its read-only transaction and releases its
// context. The cursor's rows must already be closed.
func (s *pgSession) finish(t *tab) {
	c := t.cur
	t.cur = nil
	if c == nil {
		return
	}
	if c.inTx && t.c != nil && !t.c.conn.IsClosed() {
		// The wrapper must end; if ROLLBACK fails, discard the connection.
		ctx, cancel := context.WithTimeout(context.Background(), cleanupTimeout)
		if _, err := t.c.conn.Exec(ctx, "ROLLBACK"); err != nil {
			closeConn(t.c.conn)
		}
		cancel()
	}
	c.cancel()
	if t.c != nil && t.c.conn.IsClosed() {
		t.c = nil
	}
}

// limit applies clientTimeout, when set, to one execute or fetchMore.
func (s *pgSession) limit(ctx context.Context) (context.Context, context.CancelFunc) {
	if s.clientTimeout > 0 {
		return context.WithTimeout(ctx, s.clientTimeout)
	}
	return ctx, func() {}
}

// execErr maps an execute error. ctx is the request's context; it has a
// deadline only for clientTimeout, so DeadlineExceeded means a timeout.
func (s *pgSession) execErr(ctx context.Context, t *tab, err error) error {
	var se *session.Error
	if errors.As(err, &se) {
		return se
	}
	if err := ctx.Err(); err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return session.Errorf(session.CodeTimeout, "The statement ran past the connection's statement timeout.")
		}
		return cancelled()
	}
	// Close cancels the session's base context: report that as cancelled.
	if s.base.Err() != nil {
		return cancelled()
	}
	// A FATAL server error (such as an admin shutdown) also closes the
	// connection, so check the connection before mapping the server error.
	if t.c == nil || t.c.conn.IsClosed() {
		return session.Errorf(session.CodeConnectionLost, "The connection to the database was lost.")
	}
	var pe *pgconn.PgError
	if errors.As(err, &pe) {
		return pgError(pe)
	}
	return session.Errorf(session.CodeServer, s.scrub(err.Error()))
}

func pgError(pe *pgconn.PgError) *session.Error {
	code := session.CodeServer
	switch {
	case pe.Code == "25006":
		code = session.CodeReadOnly
	case pe.Code == "42601":
		code = session.CodeSyntax
	case pe.Code == "57014":
		code = session.CodeTimeout
	case pe.Code == "28P01" || pe.Code == "28000":
		code = session.CodeAuthFailed
	}
	e := &session.Error{ErrorBody: protocol.ErrorBody{
		Code: code, Message: pe.Message, SQLState: pe.Code, Hint: pe.Hint, Detail: pe.Detail,
	}}
	if pe.Position > 0 {
		p := int(pe.Position) - 1
		e.Position = &p
	}
	return e
}

// refusedStartupParam reports PgBouncer's "unsupported startup parameter".
func refusedStartupParam(err error) bool {
	var pe *pgconn.PgError
	return errors.As(err, &pe) && pe.Code == "08P01" && strings.Contains(pe.Message, "unsupported startup parameter")
}

// dialErr maps a connect failure. Messages are fixed text or server text,
// never the connection settings.
func (s *pgSession) dialErr(err error) error {
	var pe *pgconn.PgError
	if errors.As(err, &pe) {
		if pe.Code == "28P01" || pe.Code == "28000" {
			return session.Errorf(session.CodeAuthFailed, "The server rejected the user name or password.")
		}
		e := pgError(pe)
		e.Message = s.scrub(e.Message)
		return e
	}
	if isTLSErr(err) {
		return session.Errorf(session.CodeTLSFailed, "The TLS connection to the server failed.")
	}
	if errors.Is(err, context.DeadlineExceeded) || isTimeout(err) {
		return session.Errorf(session.CodeNetwork, "The server did not answer within 10 seconds.")
	}
	return session.Errorf(session.CodeNetwork, "Could not reach the server.")
}

// connErr maps an error on the probe connection right after dialling.
func (s *pgSession) connErr(ctx context.Context, err error) error {
	var pe *pgconn.PgError
	if errors.As(err, &pe) {
		return pgError(pe)
	}
	if ctx.Err() != nil {
		return session.Errorf(session.CodeCancelled, "Connect cancelled.")
	}
	return session.Errorf(session.CodeConnectionLost, "The connection to the database was lost.")
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
	if errors.As(err, &cv) || errors.As(err, &rh) || errors.As(err, &ua) || errors.As(err, &hn) ||
		errors.As(err, &ci) || errors.As(err, &alt) {
		return true
	}
	msg := err.Error()
	return strings.Contains(msg, "server refused TLS connection") || strings.Contains(msg, "tls: ")
}

// scrub removes the password from text that came back from the network.
func (s *pgSession) scrub(msg string) string {
	if s.password == "" {
		return msg
	}
	return strings.ReplaceAll(msg, s.password, "********")
}

// typeNames returns format_type names for the result columns, as introspect
// shows them ("bigint", "integer[]", enum names). OIDs not yet cached are
// looked up on the probe connection, since the tab's connection is busy
// streaming the result. A name that cannot be found is "unknown".
func (s *pgSession) typeNames(ctx context.Context, fields []pgconn.FieldDescription) []string {
	s.typesMu.Lock()
	var missing []string
	seen := map[uint32]bool{}
	for _, f := range fields {
		if _, ok := s.types[f.DataTypeOID]; !ok && !seen[f.DataTypeOID] {
			seen[f.DataTypeOID] = true
			missing = append(missing, strconv.FormatUint(uint64(f.DataTypeOID), 10))
		}
	}
	s.typesMu.Unlock()
	if len(missing) > 0 {
		s.lookupTypes(ctx, "{"+strings.Join(missing, ",")+"}")
	}
	s.typesMu.Lock()
	defer s.typesMu.Unlock()
	names := make([]string, len(fields))
	for i, f := range fields {
		if n, ok := s.types[f.DataTypeOID]; ok {
			names[i] = n
		} else {
			names[i] = "unknown"
		}
	}
	return names
}

func (s *pgSession) lookupTypes(ctx context.Context, oidArray string) {
	s.probeMu.Lock()
	defer s.probeMu.Unlock()
	if s.probe == nil || s.probe.conn.IsClosed() {
		c, err := s.dial(ctx)
		if err != nil {
			return
		}
		s.probe = c
	}
	rows, err := s.probe.conn.Query(ctx, "SELECT oid, format_type(oid, NULL) FROM pg_type WHERE oid = ANY ($1::oid[])", oidArray)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var oid uint32
		var name string
		if rows.Scan(&oid, &name) != nil {
			return
		}
		s.typesMu.Lock()
		if s.types == nil {
			s.types = map[uint32]string{}
		}
		s.types[oid] = name
		s.typesMu.Unlock()
	}
}

func (s *pgSession) Close() {
	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		return
	}
	s.closed = true
	tabs := s.tabs
	s.tabs = map[string]*tab{}
	s.mu.Unlock()
	s.stop() // cancels running queries and open cursors
	for _, t := range tabs {
		t.mu.Lock()
		if t.cur != nil {
			t.cur.cancel()
			t.cur = nil
		}
		if t.c != nil {
			closeConn(t.c.conn)
			t.c = nil
		}
		t.mu.Unlock()
	}
	s.probeMu.Lock()
	if s.probe != nil {
		closeConn(s.probe.conn)
		s.probe = nil
	}
	s.probeMu.Unlock()
}

func closeConn(c *pgx.Conn) {
	ctx, cancel := context.WithTimeout(context.Background(), cleanupTimeout)
	defer cancel()
	c.Close(ctx)
}
