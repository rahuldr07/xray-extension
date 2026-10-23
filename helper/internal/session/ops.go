package session

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
	"github.com/rahuldr07/xray-extension/helper/internal/values"
)

// Row caps (Global Constraints).
const (
	DefaultMaxRows = 1000
	MaxMaxRows     = 50000
)

// Capabilities is what every M3 driver reports.
type Capabilities struct {
	ReadOnlyEnforced bool `json:"readOnlyEnforced"`
	Cancel           bool `json:"cancel"`
	Transactions     bool `json:"transactions"`
	Cursor           bool `json:"cursor"`
	MultiStatement   bool `json:"multiStatement"`
}

var capabilities = Capabilities{ReadOnlyEnforced: true, Cancel: true, Transactions: true, Cursor: true}

type connectValue struct {
	SessionID     string       `json:"sessionId"`
	ServerVersion string       `json:"serverVersion"`
	Capabilities  Capabilities `json:"capabilities"`
}

type connectRequest struct {
	ID                 int64  `json:"id"`
	Op                 string `json:"op"`
	Engine             string `json:"engine"`
	Host               string `json:"host"`
	Port               int    `json:"port"`
	Database           string `json:"database"`
	User               string `json:"user"`
	Password           string `json:"password"`
	TLS                string `json:"tls"`
	CAFile             string `json:"caFile"`
	StatementTimeoutMs int    `json:"statementTimeoutMs"`
	ReadOnly           *bool  `json:"readOnly"`
}

type sessionRequest struct {
	ID        int64  `json:"id"`
	Op        string `json:"op"`
	SessionID string `json:"sessionId"`
}

type executeRequest struct {
	ID        int64  `json:"id"`
	Op        string `json:"op"`
	SessionID string `json:"sessionId"`
	TabID     string `json:"tabId"`
	SQL       string `json:"sql"`
	MaxRows   int    `json:"maxRows"`
}

type fetchMoreRequest struct {
	ID        int64  `json:"id"`
	Op        string `json:"op"`
	SessionID string `json:"sessionId"`
	TabID     string `json:"tabId"`
	N         int    `json:"n"`
}

type cancelRequest struct {
	ID      int64  `json:"id"`
	Op      string `json:"op"`
	QueryID int64  `json:"queryId"`
}

// Ops answers the database ops for protocol.ServeWith.
type Ops struct {
	reg        *Registry
	connectors map[string]Connector
}

// NewOps serves the engines in connectors ("postgres", "mysql").
func NewOps(connectors map[string]Connector) *Ops {
	return &Ops{reg: NewRegistry(), connectors: connectors}
}

// Close closes every session.
func (o *Ops) Close() { o.reg.CloseAll() }

func decode(payload []byte, dst any) error {
	dec := json.NewDecoder(bytes.NewReader(payload))
	dec.DisallowUnknownFields()
	return dec.Decode(dst)
}

func badRequest(r *protocol.Reply, msg string) {
	r.Fail(protocol.ErrorBody{Code: CodeBadRequest, Message: msg})
}

// fail answers err: an *Error as-is, anything else as "internal".
func fail(r *protocol.Reply, err error) {
	var e *Error
	if errors.As(err, &e) {
		r.Fail(e.ErrorBody)
		return
	}
	r.Fail(protocol.ErrorBody{Code: CodeInternal, Message: "Internal helper error."})
}

func (o *Ops) Handle(ctx context.Context, op string, id int64, payload []byte, r *protocol.Reply) {
	switch op {
	case "connect":
		o.connect(ctx, payload, r)
	case "introspect":
		o.introspect(ctx, payload, r)
	case "execute":
		o.execute(ctx, id, payload, r)
	case "fetchMore":
		o.fetchMore(ctx, id, payload, r)
	case "cancel":
		var req cancelRequest
		if decode(payload, &req) != nil {
			badRequest(r, "malformed request")
			return
		}
		o.reg.Cancel(req.QueryID)
		r.OK(struct{}{})
	case "close":
		var req sessionRequest
		if decode(payload, &req) != nil {
			badRequest(r, "malformed request")
			return
		}
		if s, ok := o.reg.Remove(req.SessionID); ok {
			s.Close()
		}
		r.OK(struct{}{})
	default:
		badRequest(r, "unknown op")
	}
}

func (o *Ops) connect(ctx context.Context, payload []byte, r *protocol.Reply) {
	var req connectRequest
	if decode(payload, &req) != nil {
		badRequest(r, "malformed request")
		return
	}
	dial, ok := o.connectors[req.Engine]
	if !ok {
		badRequest(r, "Unsupported engine.")
		return
	}
	if req.TLS == "" {
		req.TLS = "require"
	}
	if req.TLS != "require" && req.TLS != "verify-full" && req.TLS != "disable" {
		badRequest(r, "Unsupported TLS mode.")
		return
	}
	if req.Host == "" {
		badRequest(r, "Host is required.")
		return
	}
	if req.Port < 0 || req.Port > 65535 || req.StatementTimeoutMs < 0 {
		badRequest(r, "malformed request")
		return
	}
	p := Params{
		Host: req.Host, Port: req.Port, Database: req.Database, User: req.User, Password: req.Password,
		TLS: req.TLS, CAFile: req.CAFile, ReadOnly: req.ReadOnly == nil || *req.ReadOnly,
		StatementTimeout: time.Duration(req.StatementTimeoutMs) * time.Millisecond,
	}
	s, err := dial(ctx, p)
	if err != nil {
		fail(r, err)
		return
	}
	if ctx.Err() != nil { // stdin closed while dialling
		s.Close()
		fail(r, Errorf(CodeCancelled, "Connect cancelled."))
		return
	}
	r.OK(connectValue{SessionID: o.reg.Add(s), ServerVersion: s.ServerVersion(), Capabilities: capabilities})
}

