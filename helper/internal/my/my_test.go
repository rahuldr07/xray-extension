package my

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/go-sql-driver/mysql"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
	"github.com/rahuldr07/xray-extension/helper/internal/session"
	"github.com/rahuldr07/xray-extension/helper/internal/testclient"
)

const tlsCopy = "This server is not on this computer, so XRAY requires TLS. Choose Require or Verify full."

// digits is a 10-row derived table; cross joins of it generate large results
// without a recursive CTE (cte_max_recursion_depth defaults to 1000).
const digits = "(select 0 d union all select 1 union all select 2 union all select 3 union all select 4 union all select 5 union all select 6 union all select 7 union all select 8 union all select 9)"

func crossJoin(n int) string {
	parts := make([]string, n)
	for i := range parts {
		parts[i] = digits + " t" + strconv.Itoa(i)
	}
	return strings.Join(parts, ", ")
}

func dsnOrSkip(t *testing.T) *mysql.Config {
	t.Helper()
	dsn := os.Getenv("XRAY_TEST_MYSQL_DSN")
	if dsn == "" {
		t.Skip("XRAY_TEST_MYSQL_DSN is not set")
	}
	cfg, err := mysql.ParseDSN(dsn)
	if err != nil {
		t.Fatal(err)
	}
	return cfg
}

// connectReq turns the test DSN into a connect request for database db.
func connectReq(t *testing.T, cfg *mysql.Config, db string, readOnly bool) map[string]any {
	t.Helper()
	host, port, err := net.SplitHostPort(cfg.Addr)
	if err != nil {
		t.Fatal(err)
	}
	p, _ := strconv.Atoi(port)
	return map[string]any{"op": "connect", "engine": "mysql", "host": host, "port": p,
		"database": db, "user": cfg.User, "password": cfg.Passwd, "tls": "disable", "readOnly": readOnly}
}

func newClient(t *testing.T) *testclient.Client {
	return testclient.Start(t, session.NewOps(map[string]session.Connector{"mysql": Connect}))
}

func open(t *testing.T, c *testclient.Client, req map[string]any) string {
	t.Helper()
	_, f := c.Call(req)
	if f["ok"] != true {
		t.Fatalf("connect: %v", f)
	}
	return testclient.Value(f)["sessionId"].(string)
}

func admin(t *testing.T, cfg *mysql.Config) *sql.DB {
	t.Helper()
	conn, err := mysql.NewConnector(cfg)
	if err != nil {
		t.Fatal(err)
	}
	db := sql.OpenDB(conn)
	t.Cleanup(func() { db.Close() })
	return db
}

// fixture creates a fresh database holding orders (5 rows) and drops it at
// cleanup.
func fixture(t *testing.T, cfg *mysql.Config) string {
	t.Helper()
	db := admin(t, cfg)
	b := make([]byte, 6)
	rand.Read(b)
	name := "xray_t_" + hex.EncodeToString(b)
	ctx := context.Background()
	for _, q := range []string{
		"create database " + name,
		"create table " + name + ".orders(id bigint primary key auto_increment, total decimal(10,2), meta json, photo blob)",
		"insert into " + name + ".orders(total, meta, photo) with recursive g(n) as (select 1 union all select n + 1 from g where n < 5) select n * 1.5, json_object('n', n), x'00ff' from g",
	} {
		if _, err := db.ExecContext(ctx, q); err != nil {
			t.Fatal(err)
		}
	}
	t.Cleanup(func() { db.ExecContext(context.Background(), strings.Join([]string{"DROP", "DATABASE", name}, " ")) })
	return name
}

func exec(c *testclient.Client, sid, tab, sql string, maxRows int) ([]testclient.Frame, map[string]any) {
	return c.Call(map[string]any{"op": "execute", "sessionId": sid, "tabId": tab, "sql": sql, "maxRows": maxRows})
}

func rowsOf(stream []testclient.Frame) [][]any {
	var out [][]any
	for _, f := range stream {
		if f.M["stream"] == "rows" {
			for _, r := range f.M["rows"].([]any) {
				out = append(out, r.([]any))
			}
		}
	}
	return out
}

func colTypes(stream []testclient.Frame) []string {
	var got []string
	for _, col := range stream[0].M["columns"].([]any) {
		got = append(got, col.(map[string]any)["type"].(string))
	}
	return got
}

func errField(f map[string]any, k string) any {
	e, _ := f["error"].(map[string]any)
	return e[k]
}

func count(t *testing.T, c *testclient.Client, sid, sql string) any {
	t.Helper()
	stream, f := exec(c, sid, "check", sql, 10)
	if f["ok"] != true {
		t.Fatalf("count: %v", f)
	}
	return rowsOf(stream)[0][0]
}

func TestMySQLConnectCapabilities(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	_, f := c.Call(connectReq(t, cfg, cfg.DBName, true))
	v := testclient.Value(f)
	caps, _ := v["capabilities"].(map[string]any)
	if caps["readOnlyEnforced"] != true || caps["multiStatement"] != false || caps["cursor"] != true {
		t.Fatalf("%v", f)
	}
	if !strings.HasPrefix(v["serverVersion"].(string), "MySQL 8.") {
		t.Fatalf("version %v", v["serverVersion"])
	}
}

