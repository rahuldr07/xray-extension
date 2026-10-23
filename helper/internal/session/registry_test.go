package session

import (
	"context"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
	"github.com/rahuldr07/xray-extension/helper/internal/testclient"
	"github.com/rahuldr07/xray-extension/helper/internal/values"
)

type fakeSession struct {
	readOnly bool
	mu       sync.Mutex
	execSQL  []string
	maxRows  []int
	fetchN   []int
	closed   bool
	block    bool
}

func (f *fakeSession) ServerVersion() string { return "Fake 1.0" }
func (f *fakeSession) ReadOnly() bool        { return f.readOnly }
func (f *fakeSession) Introspect(context.Context) (*SchemaTree, error) {
	return &SchemaTree{Schemas: []SchemaNode{{Name: "public", Tables: []TableNode{}, Views: []TableNode{}}}}, nil
}

func (f *fakeSession) Execute(ctx context.Context, tab, sql string, maxRows int, out *Emitter) (Summary, error) {
	f.mu.Lock()
	f.execSQL = append(f.execSQL, sql)
	f.maxRows = append(f.maxRows, maxRows)
	f.mu.Unlock()
	if f.block {
		<-ctx.Done()
		return Summary{}, Errorf(CodeCancelled, "Query cancelled.")
	}
	if err := out.Columns([]protocol.Column{{Name: "a", Type: "text"}}); err != nil {
		return Summary{}, err
	}
	if err := out.Row([]values.Cell{"x"}, []bool{true}); err != nil {
		return Summary{}, err
	}
	if err := out.Row([]values.Cell{"y"}, nil); err != nil {
		return Summary{}, err
	}
	return Summary{HasMore: true}, nil
}

func (f *fakeSession) FetchMore(ctx context.Context, tab string, n int, out *Emitter) (Summary, error) {
	f.mu.Lock()
	f.fetchN = append(f.fetchN, n)
	f.mu.Unlock()
	one := int64(1)
	return Summary{Affected: &one, Notices: []string{"hi"}}, nil
}

func (f *fakeSession) Close() {
	f.mu.Lock()
	f.closed = true
	f.mu.Unlock()
}

func start(t *testing.T) (*testclient.Client, *[]*fakeSession) {
	var made []*fakeSession
	var mu sync.Mutex
	ops := NewOps(map[string]Connector{"postgres": func(ctx context.Context, p Params) (Session, error) {
		mu.Lock()
		defer mu.Unlock()
		if p.Password == "bad" {
			return nil, Errorf(CodeAuthFailed, "Wrong password.")
		}
		f := &fakeSession{readOnly: p.ReadOnly, block: p.Database == "block"}
		made = append(made, f)
		return f, nil
	}})
	return testclient.Start(t, ops), &made
}

func connect(t *testing.T, c *testclient.Client, extra map[string]any) string {
	t.Helper()
	req := map[string]any{"op": "connect", "engine": "postgres", "host": "localhost", "port": 5432,
		"database": "d", "user": "u", "password": "p", "tls": "disable"}
	for k, v := range extra {
		req[k] = v
	}
	_, f := c.Call(req)
	v := testclient.Value(f)
	if f["ok"] != true || v["sessionId"] == "" {
		t.Fatalf("connect failed: %v", f)
	}
	return v["sessionId"].(string)
}

func TestRegistryAddGetRemove(t *testing.T) {
	r := NewRegistry()
	a, b := &fakeSession{}, &fakeSession{}
	ia, ib := r.Add(a), r.Add(b)
	if ia == ib || len(ia) < 16 {
		t.Fatalf("ids %q %q", ia, ib)
	}
	if s, ok := r.Get(ia); !ok || s != a {
		t.Fatal("get a")
	}
	if s, ok := r.Remove(ia); !ok || s != a {
		t.Fatal("remove a")
	}
	if _, ok := r.Get(ia); ok {
		t.Fatal("a still present")
	}
	r.CloseAll()
	if !b.closed {
		t.Fatal("CloseAll must close b")
	}
}

