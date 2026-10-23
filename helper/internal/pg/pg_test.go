package pg

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
	"github.com/rahuldr07/xray-extension/helper/internal/session"
	"github.com/rahuldr07/xray-extension/helper/internal/testclient"
)

const tlsCopy = "This server is not on this computer, so XRAY requires TLS. Choose Require or Verify full."

func dsnOrSkip(t *testing.T, env string) string {
	t.Helper()
	dsn := os.Getenv(env)
	if dsn == "" {
		t.Skipf("%s is not set", env)
	}
	return dsn
}

// connectReq turns a DSN into a connect request.
func connectReq(t *testing.T, dsn string, readOnly bool) map[string]any {
	t.Helper()
	cfg, err := pgconn.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	return map[string]any{"op": "connect", "engine": "postgres", "host": cfg.Host, "port": cfg.Port,
		"database": cfg.Database, "user": cfg.User, "password": cfg.Password, "tls": "disable", "readOnly": readOnly}
}

func newClient(t *testing.T) *testclient.Client {
	return testclient.Start(t, session.NewOps(map[string]session.Connector{"postgres": Connect}))
}

func open(t *testing.T, c *testclient.Client, req map[string]any) string {
	t.Helper()
	_, f := c.Call(req)
	if f["ok"] != true {
		t.Fatalf("connect: %v", f)
	}
	return testclient.Value(f)["sessionId"].(string)
}

// fixture creates a fresh schema holding orders (5 rows) and removes it at cleanup.
func fixture(t *testing.T, dsn string) string {
	t.Helper()
	cfg, err := pgx.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	cfg.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol
	ctx := context.Background()
	conn, err := pgx.ConnectConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	b := make([]byte, 6)
	rand.Read(b)
	schema := "xray_t_" + hex.EncodeToString(b)
	_, err = conn.Exec(ctx, fmt.Sprintf(`create schema %[1]s;
create table %[1]s.orders(id bigserial primary key, total numeric, meta jsonb, photo bytea);
insert into %[1]s.orders(total, meta, photo) select g * 1.5, jsonb_build_object('n', g), decode('00ff', 'hex') from generate_series(1, 5) g;`, schema))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		conn.Exec(context.Background(), strings.Join([]string{"DROP", "SCHEMA", schema, "CASCADE"}, " "))
		conn.Close(context.Background())
	})
	return schema
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

func errField(f map[string]any, k string) any {
	e, _ := f["error"].(map[string]any)
	return e[k]
}

func TestPostgresConnectCapabilities(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	c := newClient(t)
	_, f := c.Call(connectReq(t, dsn, true))
	v := testclient.Value(f)
	caps, _ := v["capabilities"].(map[string]any)
	if caps["readOnlyEnforced"] != true || caps["multiStatement"] != false || caps["cursor"] != true {
		t.Fatalf("%v", f)
	}
	if !strings.HasPrefix(v["serverVersion"].(string), "PostgreSQL") {
		t.Fatalf("version %v", v["serverVersion"])
	}
}

func TestPostgresIntrospect(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	schema := fixture(t, dsn)
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, true))
	_, f := c.Call(map[string]any{"op": "introspect", "sessionId": sid})
	var orders map[string]any
	for _, s := range testclient.Value(f)["schemas"].([]any) {
		sm := s.(map[string]any)
		switch n := sm["name"].(string); {
		case n == "pg_catalog" || n == "information_schema" || strings.HasPrefix(n, "pg_toast"):
			t.Fatalf("system schema %s listed", n)
		case n == schema:
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
	}{{"id", "bigint", true}, {"total", "numeric", false}, {"meta", "jsonb", false}, {"photo", "bytea", false}}
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
	if id["nullable"] != false || !strings.HasPrefix(id["defaultValue"].(string), "nextval(") {
		t.Fatalf("id column %v", id)
	}
	if cols[1].(map[string]any)["defaultValue"] != nil || cols[1].(map[string]any)["nullable"] != true {
		t.Fatalf("total column %v", cols[1])
	}
	if idx := orders["indexes"].([]any); len(idx) != 1 || idx[0] != "orders_pkey" {
		t.Fatalf("indexes %v", idx)
	}
}