func TestMySQLIntrospect(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	_, f := c.Call(map[string]any{"op": "introspect", "sessionId": sid})
	var orders map[string]any
	for _, s := range testclient.Value(f)["schemas"].([]any) {
		sm := s.(map[string]any)
		switch n := sm["name"].(string); n {
		case "mysql", "information_schema", "performance_schema", "sys":
			t.Fatalf("system schema %s listed", n)
		case db:
			for _, tb := range sm["tables"].([]any) {
				if tb.(map[string]any)["name"] == "orders" {
					orders = tb.(map[string]any)
				}
			}
		}
	}
	if orders == nil {
		t.Fatalf("orders not found in %v", f)
	}
	cols := orders["columns"].([]any)
	want := []struct {
		name, typ string
		pk        bool
	}{{"id", "bigint", true}, {"total", "decimal(10,2)", false}, {"meta", "json", false}, {"photo", "blob", false}}
	if len(cols) != len(want) {
		t.Fatalf("columns %v", cols)
	}
	for i, w := range want {
		cm := cols[i].(map[string]any)
		if cm["name"] != w.name || cm["type"] != w.typ || cm["pk"] != w.pk {
			t.Fatalf("column %d = %v, want %v", i, cm, w)
		}
	}
	id := cols[0].(map[string]any)
	if id["nullable"] != false || id["defaultValue"] != "auto_increment" {
		t.Fatalf("id column %v", id)
	}
	if cols[1].(map[string]any)["defaultValue"] != nil || cols[1].(map[string]any)["nullable"] != true {
		t.Fatalf("total column %v", cols[1])
	}
	if idx := orders["indexes"].([]any); len(idx) != 1 || idx[0] != "PRIMARY" {
		t.Fatalf("indexes %v", idx)
	}
}

func TestMySQLCursorAndFetchMore(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	stream, f := exec(c, sid, "t1", "select * from orders order by id", 2)
	if len(stream) == 0 || stream[0].M["stream"] != "columns" {
		t.Fatalf("stream %v final %v", stream, f)
	}
	if got := strings.Join(colTypes(stream), "|"); got != "bigint|decimal|json|blob" {
		t.Fatalf("column types %s", got)
	}
	rows := rowsOf(stream)
	v := testclient.Value(f)
	if len(rows) != 2 || v["hasMore"] != true || v["rowCount"] != float64(2) || v["affected"] != nil {
		t.Fatalf("rows %v summary %v", rows, v)
	}
	if rows[0][0] != "1" || rows[0][1] != "1.50" || rows[0][2] != `{"n": 1}` {
		t.Fatalf("row 0 = %v", rows[0])
	}
	if p := rows[0][3].(map[string]any); p["hex"] != "00ff" || p["length"] != float64(2) {
		t.Fatalf("photo %v", p)
	}
	stream, f = c.Call(map[string]any{"op": "fetchMore", "sessionId": sid, "tabId": "t1", "n": 10})
	rows = rowsOf(stream)
	v = testclient.Value(f)
	if len(rows) != 3 || v["hasMore"] != false || rows[0][0] != "3" {
		t.Fatalf("fetchMore rows %v summary %v", rows, v)
	}
	_, f = c.Call(map[string]any{"op": "fetchMore", "sessionId": sid, "tabId": "t1", "n": 10})
	if testclient.ErrCode(f) != "bad-request" || errField(f, "message") != "No open cursor" {
		t.Fatalf("exhausted cursor: %v", f)
	}
	// A new execute on a tab with an open cursor closes it first.
	exec(c, sid, "t1", "select * from orders", 1)
	if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
		t.Fatalf("after open cursor: %v", f)
	}
	_, f = c.Call(map[string]any{"op": "fetchMore", "sessionId": sid, "tabId": "t1", "n": 10})
	if testclient.ErrCode(f) != "bad-request" {
		t.Fatalf("cursor should be gone: %v", f)
	}
}

func TestMySQLValues(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, cfg.DBName, true))
	stream, f := exec(c, sid, "t1", "select 9007199254740993, 42, cast(18446744073709551615 as unsigned), 1.5e0, x'00ff', cast('{\"a\": 1}' as json), '', null, 'héllo ✓', date '2024-01-02', cast(1.25 as decimal(5,2))", 10)
	if f["ok"] != true {
		t.Fatal(f)
	}
	want := "bigint|bigint|bigint unsigned|double|varbinary|json|varchar|null|varchar|date|decimal"
	if got := strings.Join(colTypes(stream), "|"); got != want {
		t.Fatalf("types %s, want %s", got, want)
	}
	r := rowsOf(stream)[0]
	if r[0] != "9007199254740993" || r[1] != "42" || r[2] != "18446744073709551615" || r[3] != 1.5 {
		t.Fatalf("numbers %v", r)
	}
	if p := r[4].(map[string]any); p["hex"] != "00ff" || p["length"] != float64(2) {
		t.Fatalf("binary %v", r[4])
	}
	if r[5] != `{"a": 1}` || r[6] != "" || r[7] != nil || r[8] != "héllo ✓" || r[9] != "2024-01-02" || r[10] != "1.25" {
		t.Fatalf("row %v", r)
	}
	stream, _ = exec(c, sid, "t1", "select cast(7 as signed integer) * 1, cast(3 as unsigned) + 0", 10)
	if r := rowsOf(stream)[0]; r[0] != "7" || r[1] != "3" {
		t.Fatalf("bigint results must be strings: %v", r)
	}
}

