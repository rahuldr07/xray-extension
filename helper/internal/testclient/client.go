// Package testclient drives protocol.ServeWith over pipes for tests: it sends
// requests one at a time and collects the frames answered for each id.
package testclient

import (
	"bytes"
	"encoding/json"
	"io"
	"sync"
	"testing"
	"time"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
)

// Frame is one decoded message from the helper.
type Frame struct {
	Size int
	M    map[string]any
}

// Client is a live helper conversation.
type Client struct {
	t      testing.TB
	in     *io.PipeWriter
	mu     sync.Mutex
	cond   *sync.Cond
	frames map[int64][]Frame
	stdout bytes.Buffer
	stderr lockedBuffer
	next   int64
	done   chan error
	// MaxFrame is the largest payload seen, in bytes.
	MaxFrame int
}

type lockedBuffer struct {
	mu sync.Mutex
	b  bytes.Buffer
}

func (l *lockedBuffer) Write(p []byte) (int, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.b.Write(p)
}

func (l *lockedBuffer) String() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.b.String()
}

// Start serves h on pipes. The conversation is closed at test cleanup.
func Start(t testing.TB, h protocol.Handler) *Client {
	inR, inW := io.Pipe()
	outR, outW := io.Pipe()
	c := &Client{t: t, in: inW, frames: map[int64][]Frame{}, done: make(chan error, 1)}
	c.cond = sync.NewCond(&c.mu)
	go func() {
		err := protocol.ServeWith(inR, outW, &c.stderr, "test", h)
		outW.Close()
		c.done <- err
	}()
	go func() {
		for {
			p, err := protocol.ReadFrame(outR)
			if err != nil {
				return
			}
			var m map[string]any
			if json.Unmarshal(p, &m) != nil {
				continue
			}
			id, _ := m["id"].(float64)
			c.mu.Lock()
			c.stdout.Write(p)
			if len(p) > c.MaxFrame {
				c.MaxFrame = len(p)
			}
			c.frames[int64(id)] = append(c.frames[int64(id)], Frame{Size: len(p), M: m})
			c.cond.Broadcast()
			c.mu.Unlock()
		}
	}()
	t.Cleanup(func() { c.Close() })
	return c
}

// Send writes req with a fresh id and returns that id.
func (c *Client) Send(req map[string]any) int64 {
	c.mu.Lock()
	c.next++
	id := c.next
	c.mu.Unlock()
	req["id"] = id
	b, err := json.Marshal(req)
	if err != nil {
		c.t.Fatal(err)
	}
	if err := protocol.WriteFrame(c.in, b); err != nil {
		c.t.Fatal(err)
	}
	return id
}

// Wait returns the stream frames and the final response for id.
func (c *Client) Wait(id int64, timeout time.Duration) (stream []Frame, final map[string]any) {
	c.t.Helper()
	deadline := time.Now().Add(timeout)
	timer := time.AfterFunc(timeout, func() {
		c.mu.Lock()
		c.cond.Broadcast()
		c.mu.Unlock()
	})
	defer timer.Stop()
	c.mu.Lock()
	defer c.mu.Unlock()
	for {
		for i, f := range c.frames[id] {
			if _, ok := f.M["ok"]; ok {
				return append([]Frame(nil), c.frames[id][:i]...), f.M
			}
		}
		if time.Now().After(deadline) {
			c.t.Fatalf("no final response for request %d within %v", id, timeout)
		}
		c.cond.Wait()
	}
}

// Call sends req and waits up to 30 s for its final response.
func (c *Client) Call(req map[string]any) (stream []Frame, final map[string]any) {
	c.t.Helper()
	return c.Wait(c.Send(req), 30*time.Second)
}

// Stdout is every payload received so far, concatenated.
func (c *Client) Stdout() string {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.stdout.String()
}

// Stderr is everything the helper wrote to stderr.
func (c *Client) Stderr() string { return c.stderr.String() }

// Close ends stdin and waits for the server to return.
func (c *Client) Close() error {
	c.in.Close()
	select {
	case err := <-c.done:
		c.done <- err
		return err
	case <-time.After(30 * time.Second):
		return io.ErrNoProgress
	}
}

// ErrCode is the error code of a failed response, or "".
func ErrCode(final map[string]any) string {
	e, _ := final["error"].(map[string]any)
	s, _ := e["code"].(string)
	return s
}

// Value is the value object of a successful response.
func Value(final map[string]any) map[string]any {
	v, _ := final["value"].(map[string]any)
	return v
}
