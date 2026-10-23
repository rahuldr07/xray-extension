package protocol

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
)

type result struct {
	frames []map[string]any
	stdout string
	stderr string
	err    error
}

func run(t *testing.T, version string, requests ...string) result {
	t.Helper()
	var in, out, errw bytes.Buffer
	for _, r := range requests {
		if err := WriteFrame(&in, []byte(r)); err != nil {
			t.Fatal(err)
		}
	}
	err := Serve(&in, &out, &errw, version)
	res := result{stdout: out.String(), stderr: errw.String(), err: err}
	rd := bytes.NewReader(out.Bytes())
	for rd.Len() > 0 {
		p, e := ReadFrame(rd)
		if e != nil {
			t.Fatal(e)
		}
		var m map[string]any
		if e := json.Unmarshal(p, &m); e != nil {
			t.Fatal(e)
		}
		res.frames = append(res.frames, m)
	}
	return res
}

func errCode(m map[string]any) string {
	e, _ := m["error"].(map[string]any)
	c, _ := e["code"].(string)
	return c
}

func TestHello(t *testing.T) {
	r := run(t, "1.2.3", `{"id":1,"op":"hello"}`)
	if r.err != nil || len(r.frames) != 1 {
		t.Fatalf("%v %v", r.err, r.frames)
	}
	f := r.frames[0]
	v := f["value"].(map[string]any)
	if f["id"] != float64(1) || f["ok"] != true || v["protocolVersion"] != float64(1) || v["helperVersion"] != "1.2.3" {
		t.Fatalf("bad hello: %v", f)
	}
}

func TestPing(t *testing.T) {
	r := run(t, "x", `{"id":2,"op":"ping"}`)
	f := r.frames[0]
	if f["ok"] != true || len(f["value"].(map[string]any)) != 0 {
		t.Fatalf("bad ping: %v", f)
	}
}

func TestUnknownOp(t *testing.T) {
	f := run(t, "x", `{"id":3,"op":"nope"}`).frames[0]
	if f["id"] != float64(3) || f["ok"] != false || errCode(f) != "bad-request" {
		t.Fatalf("got %v", f)
	}
}

func TestUnknownFieldOnKnownOp(t *testing.T) {
	f := run(t, "x", `{"id":4,"op":"ping","x":1}`).frames[0]
	if f["id"] != float64(4) || errCode(f) != "bad-request" {
		t.Fatalf("got %v", f)
	}
}

func TestMalformedJSONIsBadRequest(t *testing.T) {
	r := run(t, "x", `not json secret-token`)
	if errCode(r.frames[0]) != "bad-request" || strings.Contains(r.stdout+r.stderr, "secret-token") {
		t.Fatalf("got %v / %q", r.frames, r.stderr)
	}
}

func TestStubbedOpsAreNotImplemented(t *testing.T) {
	for i, op := range []string{"connect", "introspect", "execute", "fetchMore", "cancel", "close"} {
		f := run(t, "x", `{"id":`+string(rune('1'+i))+`,"op":"`+op+`"}`).frames[0]
		e := f["error"].(map[string]any)
		if f["ok"] != false || e["code"] != "bad-request" || e["message"] != "not implemented" {
			t.Fatalf("%s: %v", op, f)
		}
	}
}

func TestEOFExitsCleanly(t *testing.T) {
	r := run(t, "x")
	if r.err != nil || len(r.frames) != 0 || r.stderr != "" {
		t.Fatalf("%+v", r)
	}
}

func TestConcurrentRequestsAllAnswered(t *testing.T) {
	var reqs []string
	for i := 1; i <= 50; i++ {
		reqs = append(reqs, `{"id":`+itoa(i)+`,"op":"ping"}`)
	}
	r := run(t, "x", reqs...)
	seen := map[float64]bool{}
	for _, f := range r.frames {
		seen[f["id"].(float64)] = true
	}
	if len(seen) != 50 {
		t.Fatalf("answered %d of 50", len(seen))
	}
}

func itoa(i int) string {
	b, _ := json.Marshal(i)
	return string(b)
}

func TestFailedConnectNeverLeaksPassword(t *testing.T) {
	r := run(t, "x", `{"id":9,"op":"connect","driver":"postgres","host":"h","password":"s3cret-xyz"}`)
	if len(r.frames) != 1 || r.frames[0]["ok"] != false {
		t.Fatalf("expected a failure: %v", r.frames)
	}
	if strings.Contains(r.stdout, "s3cret-xyz") || strings.Contains(r.stderr, "s3cret-xyz") {
		t.Fatal("password leaked")
	}
	for _, line := range strings.Split(strings.TrimSpace(r.stderr), "\n") {
		if !strings.HasPrefix(line, "xray-db-helper: ") {
			t.Fatalf("stderr line %q is not a code line", line)
		}
	}
}

func TestOversizeFrameStopsServing(t *testing.T) {
	var in bytes.Buffer
	var hdr [4]byte
	byteOrder.PutUint32(hdr[:], MaxIncomingFrame+1)
	in.Write(hdr[:])
	var out, errw bytes.Buffer
	if err := Serve(&in, &out, &errw, "x"); err == nil {
		t.Fatal("expected error")
	}
	if strings.TrimSpace(errw.String()) != "xray-db-helper: frame-too-large" {
		t.Fatalf("stderr %q", errw.String())
	}
}