func TestMySQLReadOnly(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	_, f := exec(c, sid, "t1", "update orders set total=0", 10)
	if testclient.ErrCode(f) != "read-only" || errField(f, "sqlState") != "25006" {
		t.Fatalf("update: %v", f)
	}
	_, f = exec(c, sid, "t1", "commit", 10)
	if testclient.ErrCode(f) != "read-only" || errField(f, "sqlState") != nil {
		t.Fatalf("commit: %v", f)
	}
	if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
		t.Fatalf("after refusal: %v", f)
	}
	// MySQL commits implicitly before DDL and runs it outside the READ ONLY
	// transaction, so those statements are refused before they are sent.
	// Executable comments and "#" comments do not hide a keyword.
	for _, q := range []string{
		"create table made_in_read_only(a int)",
		"drop table orders",
		"truncate table orders",
		"rename table orders to gone",
		"alter table orders add column x int",
		"create database xray_ro_escape",
		"grant select on *.* to root",
		"flush tables",
		"analyze table orders",
		"/*!40101 set session transaction_read_only = 0 */",
		"/*!commit*/",
		"# comment\ncommit",
		"-- comment\ndrop table orders",
	} {
		_, f = exec(c, sid, "t1", q, 10)
		if testclient.ErrCode(f) != "read-only" {
			t.Fatalf("%q: %v", q, f)
		}
	}
	if n := count(t, c, sid, "select count(*) from information_schema.tables where table_schema = '"+db+"'"); n != "1" {
		t.Fatalf("tables %v", n)
	}
	if n := count(t, c, sid, "select count(*) from orders"); n != "5" {
		t.Fatalf("orders %v", n)
	}
	_, f = exec(c, sid, "t1", "insert into orders(total) values (1)", 10)
	if testclient.ErrCode(f) != "read-only" {
		t.Fatalf("insert: %v", f)
	}
}

func TestMySQLReadWriteAffected(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, false))
	stream, f := exec(c, sid, "t1", "insert into orders(total) values (9)", 10)
	if testclient.Value(f)["affected"] != float64(1) || len(stream) != 1 || len(stream[0].M["columns"].([]any)) != 0 {
		t.Fatalf("insert: %v %v", f, stream)
	}
	if n := count(t, c, sid, "select count(*) from orders"); n != "6" {
		t.Fatalf("insert was not committed: %v", n)
	}
	// affected counts matched rows, as Postgres does.
	_, f = exec(c, sid, "t1", "update orders set total=total where id=1", 10)
	if testclient.Value(f)["affected"] != float64(1) {
		t.Fatalf("update: %v", f)
	}
	_, f = exec(c, sid, "t1", "create table t2(a int)", 10)
	if f["ok"] != true || testclient.Value(f)["affected"] != float64(0) {
		t.Fatalf("create table: %v", f)
	}
}

func TestMySQLCancel(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	for _, ro := range []bool{true, false} {
		sid := open(t, c, connectReq(t, cfg, cfg.DBName, ro))
		stream, _ := exec(c, sid, "t1", "select connection_id()", 10) // dial the tab first
		id := rowsOf(stream)[0][0]
		start := time.Now()
		q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select sleep(30)", "maxRows": 10})
		time.Sleep(300 * time.Millisecond)
		c.Call(map[string]any{"op": "cancel", "queryId": q})
		_, f := c.Wait(q, 5*time.Second)
		if testclient.ErrCode(f) != "cancelled" {
			t.Fatalf("readOnly=%v cancel: %v", ro, f)
		}
		if d := time.Since(start); d >= 2*time.Second {
			t.Fatalf("readOnly=%v cancel took %v", ro, d)
		}
		// KILL QUERY stopped the statement; the tab's connection survived.
		stream, f = exec(c, sid, "t1", "select connection_id()", 10)
		if f["ok"] != true || rowsOf(stream)[0][0] != id {
			t.Fatalf("readOnly=%v tab connection not reused after cancel: %v id %v", ro, f, id)
		}
	}
}

func TestMySQLHugeCellIsCut(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, cfg.DBName, true))
	stream, f := exec(c, sid, "t1", "select repeat('x', 3000000)", 10)
	rows := rowsOf(stream)
	v := testclient.Value(f)
	if len(rows) != 1 || v["truncatedCells"] != float64(1) {
		t.Fatalf("summary %v rows %d", v, len(rows))
	}
	if s := rows[0][0].(string); len(s) == 0 || len(s) > protocol.MaxOutgoingPayload {
		t.Fatalf("cell length %d", len(s))
	}
	if c.MaxFrame > protocol.MaxOutgoingPayload {
		t.Fatalf("frame of %d bytes", c.MaxFrame)
	}
}

func TestMySQLErrors(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, false))
	// "select 1 frm" is valid MySQL (frm is a column alias); "*" cannot take
	// an alias, so this puts the syntax error on "frm" at offset 9.
	_, f := exec(c, sid, "t1", "select * frm orders", 10)
	if testclient.ErrCode(f) != "syntax" || errField(f, "position") != float64(9) || errField(f, "sqlState") != "42000" {
		t.Fatalf("syntax: %v", f)
	}
	_, f = exec(c, sid, "t1", "select 1;\n  delete from orders", 10)
	if testclient.ErrCode(f) != "syntax" || errField(f, "position") != float64(12) {
		t.Fatalf("two statements must be refused: %v", f)
	}
	if n := count(t, c, sid, "select count(*) from orders"); n != "5" {
		t.Fatalf("second statement ran: %v rows left", n)
	}
	_, f = exec(c, sid, "t1", "select * from no_such_table_xyz", 10)
	if testclient.ErrCode(f) != "server" || errField(f, "sqlState") != "42S02" {
		t.Fatalf("server: %v", f)
	}
	_, f = exec(c, sid, "t1", "select 'é' frm", 10)
	if f["ok"] != true {
		t.Fatalf("alias: %v", f)
	}
}

func TestNearPosition(t *testing.T) {
	cases := []struct {
		sql, msg string
		want     int
	}{
		{"select * frm orders", "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'frm orders' at line 1", 9},
		{"select 1\nfrom t\nwhere frm frm", "... to use near 'frm' at line 3", 26},
		{"select 'é' * frm x", "... to use near 'x' at line 1", 17},
		{"select (", "... to use near '' at line 1", 8},
		{"select 1", "something else", -1},
	}
	for _, c := range cases {
		if got := nearPosition(c.sql, c.msg); got != c.want {
			t.Errorf("nearPosition(%q) = %d, want %d", c.sql, got, c.want)
		}
	}
}