func TestPostgresCursorAndFetchMore(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	schema := fixture(t, dsn)
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, true))
	stream, f := exec(c, sid, "t1", "select * from "+schema+".orders order by id", 2)
	if len(stream) == 0 || stream[0].M["stream"] != "columns" {
		t.Fatalf("stream %v final %v", stream, f)
	}
	cols := stream[0].M["columns"].([]any)
	if cols[0].(map[string]any)["type"] != "int8" || cols[2].(map[string]any)["type"] != "jsonb" {
		t.Fatalf("columns %v", cols)
	}
	rows := rowsOf(stream)
	v := testclient.Value(f)
	if len(rows) != 2 || v["hasMore"] != true || v["rowCount"] != float64(2) || v["affected"] != nil {
		t.Fatalf("rows %v summary %v", rows, v)
	}
	if rows[0][0] != "1" || rows[0][1] != "1.5" || rows[0][2] != `{"n": 1}` {
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
	exec(c, sid, "t1", "select * from "+schema+".orders", 1)
	if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
		t.Fatalf("after open cursor: %v", f)
	}
	_, f = c.Call(map[string]any{"op": "fetchMore", "sessionId": sid, "tabId": "t1", "n": 10})
	if testclient.ErrCode(f) != "bad-request" {
		t.Fatalf("cursor should be gone: %v", f)
	}
}

func TestPostgresReadOnly(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	schema := fixture(t, dsn)
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, true))
	_, f := exec(c, sid, "t1", "update "+schema+".orders set total=0", 10)
	if testclient.ErrCode(f) != "read-only" || errField(f, "sqlState") != "25006" {
		t.Fatalf("update: %v", f)
	}
	_, f = exec(c, sid, "t1", "commit", 10)
	if testclient.ErrCode(f) != "read-only" || errField(f, "sqlState") != nil {
		t.Fatalf("commit: %v", f)
	}
	// The aborted wrapper was rolled back: the tab still works.
	if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
		t.Fatalf("after refusal: %v", f)
	}
	_, f = exec(c, sid, "t1", "select set_config('transaction_read_only', 'off', true)", 10)
	if f["ok"] == true {
		t.Fatalf("leaving read-only must fail: %v", f)
	}
}

func TestPostgresReadWriteAffected(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	schema := fixture(t, dsn)
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, false))
	_, f := exec(c, sid, "t1", "insert into "+schema+".orders(total) values (9)", 10)
	if testclient.Value(f)["affected"] != float64(1) {
		t.Fatalf("insert: %v", f)
	}
	stream, _ := exec(c, sid, "t2", "select count(*) from "+schema+".orders", 10)
	if rowsOf(stream)[0][0] != "6" {
		t.Fatalf("insert was not committed: %v", rowsOf(stream))
	}
}

func TestPostgresCancel(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, true))
	stream, _ := exec(c, sid, "t1", "select pg_backend_pid()", 10) // dial the tab first
	pid := rowsOf(stream)[0][0]
	start := time.Now()
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select pg_sleep(30)", "maxRows": 10})
	time.Sleep(300 * time.Millisecond)
	c.Call(map[string]any{"op": "cancel", "queryId": q})
	_, f := c.Wait(q, 5*time.Second)
	if testclient.ErrCode(f) != "cancelled" {
		t.Fatalf("cancel: %v", f)
	}
	if d := time.Since(start); d >= 2*time.Second {
		t.Fatalf("cancel took %v", d)
	}
	// The protocol cancel request stopped the query; the connection survived.
	stream, f = exec(c, sid, "t1", "select pg_backend_pid()", 10)
	if f["ok"] != true || rowsOf(stream)[0][0] != pid {
		t.Fatalf("tab connection not reused after cancel: %v pid %v", f, pid)
	}
}

func TestPostgresHugeCellIsCut(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, true))
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

func TestPostgresErrors(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, true))
	// "select 1 frm" is valid Postgres (frm is a column alias); "*" cannot
	// take an alias, so this puts the syntax error on "frm" at offset 9.
	_, f := exec(c, sid, "t1", "select * frm orders", 10)
	if testclient.ErrCode(f) != "syntax" || errField(f, "position") != float64(9) || errField(f, "sqlState") != "42601" {
		t.Fatalf("syntax: %v", f)
	}
	_, f = exec(c, sid, "t1", "select 1; select 2", 10)
	if f["ok"] == true {
		t.Fatalf("two statements must be refused: %v", f)
	}
	_, f = exec(c, sid, "t1", "select * from no_such_table_xyz", 10)
	if testclient.ErrCode(f) != "server" || errField(f, "sqlState") != "42P01" {
		t.Fatalf("server: %v", f)
	}
	stream, f := exec(c, sid, "t1", "do $$ begin raise notice 'hello notice'; end $$", 10)
	if n, _ := testclient.Value(f)["notices"].([]any); len(n) != 1 || n[0] != "hello notice" {
		t.Fatalf("notices %v %v", f, stream)
	}
}