func TestRegistryCancel(t *testing.T) {
	r := NewRegistry()
	ctx, cancel := context.WithCancel(context.Background())
	untrack := r.Track(7, cancel)
	if !r.Cancel(7) || ctx.Err() == nil {
		t.Fatal("cancel 7")
	}
	untrack()
	if r.Cancel(7) {
		t.Fatal("untracked query must not cancel")
	}
}

func TestConnectReturnsCapabilities(t *testing.T) {
	c, made := start(t)
	_, f := c.Call(map[string]any{"op": "connect", "engine": "postgres", "host": "localhost", "port": 5432,
		"database": "d", "user": "u", "password": "p", "tls": "disable"})
	v := testclient.Value(f)
	caps := v["capabilities"].(map[string]any)
	want := map[string]any{"readOnlyEnforced": true, "cancel": true, "transactions": true, "cursor": true, "multiStatement": false}
	for k, w := range want {
		if caps[k] != w {
			t.Fatalf("capabilities[%s] = %v", k, caps[k])
		}
	}
	if v["serverVersion"] != "Fake 1.0" {
		t.Fatalf("version %v", v)
	}
	if !(*made)[0].readOnly {
		t.Fatal("readOnly must default to true")
	}
}

func TestConnectValidation(t *testing.T) {
	c, _ := start(t)
	for _, req := range []map[string]any{
		{"op": "connect", "engine": "oracle", "host": "localhost"},
		{"op": "connect", "engine": "postgres", "host": "localhost", "tls": "maybe"},
		{"op": "connect", "engine": "postgres", "host": ""},
		{"op": "connect", "engine": "postgres", "host": "localhost", "bogus": 1},
	} {
		if _, f := c.Call(req); testclient.ErrCode(f) != "bad-request" {
			t.Fatalf("%v: %v", req, f)
		}
	}
	_, f := c.Call(map[string]any{"op": "connect", "engine": "postgres", "host": "localhost", "password": "bad"})
	if testclient.ErrCode(f) != "auth-failed" {
		t.Fatalf("driver error must pass through: %v", f)
	}
}

func TestReadOnlyGuardRunsBeforeDriver(t *testing.T) {
	c, made := start(t)
	sid := connect(t, c, nil)
	_, f := c.Call(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "  -- c\nCOMMIT", "maxRows": 10})
	if testclient.ErrCode(f) != "read-only" {
		t.Fatalf("got %v", f)
	}
	if !strings.Contains(f["error"].(map[string]any)["message"].(string), "COMMIT") {
		t.Fatalf("message should name the keyword: %v", f)
	}
	if len((*made)[0].execSQL) != 0 {
		t.Fatal("driver must not see a guarded statement")
	}
	rw := connect(t, c, map[string]any{"readOnly": false})
	if _, f := c.Call(map[string]any{"op": "execute", "sessionId": rw, "tabId": "t1", "sql": "commit", "maxRows": 10}); f["ok"] != true {
		t.Fatalf("read-write commit must run: %v", f)
	}
}