func TestReadOnlyKeyword(t *testing.T) {
	ro := session.ReadOnlyMessage
	cases := []struct{ sql, want string }{
		{"select 1", ""},
		{"/*!40101 SET x=1 */", versionCommentMsg},
		{"/*! commit */", versionCommentMsg},
		{"/*M!100000 commit */", ro("")},
		{"#c\n create table t(a int)", ro("CREATE")},
		{"-- c\nalter table t add x int", ro("ALTER")},
		// MySQL reads "--" plus any byte up to 0x20 as a comment.
		{"--\x01\ncreate table esc1(a int)", ro("CREATE")},
		{"--\x1f\ndrop table mi", ro("DROP")},
		{"--\ncommit", ro("COMMIT")},
		{"--", ro("")},
		{"/* c */ drop table t", ro("DROP")},
		{"truncate t", ro("TRUNCATE")},
		{"xa start 'x'", ro("XA")},
		{"unlock tables", ro("UNLOCK")},
		{"kill 5", ro("KILL")},
		{"shutdown", ro("SHUTDOWN")},
		{"call p()", "Procedures can commit, so CALL needs Read-only off."},
		{"/*!call p()*/", versionCommentMsg},
		// Fail closed: no first keyword, no statement.
		{"", ro("")},
		{"\x01create table t(a int)", ro("")},
		{"-- only a comment", ro("")},
		{"(select 1)", ""},
		{"with a as (select 1) select * from a", ""},
		{"show tables", ""},
		{"insert into t values (1)", ""},
		{"/*+ hint */ select 1", ""},
	}
	for _, c := range cases {
		if got := readOnlyRefusal(c.sql, false); got != c.want {
			t.Errorf("readOnlyRefusal(%q) = %q, want %q", c.sql, got, c.want)
		}
	}
}

func TestScrub(t *testing.T) {
	s := &mySession{password: "xray"}
	got := s.scrub("Table 'xray.nope' doesn't exist; xray_t_1 and axray stay; xray")
	if got != "Table '********.nope' doesn't exist; xray_t_1 and axray stay; ********" {
		t.Fatal(got)
	}
	s.password = "abc"
	if got := s.scrub("abc is short"); got != "abc is short" {
		t.Fatal(got)
	}
}

func TestMySQLStatementTimeout(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	req := connectReq(t, cfg, cfg.DBName, true)
	req["statementTimeoutMs"] = 200
	sid := open(t, c, req)
	start := time.Now()
	_, f := exec(c, sid, "t1", "select count(*) from "+crossJoin(9), 10)
	if testclient.ErrCode(f) != "timeout" || time.Since(start) > 2*time.Second {
		t.Fatalf("timeout: %v after %v", f, time.Since(start))
	}
	if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
		t.Fatalf("tab unusable after timeout: %v", f)
	}
}

func TestMySQLConnectionLostThenRedial(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, cfg.DBName, true))
	stream, _ := exec(c, sid, "t1", "select connection_id()", 10)
	id := rowsOf(stream)[0][0].(string)
	if _, err := admin(t, cfg).Exec("KILL " + id); err != nil {
		t.Fatal(err)
	}
	time.Sleep(100 * time.Millisecond)
	_, f := exec(c, sid, "t1", "select 1", 10)
	if testclient.ErrCode(f) != "connection-lost" {
		t.Fatalf("got %v", f)
	}
	if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
		t.Fatalf("redial: %v", f)
	}
}

func TestMySQLWrongPasswordDoesNotLeak(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	req := connectReq(t, cfg, cfg.DBName, true)
	req["password"] = "s3cret-xyz"
	_, f := c.Call(req)
	if testclient.ErrCode(f) != "auth-failed" {
		t.Fatalf("got %v", f)
	}
	if strings.Contains(c.Stdout(), "s3cret-xyz") || strings.Contains(c.Stderr(), "s3cret-xyz") {
		t.Fatal("password leaked")
	}
}

func TestMySQLTLSDisableRefusedForRemoteHost(t *testing.T) {
	c := newClient(t)
	_, f := c.Call(map[string]any{"op": "connect", "engine": "mysql", "host": "db.example.com", "port": 3306,
		"database": "d", "user": "u", "password": "p", "tls": "disable"})
	if testclient.ErrCode(f) != "tls-failed" || errField(f, "message") != tlsCopy {
		t.Fatalf("got %v", f)
	}
}

// A 50M-row cursor left open on a tab is cancelled (KILL QUERY), not
// drained: the tab's next statement answers within 2 s.
func TestMySQLNextStatementAfterHugeCursorIsFast(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	for _, ro := range []bool{true, false} {
		sid := open(t, c, connectReq(t, cfg, cfg.DBName, ro))
		_, f := exec(c, sid, "t1", "select t0.d, t1.d from "+crossJoin(8)+" limit 50000000", 10)
		if testclient.Value(f)["hasMore"] != true {
			t.Fatalf("readOnly=%v cursor: %v", ro, f)
		}
		start := time.Now()
		stream, f := exec(c, sid, "t1", "select 42", 10)
		if f["ok"] != true || rowsOf(stream)[0][0] != "42" {
			t.Fatalf("readOnly=%v next statement: %v", ro, f)
		}
		if d := time.Since(start); d > 2*time.Second {
			t.Fatalf("readOnly=%v next statement took %v", ro, d)
		}
	}
}

func zeroed(t *testing.T, c *testclient.Client, sid string) any {
	t.Helper()
	return count(t, c, sid, "select count(*) from orders where total = 0")
}