func TestPostgresStatementTimeout(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	c := newClient(t)
	req := connectReq(t, dsn, true)
	req["statementTimeoutMs"] = 200
	sid := open(t, c, req)
	_, f := exec(c, sid, "t1", "select pg_sleep(5)", 10)
	if testclient.ErrCode(f) != "timeout" || errField(f, "sqlState") != "57014" {
		t.Fatalf("timeout: %v", f)
	}
}

func TestPostgresConnectionLostThenRedial(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	c := newClient(t)
	sid := open(t, c, connectReq(t, dsn, true))
	stream, _ := exec(c, sid, "t1", "select pg_backend_pid()", 10)
	pid := rowsOf(stream)[0][0]
	admin, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer admin.Close(context.Background())
	if _, err := admin.Exec(context.Background(), "select pg_terminate_backend($1)", int(pid.(float64))); err != nil {
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

func TestPostgresWrongPasswordDoesNotLeak(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PG_DSN")
	c := newClient(t)
	req := connectReq(t, dsn, true)
	req["password"] = "s3cret-xyz"
	_, f := c.Call(req)
	if testclient.ErrCode(f) != "auth-failed" {
		t.Fatalf("got %v", f)
	}
	if strings.Contains(c.Stdout(), "s3cret-xyz") || strings.Contains(c.Stderr(), "s3cret-xyz") {
		t.Fatal("password leaked")
	}
}

func TestPostgresTLSDisableRefusedForRemoteHost(t *testing.T) {
	c := newClient(t)
	_, f := c.Call(map[string]any{"op": "connect", "engine": "postgres", "host": "db.example.com", "port": 5432,
		"database": "d", "user": "u", "password": "p", "tls": "disable"})
	if testclient.ErrCode(f) != "tls-failed" || errField(f, "message") != tlsCopy {
		t.Fatalf("got %v", f)
	}
}

func TestPgBouncerTransactionMode(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PGBOUNCER_DSN")
	schema := fixture(t, dsn)
	c := newClient(t)
	for _, ro := range []bool{true, false} {
		sid := open(t, c, connectReq(t, dsn, ro))
		for i := 0; i < 20; i++ {
			stream, f := exec(c, sid, "t1", fmt.Sprintf("select %d as n, count(*) from %s.orders", i, schema), 10)
			if f["ok"] != true || rowsOf(stream)[0][0] != float64(i) {
				t.Fatalf("readOnly=%v execute %d: %v", ro, i, f)
			}
		}
		stream, f := exec(c, sid, "t1", "select id from "+schema+".orders order by id", 2)
		if testclient.Value(f)["hasMore"] != true || len(rowsOf(stream)) != 2 {
			t.Fatalf("readOnly=%v cursor: %v", ro, f)
		}
		stream, f = c.Call(map[string]any{"op": "fetchMore", "sessionId": sid, "tabId": "t1", "n": 10})
		if f["ok"] != true || len(rowsOf(stream)) < 3 {
			t.Fatalf("readOnly=%v fetchMore: %v", ro, f)
		}
		_, f = exec(c, sid, "t1", "update "+schema+".orders set total=total where id=1", 10)
		if ro && (testclient.ErrCode(f) != "read-only" || errField(f, "sqlState") != "25006") {
			t.Fatalf("read-only update through pooler: %v", f)
		}
		if !ro && testclient.Value(f)["affected"] != float64(1) {
			t.Fatalf("read-write update through pooler: %v", f)
		}
	}
	if strings.Contains(c.Stdout(), "prepared statement") {
		t.Fatal("prepared-statement error through the pooler")
	}
}

// PgBouncer refuses statement_timeout as a startup parameter. The driver then
// enforces the timeout itself, through a cancel request at the deadline.
func TestPgBouncerStatementTimeout(t *testing.T) {
	dsn := dsnOrSkip(t, "XRAY_TEST_PGBOUNCER_DSN")
	c := newClient(t)
	for _, ro := range []bool{true, false} {
		req := connectReq(t, dsn, ro)
		req["statementTimeoutMs"] = 300
		sid := open(t, c, req)
		start := time.Now()
		_, f := exec(c, sid, "t1", "select pg_sleep(5)", 10)
		if testclient.ErrCode(f) != "timeout" || time.Since(start) > 2*time.Second {
			t.Fatalf("readOnly=%v: %v after %v", ro, f, time.Since(start))
		}
		if _, f = exec(c, sid, "t1", "select 1", 10); f["ok"] != true {
			t.Fatalf("readOnly=%v tab unusable after timeout: %v", ro, f)
		}
	}
}