func TestExecuteStreamsColumnsRowsSummary(t *testing.T) {
	c, made := start(t)
	sid := connect(t, c, nil)
	stream, f := c.Call(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select", "maxRows": 0})
	if len(stream) != 2 || stream[0].M["stream"] != "columns" || stream[1].M["stream"] != "rows" {
		t.Fatalf("stream %v", stream)
	}
	if rows := stream[1].M["rows"].([]any); len(rows) != 2 {
		t.Fatalf("rows %v", rows)
	}
	v := testclient.Value(f)
	if v["rowCount"] != float64(2) || v["hasMore"] != true || v["truncatedCells"] != float64(1) {
		t.Fatalf("summary %v", v)
	}
	if a, ok := v["affected"]; !ok || a != nil {
		t.Fatalf("affected must be null: %v", v)
	}
	if n, ok := v["notices"].([]any); !ok || len(n) != 0 {
		t.Fatalf("notices must be []: %v", v)
	}
	if (*made)[0].maxRows[0] != 1000 {
		t.Fatalf("default maxRows = %d", (*made)[0].maxRows[0])
	}
	c.Call(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select", "maxRows": 999999})
	if (*made)[0].maxRows[1] != 50000 {
		t.Fatalf("capped maxRows = %d", (*made)[0].maxRows[1])
	}
	_, f = c.Call(map[string]any{"op": "fetchMore", "sessionId": sid, "tabId": "t1"})
	v = testclient.Value(f)
	if (*made)[0].fetchN[0] != 1000 || v["affected"] != float64(1) || v["rowCount"] != float64(0) {
		t.Fatalf("fetchMore %v n=%v", v, (*made)[0].fetchN)
	}
}

func TestUnknownSession(t *testing.T) {
	c, _ := start(t)
	for _, op := range []string{"introspect", "execute", "fetchMore"} {
		if _, f := c.Call(map[string]any{"op": op, "sessionId": "nope"}); testclient.ErrCode(f) != "bad-request" {
			t.Fatalf("%s: %v", op, f)
		}
	}
	if _, f := c.Call(map[string]any{"op": "close", "sessionId": "nope"}); f["ok"] != true {
		t.Fatalf("close is idempotent: %v", f)
	}
}

func TestCancelStopsExecute(t *testing.T) {
	c, _ := start(t)
	sid := connect(t, c, map[string]any{"database": "block"})
	q := c.Send(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "select", "maxRows": 1})
	time.Sleep(50 * time.Millisecond)
	if _, f := c.Call(map[string]any{"op": "cancel", "queryId": q}); f["ok"] != true {
		t.Fatalf("cancel %v", f)
	}
	if _, f := c.Wait(q, 5*time.Second); testclient.ErrCode(f) != "cancelled" {
		t.Fatalf("execute %v", f)
	}
}

func TestCloseClosesSession(t *testing.T) {
	c, made := start(t)
	sid := connect(t, c, nil)
	if _, f := c.Call(map[string]any{"op": "close", "sessionId": sid}); f["ok"] != true {
		t.Fatal(f)
	}
	if !(*made)[0].closed {
		t.Fatal("session not closed")
	}
	if _, f := c.Call(map[string]any{"op": "introspect", "sessionId": sid}); testclient.ErrCode(f) != "bad-request" {
		t.Fatal("closed session must be gone")
	}
}

func TestIntrospectShape(t *testing.T) {
	c, _ := start(t)
	sid := connect(t, c, nil)
	_, f := c.Call(map[string]any{"op": "introspect", "sessionId": sid})
	s := testclient.Value(f)["schemas"].([]any)[0].(map[string]any)
	if s["name"] != "public" || s["tables"] == nil || s["views"] == nil {
		t.Fatalf("%v", f)
	}
}

// guardedFake brings its own read-only guard, as the MySQL driver does.
type guardedFake struct{ fakeSession }

func (g *guardedFake) ReadOnlyRefusal(sql string) string {
	if sql == "refuse me" {
		return "engine says no"
	}
	return ""
}

// An engine guard replaces the shared one: "# c" is a MySQL comment the
// shared guard cannot read, and the engine decides alone.
func TestEngineGuardReplacesSharedGuard(t *testing.T) {
	g := &guardedFake{fakeSession{readOnly: true}}
	c := testclient.Start(t, NewOps(map[string]Connector{"mysql": func(context.Context, Params) (Session, error) { return g, nil }}))
	sid := connect(t, c, map[string]any{"engine": "mysql"})
	if _, f := c.Call(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "# c\nselect 1", "maxRows": 10}); f["ok"] != true {
		t.Fatalf("engine guard allowed it: %v", f)
	}
	_, f := c.Call(map[string]any{"op": "execute", "sessionId": sid, "tabId": "t1", "sql": "refuse me", "maxRows": 10})
	if testclient.ErrCode(f) != "read-only" || f["error"].(map[string]any)["message"] != "engine says no" {
		t.Fatalf("got %v", f)
	}
	if len(g.execSQL) != 1 {
		t.Fatalf("driver saw %v", g.execSQL)
	}
}