// An execute cancelled while it waits for its tab never runs.
func TestMySQLQueuedCancelledUpdateDoesNotCommit(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, false))
	hold := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select sleep(1)", "maxRows": 10})
	time.Sleep(100 * time.Millisecond)
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "update orders set total=0", "maxRows": 10})
	time.Sleep(200 * time.Millisecond)
	c.Call(map[string]any{"op": "cancel", "queryId": q})
	if _, f := c.Wait(q, 10*time.Second); testclient.ErrCode(f) != "cancelled" {
		t.Fatalf("queued update: %v", f)
	}
	c.Wait(hold, 10*time.Second)
	if n := zeroed(t, c, sid); n != "0" {
		t.Fatalf("cancelled update committed %v rows", n)
	}
}

// A write sent behind an open 50M-row cursor and cancelled 200 ms later
// answers within 2 s, and "cancelled" means the write did not commit.
func TestMySQLCancelBehindCursorIsConsistent(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, false))
	exec(c, sid, "t1", "select t0.d from "+crossJoin(8)+" limit 50000000", 10)
	start := time.Now()
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1",
		"sql": "update orders set total=0 where sleep(0.2) = 0", "maxRows": 10})
	time.Sleep(200 * time.Millisecond)
	c.Call(map[string]any{"op": "cancel", "queryId": q})
	_, f := c.Wait(q, 10*time.Second)
	if d := time.Since(start); d > 2*time.Second {
		t.Fatalf("answered after %v", d)
	}
	n := zeroed(t, c, sid)
	switch {
	case testclient.ErrCode(f) == "cancelled" && n == "0":
	case f["ok"] == true && n == "5":
	default:
		t.Fatalf("answer %v but %v rows were zeroed", f, n)
	}
}

// Ruling M3-R11: a read-write statement that may write runs to completion
// inside its own execute; ok means committed and no cursor stays open.
func TestMySQLWriteStatementFinishesBeforeOk(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, false))
	_, f := exec(c, sid, "t1", "update orders set total=0", 2)
	v := testclient.Value(f)
	if v["hasMore"] != false || v["affected"] != float64(5) {
		t.Fatalf("update: %v", f)
	}
	_, f = c.Call(map[string]any{"op": "fetchMore", "sessionId": sid, "tabId": "t1", "n": 10})
	if testclient.ErrCode(f) != "bad-request" {
		t.Fatalf("no cursor may be kept: %v", f)
	}
	if n := zeroed(t, c, sid); n != "5" {
		t.Fatalf("zeroed %v rows, want 5", n)
	}
	_, f = exec(c, sid, "t1", "insert into orders(total) select 1 from "+crossJoin(6)+" limit 200000", 5)
	if v = testclient.Value(f); v["affected"] != float64(200000) || v["hasMore"] != false {
		t.Fatalf("insert select: %v", f)
	}
	// Closing at once loses nothing: the insert already committed.
	c.Call(map[string]any{"op": "close", "sessionId": sid})
	other := open(t, c, connectReq(t, cfg, db, true))
	if n := count(t, c, other, "select count(*) from orders"); n != "200005" {
		t.Fatalf("count %v, want 200005", n)
	}
}

func TestMySQLCancelledWriteStatementCommitsNothing(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, false))
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "maxRows": 5,
		"sql": "insert into orders(total) select t0.d from " + crossJoin(2) + " where sleep(0.05) = 0"})
	time.Sleep(300 * time.Millisecond)
	c.Call(map[string]any{"op": "cancel", "queryId": q})
	if _, f := c.Wait(q, 5*time.Second); testclient.ErrCode(f) != "cancelled" {
		t.Fatalf("got %v", f)
	}
	if n := count(t, c, sid, "select count(*) from orders"); n != "5" {
		t.Fatalf("count %v, want 5", n)
	}
}

func TestMySQLCloseDuringQueryIsCancelled(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, cfg.DBName, true))
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select sleep(30)", "maxRows": 10})
	time.Sleep(300 * time.Millisecond)
	start := time.Now()
	c.Call(map[string]any{"op": "close", "sessionId": sid})
	if _, f := c.Wait(q, 5*time.Second); testclient.ErrCode(f) != "cancelled" {
		t.Fatalf("got %v", f)
	}
	if d := time.Since(start); d > 2*time.Second {
		t.Fatalf("close took %v", d)
	}
}

func TestMySQLRequireTLS(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	req := connectReq(t, cfg, cfg.DBName, true)
	req["tls"] = "require"
	sid := open(t, c, req)
	stream, f := exec(c, sid, "t1", "select variable_value from performance_schema.session_status where variable_name = 'Ssl_cipher'", 10)
	if f["ok"] != true || rowsOf(stream)[0][0] == "" {
		t.Fatalf("not encrypted: %v %v", f, rowsOf(stream))
	}
	req["tls"] = "verify-full" // the test server's certificate is self-signed
	_, f = c.Call(req)
	if testclient.ErrCode(f) != "tls-failed" {
		t.Fatalf("verify-full: %v", f)
	}
}

func TestMySQLPoolCap(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, cfg.DBName, true))
	for i := 0; i < 4; i++ {
		tab := fmt.Sprintf("t%d", i)
		if _, f := exec(c, sid, tab, "select t0.d from "+crossJoin(6), 1); testclient.Value(f)["hasMore"] != true {
			t.Fatalf("%s: %v", tab, f)
		}
	}
	// Every tab holds an open cursor; introspect and cancel still get a
	// connection.
	if _, f := c.Call(map[string]any{"op": "introspect", "sessionId": sid}); f["ok"] != true {
		t.Fatalf("introspect: %v", f)
	}
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t0", "sql": "select sleep(30)", "maxRows": 10})
	time.Sleep(300 * time.Millisecond)
	c.Call(map[string]any{"op": "cancel", "queryId": q})
	if _, f := c.Wait(q, 5*time.Second); testclient.ErrCode(f) != "cancelled" {
		t.Fatalf("cancel: %v", f)
	}
}

