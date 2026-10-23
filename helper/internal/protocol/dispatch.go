package protocol

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"sync"
)

// Serve reads framed requests from in until EOF and answers on out. Each request
// runs in its own goroutine. errw receives only "xray-db-helper: <code>" lines.
// A clean EOF returns nil.
func Serve(in io.Reader, out io.Writer, errw io.Writer, version string) error {
	s := &server{w: NewWriter(out), errw: errw, version: version}
	var wg sync.WaitGroup
	defer wg.Wait()
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
			s.handle(payload)
		}()
	}
}

type server struct {
	w       *Writer
	errmu   sync.Mutex
	errw    io.Writer
	version string
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

func (s *server) handle(payload []byte) {
	var env envelope
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
		// Implemented in later tasks; field validation arrives with each op.
		s.fail(env.ID, CodeBadRequest, "not implemented")
	default:
		s.fail(env.ID, CodeBadRequest, "unknown op")
	}
}