func (o *Ops) session(r *protocol.Reply, id string) (Session, bool) {
	s, ok := o.reg.Get(id)
	if !ok {
		badRequest(r, "Unknown session.")
	}
	return s, ok
}

func (o *Ops) introspect(ctx context.Context, payload []byte, r *protocol.Reply) {
	var req sessionRequest
	if decode(payload, &req) != nil {
		badRequest(r, "malformed request")
		return
	}
	s, ok := o.session(r, req.SessionID)
	if !ok {
		return
	}
	tree, err := s.Introspect(ctx)
	if err != nil {
		fail(r, err)
		return
	}
	r.OK(tree)
}

func clamp(n int) int {
	if n <= 0 {
		return DefaultMaxRows
	}
	return min(n, MaxMaxRows)
}

func (o *Ops) execute(ctx context.Context, id int64, payload []byte, r *protocol.Reply) {
	var req executeRequest
	if decode(payload, &req) != nil {
		badRequest(r, "malformed request")
		return
	}
	s, ok := o.session(r, req.SessionID)
	if !ok {
		return
	}
	if s.ReadOnly() {
		msg := ""
		if g, ok := s.(ReadOnlyGuard); ok {
			msg = g.ReadOnlyRefusal(req.SQL)
		} else if kw, refused := Guard(req.SQL); refused {
			msg = ReadOnlyMessage(kw)
		}
		if msg != "" {
			r.Fail(protocol.ErrorBody{Code: CodeReadOnly, Message: msg})
			return
		}
	}
	o.run(ctx, id, r, func(ctx context.Context, out *Emitter) (Summary, error) {
		return s.Execute(ctx, req.TabID, req.SQL, clamp(req.MaxRows), out)
	})
}

func (o *Ops) fetchMore(ctx context.Context, id int64, payload []byte, r *protocol.Reply) {
	var req fetchMoreRequest
	if decode(payload, &req) != nil {
		badRequest(r, "malformed request")
		return
	}
	s, ok := o.session(r, req.SessionID)
	if !ok {
		return
	}
	o.run(ctx, id, r, func(ctx context.Context, out *Emitter) (Summary, error) {
		return s.FetchMore(ctx, req.TabID, clamp(req.N), out)
	})
}

// run streams one execute or fetchMore from this goroutine and answers with
// the summary. The request id is the query id that cancel takes.
func (o *Ops) run(ctx context.Context, id int64, r *protocol.Reply, f func(context.Context, *Emitter) (Summary, error)) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	defer o.reg.Track(id, cancel)()
	out := &Emitter{id: id, send: r.Stream}
	start := time.Now()
	sum, err := f(ctx, out)
	if err == nil {
		err = out.flush()
	}
	if err != nil {
		fail(r, err)
		return
	}
	notices := sum.Notices
	if notices == nil {
		notices = []string{}
	}
	r.OK(protocol.ExecuteResult{
		RowCount:       out.rows,
		Affected:       sum.Affected,
		DurationMs:     float64(time.Since(start).Microseconds()) / 1000,
		Notices:        notices,
		HasMore:        sum.HasMore,
		TruncatedCells: out.Truncated(),
	})
}

// Emitter sends a result's columns and rows, packing rows into chunks that fit
// the native-messaging cap.
type Emitter struct {
	id      int64
	send    func(any) error
	chunk   values.Chunker
	rows    int
	mapCuts int
}

// Columns sends the columns message.
func (e *Emitter) Columns(cols []protocol.Column) error {
	if cols == nil {
		cols = []protocol.Column{}
	}
	return e.send(protocol.ColumnsMessage{ID: e.id, Stream: "columns", Columns: cols})
}

// Row queues one row. cut marks cells the value mapping already truncated.
// Pass a fresh row slice each time.
func (e *Emitter) Row(row []values.Cell, cut []bool) error {
	flush, _, err := e.chunk.Add(row, cut)
	if errors.Is(err, values.ErrRowTooLarge) {
		return Errorf(CodeLimitReached, "A row is too large to send, even with its values cut.")
	}
	if err != nil {
		return err
	}
	for _, c := range cut {
		if c {
			e.mapCuts++
		}
	}
	e.rows++
	if flush != nil {
		return e.sendRows(flush)
	}
	return nil
}

func (e *Emitter) flush() error {
	if rows := e.chunk.Flush(); rows != nil {
		return e.sendRows(rows)
	}
	return nil
}

func (e *Emitter) sendRows(rows [][]values.Cell) error {
	return e.send(protocol.RowsMessage{ID: e.id, Stream: "rows", Rows: rows})
}

// Truncated is the number of cells cut so far, by mapping or by chunking.
func (e *Emitter) Truncated() int { return e.mapCuts + e.chunk.Cut() }