// When KILL QUERY cannot stop a statement, the tab's socket is closed after
// giveUp: a cancel still answers within 2 s, an open cursor still closes
// within 2 s, and the tab redials.
func TestMySQLSocketFallbackWhenKillFails(t *testing.T) {
	cfg := dsnOrSkip(t)
	killSQL = "DO "
	t.Cleanup(func() { killSQL = "KILL QUERY " })
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, cfg.DBName, true))
	stream, _ := exec(c, sid, "t1", "select connection_id()", 10)
	id := rowsOf(stream)[0][0]

	start := time.Now()
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select sleep(30)", "maxRows": 10})
	time.Sleep(300 * time.Millisecond)
	c.Call(map[string]any{"op": "cancel", "queryId": q})
	if _, f := c.Wait(q, 5*time.Second); testclient.ErrCode(f) != "cancelled" {
		t.Fatalf("cancel: %v", f)
	}
	if d := time.Since(start); d >= 2500*time.Millisecond {
		t.Fatalf("cancel took %v", d)
	}
	stream, f := exec(c, sid, "t1", "select connection_id()", 10)
	if f["ok"] != true || rowsOf(stream)[0][0] == id {
		t.Fatalf("expected a redialled connection: %v", f)
	}

	_, f = exec(c, sid, "t1", "select t0.d from "+crossJoin(8)+" limit 50000000", 10)
	if testclient.Value(f)["hasMore"] != true {
		t.Fatalf("cursor: %v", f)
	}
	start = time.Now()
	stream, f = exec(c, sid, "t1", "select 42", 10)
	if f["ok"] != true || rowsOf(stream)[0][0] != "42" {
		t.Fatalf("next statement: %v", f)
	}
	if d := time.Since(start); d > 2*time.Second {
		t.Fatalf("next statement took %v", d)
	}
	if strings.TrimSpace(c.Stderr()) != "" && !strings.HasPrefix(c.Stderr(), "xray-db-helper: ") {
		t.Fatalf("stderr %q", c.Stderr())
	}
}

// Read-only refuses CALL: a procedure can COMMIT or run DDL, which escapes
// the READ ONLY transaction. Read-write runs it to completion.
func TestMySQLCall(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	procedures(t, cfg, db)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	for _, q := range []string{"call p_commit()", "call p_ddl()", "--\x01\ncall p_commit()"} {
		_, f := exec(c, sid, "t1", q, 10)
		if testclient.ErrCode(f) != "read-only" || errField(f, "message") != "Procedures can commit, so CALL needs Read-only off." {
			t.Fatalf("%q: %v", q, f)
		}
	}
	// The shared guard sees only a comment here and refuses it first.
	if _, f := exec(c, sid, "t1", "/*!call p_ddl()*/", 10); testclient.ErrCode(f) != "read-only" {
		t.Fatalf("executable comment: %v", f)
	}
	if n := count(t, c, sid, "select count(*) from orders"); n != "5" {
		t.Fatalf("orders %v", n)
	}
	if n := count(t, c, sid, "select count(*) from information_schema.tables where table_schema = '"+db+"'"); n != "1" {
		t.Fatalf("tables %v", n)
	}
	rw := open(t, c, connectReq(t, cfg, db, false))
	stream, f := exec(c, rw, "t1", "call p_rows()", 2)
	v := testclient.Value(f)
	if len(rowsOf(stream)) != 2 || v["hasMore"] != false {
		t.Fatalf("call in read-write: %v", f)
	}
	if n, _ := v["notices"].([]any); len(n) != 1 || n[0] != "Showing the first 2 of 5 returned rows." {
		t.Fatalf("notices %v", v["notices"])
	}
}

// The "--" + control byte escape and statements with no first keyword are
// refused on a read-only connection; nothing reaches the server.
func TestMySQLReadOnlyFailsClosed(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	for _, q := range []string{"--\x01\ncreate table esc1(a int)", "--\x1f\ndrop table orders", "\x01create table esc2(a int)", "kill 1"} {
		if _, f := exec(c, sid, "t1", q, 10); testclient.ErrCode(f) != "read-only" {
			t.Fatalf("%q: %v", q, f)
		}
	}
	if n := count(t, c, sid, "select count(*) from information_schema.tables where table_schema = '"+db+"'"); n != "1" {
		t.Fatalf("tables %v", n)
	}
	if _, f := exec(c, sid, "t1", "(select 1)", 10); f["ok"] != true {
		t.Fatalf("parenthesised select: %v", f)
	}
}

func TestMySQLGeometryIsBinary(t *testing.T) {
	cfg := dsnOrSkip(t)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, cfg.DBName, true))
	stream, f := exec(c, sid, "t1", "select st_geomfromtext('POINT(1 2)')", 10)
	if f["ok"] != true || colTypes(stream)[0] != "geometry" {
		t.Fatalf("%v %v", f, stream)
	}
	p, ok := rowsOf(stream)[0][0].(map[string]any)
	if !ok || p["length"] != float64(25) || !strings.HasPrefix(p["hex"].(string), "00000000") {
		t.Fatalf("geometry %v", rowsOf(stream)[0][0])
	}
}

// Ruling M3-R14: the statement timeout bounds writes too (max_execution_time
// covers only SELECT); a timed-out write commits nothing.
func TestMySQLStatementTimeoutBoundsWrites(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	req := connectReq(t, cfg, db, false)
	req["statementTimeoutMs"] = 200
	sid := open(t, c, req)
	start := time.Now()
	_, f := exec(c, sid, "t1", "update orders set total=0 where sleep(0.5) = 0", 10)
	if testclient.ErrCode(f) != "timeout" || time.Since(start) > 2*time.Second {
		t.Fatalf("timeout: %v after %v", f, time.Since(start))
	}
	if n := zeroed(t, c, sid); n != "0" {
		t.Fatalf("timed-out update zeroed %v rows", n)
	}
	if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
		t.Fatalf("tab unusable after timeout: %v", f)
	}
}

