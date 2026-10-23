package protocol

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"sync"
)

// Handler serves the database ops (connect, introspect, execute, fetchMore,
// cancel, close). Handle runs on the request's own goroutine and must answer
// through r exactly once with OK or Fail, after any stream messages.
type Handler interface {
	Handle(ctx context.Context, op string, id int64, payload []byte, r *Reply)
	// Close releases everything the handler holds. Serve calls it once, after
	// stdin ends and every request has returned.
	Close()
}

// Reply answers one request.
type Reply struct {
	s  *server
	id int64
}

// Stream sends one stream message (columns or rows) for this request.
func (r *Reply) Stream(v any) error {
	if err := r.s.w.Send(v); err != nil {
		r.s.logCode("write-failed")
		return err
	}
	return nil
}

// OK sends the final success response.
func (r *Reply) OK(value any) { r.s.ok(r.id, value) }

// Fail sends the final error response and logs its code to stderr.
func (r *Reply) Fail(e ErrorBody) {
	r.s.logCode(e.Code)
	r.s.send(Response{ID: r.id, OK: false, Error: &e})
}

// Serve reads framed requests from in until EOF and answers on out. Each request
// runs in its own goroutine. errw receives only "xray-db-helper: <code>" lines.
// A clean EOF returns nil. The database ops answer "not implemented".
func Serve(in io.Reader, out io.Writer, errw io.Writer, version string) error {
	return ServeWith(in, out, errw, version, nil)
}

// ServeWith is Serve with h answering the database ops. When stdin ends, the
// context passed to in-flight requests is cancelled, Serve waits for them, and
// then closes h.
func ServeWith(in io.Reader, out io.Writer, errw io.Writer, version string, h Handler) error {
	ctx, cancel := context.WithCancel(context.Background())
	s := &server{w: NewWriter(out), errw: errw, version: version, h: h}
	var wg sync.WaitGroup
	defer func() {
		cancel()
		wg.Wait()
		if h != nil {
			h.Close()
		}
	}()
	for {
		payload, err := ReadFrame(in)
		if err != nil {
			if err == io.EOF {
				return nil
			}
			code := "read-failed"
			if errors.Is(err, ErrFrameTooLarge) {
				code = "frame-too-large"
			}
			s.logCode(code)
			return err
		}
		wg.Add(1)
		go func() {
			defer wg.Done()
			s.handle(ctx, payload)
		}()
	}
}

type server struct {
	w       *Writer
	errmu   sync.Mutex
	errw    io.Writer
	version string
	h       Handler
}

func (s *server) logCode(code string) {
	s.errmu.Lock()
	defer s.errmu.Unlock()
	fmt.Fprintf(s.errw, "xray-db-helper: %s\n", code)
}

func (s *server) fail(id int64, code, msg string) {
	s.logCode(code)
	s.send(Response{ID: id, OK: false, Error: &ErrorBody{Code: code, Message: msg}})
}

func (s *server) send(v any) {
	if err := s.w.Send(v); err != nil {
		s.logCode("write-failed")
	}
}

func (s *server) ok(id int64, value any) {
	s.send(okResponse{ID: id, OK: true, Value: value})
}

// strictDecode decodes payload into dst, rejecting unknown fields.
func strictDecode(payload []byte, dst any) error {
	dec := json.NewDecoder(bytes.NewReader(payload))
	dec.DisallowUnknownFields()
	return dec.Decode(dst)
}

func (s *server) handle(ctx context.Context, payload []byte) {
	var env envelope
	defer func() {
		// Ruling M3-R5: a panic answers "internal" and logs only its code.
		if recover() != nil {
			s.logCode("panic")
			s.send(Response{ID: env.ID, OK: false, Error: &ErrorBody{Code: CodeInternal, Message: "Internal helper error."}})
		}
	}()
	if err := json.Unmarshal(payload, &env); err != nil {
		// Fixed text only: never echo request content.
		s.fail(0, CodeBadRequest, "malformed request")
		return
	}
	switch env.Op {
	case "hello", "ping":
		var strict envelope
		if err := strictDecode(payload, &strict); err != nil {
			s.fail(env.ID, CodeBadRequest, "malformed request")
			return
		}
		if env.Op == "hello" {
			s.ok(env.ID, HelloValue{ProtocolVersion: Version, HelperVersion: s.version})
		} else {
			s.ok(env.ID, struct{}{})
		}
	case "connect", "introspect", "execute", "fetchMore", "cancel", "close":
		if s.h == nil {
			s.fail(env.ID, CodeBadRequest, "not implemented")
			return
		}
		s.h.Handle(ctx, env.Op, env.ID, payload, &Reply{s: s, id: env.ID})
	default:
		s.fail(env.ID, CodeBadRequest, "unknown op")
	}
}