// When the password equals the database name, server text naming the
// database is scrubbed, but longer words that contain it are left alone.
func TestMySQLPasswordEqualsDatabaseName(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	a := admin(t, cfg)
	user := "u" + db[len(db)-12:]
	for _, q := range []string{
		"create user '" + user + "'@'%' identified by '" + db + "'",
		"grant all on " + db + ".* to '" + user + "'@'%'",
	} {
		if _, err := a.Exec(q); err != nil {
			t.Fatal(err)
		}
	}
	t.Cleanup(func() { a.Exec("drop user '" + user + "'@'%'") })
	c := newClient(t)
	req := connectReq(t, cfg, db, true)
	req["user"], req["password"] = user, db
	sid := open(t, c, req)
	_, f := exec(c, sid, "t1", "select * from "+db+"."+db+"_more", 10)
	msg, _ := errField(f, "message").(string)
	if testclient.ErrCode(f) != "server" || msg != "Table '********."+db+"_more' doesn't exist" {
		t.Fatalf("%v", f)
	}
}

// procedures adds p_commit (COMMIT, then INSERT), p_ddl (CREATE TABLE) and
// p_rows (a SELECT) to db.
func procedures(t *testing.T, cfg *mysql.Config, db string) {
	t.Helper()
	a := admin(t, cfg)
	for _, q := range []string{
		"create procedure " + db + ".p_commit() begin commit; insert into " + db + ".orders(total) values (7); end",
		"create procedure " + db + ".p_ddl() begin create table " + db + ".made_by_call(a int); end",
		"create procedure " + db + ".p_rows() begin select id from " + db + ".orders order by id; end",
	} {
		if _, err := a.Exec(q); err != nil {
			t.Fatal(err)
		}
	}
}

func tableCount(t *testing.T, c *testclient.Client, sid, db string) any {
	t.Helper()
	return count(t, c, sid, "select count(*) from information_schema.tables where table_schema = '"+db+"'")
}

func TestVersionCommentGuard(t *testing.T) {
	if versionCommentMsg != "Version comments (/*! … */) are not allowed with Read-only on." {
		t.Fatal(versionCommentMsg)
	}
	ro := session.ReadOnlyMessage
	cases := []struct {
		sql     string
		mariaDB bool
		want    string
	}{
		{"/*!99999 select */ create table p3(a int)", false, versionCommentMsg},
		{"/*!99999 select */ call p_ddl()", false, versionCommentMsg},
		{"select 1 /*!, 2 */", false, versionCommentMsg},
		{"/*!40101 SET x=1 */", false, versionCommentMsg},
		{"/*! commit */", false, versionCommentMsg},
		// Only MariaDB executes /*M! … */; MySQL reads it as a comment.
		{"/*M! select */ create table p4(a int)", false, ro("CREATE")},
		{"/*M! select */ select 1", false, ""},
		{"/*M! select */ create table p4(a int)", true, versionCommentMsg},
		{"/*M!100000 select */ select 1", true, versionCommentMsg},
		// mysqldump-style "#" comments are fine.
		{"# c\nselect 1", false, ""},
		{"# c\ncommit", false, ro("COMMIT")},
	}
	for _, c := range cases {
		if got := readOnlyRefusal(c.sql, c.mariaDB); got != c.want {
			t.Errorf("readOnlyRefusal(%q, mariaDB=%v) = %q, want %q", c.sql, c.mariaDB, got, c.want)
		}
	}
	// In read-write mode an executable comment before the first keyword makes
	// the statement unknown: run to completion, under the write deadline.
	for _, c := range []struct {
		sql     string
		mariaDB bool
		want    string
	}{
		{"/*!99999 select */ update t set a=1", false, ""},
		{"/*!40101 select */ 1", false, ""},
		{"/*M! select */ update t set a=1", false, "UPDATE"},
		{"/*M! select */ update t set a=1", true, ""},
		{"/* c */ update t set a=1", false, "UPDATE"},
	} {
		if got := keyword(c.sql, c.mariaDB); got != c.want {
			t.Errorf("keyword(%q, mariaDB=%v) = %q, want %q", c.sql, c.mariaDB, got, c.want)
		}
	}
}

// Ruling M3-R15 (a): the review's probes, live. Version comments are refused
// on read-only, so neither the DDL nor the CALL runs.
func TestMySQLVersionCommentsRefused(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	procedures(t, cfg, db)
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	for _, q := range []string{
		"/*!99999 select */ create table p3(a int)",
		"/*!99999 select */ call p_ddl()",
		"/*!99999 select */ call p_commit()",
		"/*M! select */ create table p4(a int)",
		"/*M! select */ call p_ddl()",
	} {
		if _, f := exec(c, sid, "t1", q, 10); testclient.ErrCode(f) != "read-only" {
			t.Fatalf("%q: %v", q, f)
		}
	}
	_, f := exec(c, sid, "t1", "/*!99999 select */ create table p3(a int)", 10)
	if errField(f, "message") != versionCommentMsg {
		t.Fatalf("message %v", f)
	}
	if n := tableCount(t, c, sid, db); n != "1" {
		t.Fatalf("tables %v", n)
	}
	if n := count(t, c, sid, "select count(*) from orders"); n != "5" {
		t.Fatalf("orders %v", n)
	}
	// mysqldump-style "#" comments do not trip the guard.
	stream, f := exec(c, sid, "t1", "# dumped\nselect 1", 10)
	if f["ok"] != true || rowsOf(stream)[0][0] != "1" {
		t.Fatalf("# comment: %v", f)
	}
}

// Ruling M3-R15 (b): with the statement guard switched off, the server still
// refuses writes on a read-only connection (session transaction_read_only),
// also after a redial.
func TestMySQLServerEnforcesReadOnly(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	procedures(t, cfg, db)
	guardDisabled = true
	t.Cleanup(func() { guardDisabled = false })
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	probe := func(round string) {
		for _, q := range []string{
			"create table x(a int)",
			"call p_ddl()",
			"call p_commit()",
			"/*!99999 select */ create table p3(a int)",
			"create database " + db + "_x",
			"drop table orders",
			"commit",
		} {
			_, f := exec(c, sid, "t1", q, 10)
			if q == "commit" {
				continue // ends nothing that matters; the next probe must still be refused
			}
			if testclient.ErrCode(f) != "read-only" || errField(f, "sqlState") != "25006" {
				t.Fatalf("%s %q: %v", round, q, f)
			}
		}
		if n := tableCount(t, c, sid, db); n != "1" {
			t.Fatalf("%s tables %v", round, n)
		}
		if n := count(t, c, sid, "select count(*) from orders"); n != "5" {
			t.Fatalf("%s orders %v", round, n)
		}
		if n := count(t, c, sid, "select count(*) from information_schema.schemata where schema_name = '"+db+"_x'"); n != "0" {
			t.Fatalf("%s database created", round)
		}
	}
	probe("first dial")
	stream, _ := exec(c, sid, "t1", "select connection_id()", 10)
	if _, err := admin(t, cfg).Exec("KILL " + rowsOf(stream)[0][0].(string)); err != nil {
		t.Fatal(err)
	}
	time.Sleep(100 * time.Millisecond)
	exec(c, sid, "t1", "select 1", 10) // connection-lost; the next execute redials
	probe("after redial")
}

// Ruling M3-R15 (d): WITH … UPDATE gets the write deadline too.
func TestMySQLStatementTimeoutBoundsWithUpdate(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	c := newClient(t)
	req := connectReq(t, cfg, db, false)
	req["statementTimeoutMs"] = 200
	sid := open(t, c, req)
	start := time.Now()
	_, f := exec(c, sid, "t1", "with z as (select 0 v) update orders, z set total=z.v where sleep(0.5) = 0", 10)
	if testclient.ErrCode(f) != "timeout" || time.Since(start) > 2*time.Second {
		t.Fatalf("timeout: %v after %v", f, time.Since(start))
	}
	if n := zeroed(t, c, sid); n != "0" {
		t.Fatalf("timed-out update zeroed %v rows", n)
	}
}

func TestFileWriteGuard(t *testing.T) {
	if fileWriteMsg != "Writing files on the server needs Read-only off." {
		t.Fatal(fileWriteMsg)
	}
	cases := []struct{ sql, want string }{
		{"table orders into outfile '/var/lib/mysql-files/x'", fileWriteMsg},
		{"select 1 into dumpfile '/tmp/x'", fileWriteMsg},
		{"select 1 into/**/outfile '/tmp/x'", fileWriteMsg},
		{"SELECT 1 INTO\n\tOUTFILE '/tmp/x'", fileWriteMsg},
		{"select 1 into /* a */ # b\n -- c\n dumpfile '/tmp/x'", fileWriteMsg},
		{"select * from t into outfile '/tmp/x' fields terminated by ','", fileWriteMsg},
		{"select 1 into @x", ""},
		{"select pinto, outfile from t", ""},
	}
	for _, c := range cases {
		if got := readOnlyRefusal(c.sql, false); got != c.want {
			t.Errorf("readOnlyRefusal(%q) = %q, want %q", c.sql, got, c.want)
		}
	}
}

// Fail closed by design: the check reads raw text, so the words inside a
// string literal are refused too.
func TestFileWriteGuardRefusesTheWordsEvenInsideAString(t *testing.T) {
	if got := readOnlyRefusal("select 'into outfile'", false); got != fileWriteMsg {
		t.Fatalf("got %q", got)
	}
}

// Ruling M3-R16: SELECT/TABLE … INTO OUTFILE/DUMPFILE writes a file on the
// server even inside a READ ONLY transaction, so read-only refuses it.
func TestMySQLIntoOutfileRefused(t *testing.T) {
	cfg := dsnOrSkip(t)
	db := fixture(t, cfg)
	a := admin(t, cfg)
	var dir sql.NullString
	if err := a.QueryRow("select @@secure_file_priv").Scan(&dir); err != nil {
		t.Fatal(err)
	}
	base := "/tmp/"
	if dir.Valid && dir.String != "" {
		base = strings.TrimSuffix(dir.String, "/") + "/"
	}
	c := newClient(t)
	sid := open(t, c, connectReq(t, cfg, db, true))
	for i, form := range []string{
		"table orders into outfile '%s'",
		"select 1 into dumpfile '%s'",
		"select 1 into/**/outfile '%s'",
		"select 'into outfile'",
	} {
		path := base + db + "_" + strconv.Itoa(i)
		q := form
		if strings.Contains(form, "%s") {
			q = fmt.Sprintf(form, path)
		}
		// Twice: a written file would make the second run fail with
		// "already exists" rather than read-only.
		for run := 0; run < 2; run++ {
			_, f := exec(c, sid, "t1", q, 10)
			if testclient.ErrCode(f) != "read-only" || errField(f, "message") != fileWriteMsg {
				t.Fatalf("%q run %d: %v", q, run, f)
			}
		}
		var content sql.NullString
		if err := a.QueryRow("select load_file(?)", path).Scan(&content); err != nil {
			t.Fatal(err)
		}
		if content.Valid {
			t.Fatalf("%s was written", path)
		}
	}
}
