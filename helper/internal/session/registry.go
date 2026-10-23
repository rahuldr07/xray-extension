// Package session holds the engine-neutral parts of the helper: the session
// registry, the ops dispatcher, the read-only keyword guard and the result
// emitter. Engine drivers (pg, my) implement Session.
package session

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
)

// Error codes shared by every driver.
const (
	CodeBadRequest     = protocol.CodeBadRequest
	CodeInternal       = protocol.CodeInternal
	CodeAuthFailed     = "auth-failed"
	CodeTLSFailed      = "tls-failed"
	CodeNetwork        = "network"
	CodeTimeout        = "timeout"
	CodeCancelled      = "cancelled"
	CodeReadOnly       = "read-only"
	CodeSyntax         = "syntax"
	CodeServer         = "server"
	CodeConnectionLost = "connection-lost"
	CodeLimitReached   = "limit-reached"
)

// Error is a driver error carried to the extension as-is.
type Error struct {
	protocol.ErrorBody
}

func (e *Error) Error() string { return e.Code + ": " + e.Message }

// Errorf returns an *Error with code and message.
func Errorf(code, message string) *Error {
	return &Error{protocol.ErrorBody{Code: code, Message: message}}
}

// Params are the connect fields a driver needs.
type Params struct {
	Host             string
	Port             int
	Database         string
	User             string
	Password         string
	TLS              string // "require", "verify-full" or "disable"
	CAFile           string
	StatementTimeout time.Duration
	ReadOnly         bool
}

// Connector dials a new session. Its errors should be *Error.
type Connector func(ctx context.Context, p Params) (Session, error)

// Summary is what a driver reports at the end of an execute or fetchMore.
type Summary struct {
	Affected *int64
	Notices  []string
	HasMore  bool
}

// Session is one connect: a tab-less connection plus one connection per tab.
type Session interface {
	ServerVersion() string
	ReadOnly() bool
	Introspect(ctx context.Context) (*SchemaTree, error)
	// Execute runs sql on tab's connection, sending columns then rows to out.
	Execute(ctx context.Context, tab, sql string, maxRows int, out *Emitter) (Summary, error)
	// FetchMore sends up to n more rows from tab's open cursor.
	FetchMore(ctx context.Context, tab string, n int, out *Emitter) (Summary, error)
	Close()
}

// ReadOnlyGuard is implemented by a session whose engine reads statements
// differently from the shared Guard (MySQL comments, version comments). Ops
// then uses it in place of Guard. It returns the refusal text, or "".
type ReadOnlyGuard interface {
	ReadOnlyRefusal(sql string) string
}

// SchemaTree mirrors the TypeScript SchemaTree.
type SchemaTree struct {
	Schemas []SchemaNode `json:"schemas"`
}

type SchemaNode struct {
	Name   string      `json:"name"`
	Tables []TableNode `json:"tables"`
	Views  []TableNode `json:"views"`
}

type TableNode struct {
	Name    string       `json:"name"`
	Columns []ColumnNode `json:"columns"`
	Indexes []string     `json:"indexes"`
}

type ColumnNode struct {
	Name         string  `json:"name"`
	Type         string  `json:"type"`
	Nullable     bool    `json:"nullable"`
	DefaultValue *string `json:"defaultValue"`
	PK           bool    `json:"pk"`
}

// Registry maps session ids to sessions and running query ids to their
// cancel functions. Its locks are never held while a driver works.
type Registry struct {
	mu       sync.Mutex
	sessions map[string]Session
	queries  map[int64]context.CancelFunc
}

func NewRegistry() *Registry {
	return &Registry{sessions: map[string]Session{}, queries: map[int64]context.CancelFunc{}}
}

// Add stores s under a new random id.
func (r *Registry) Add(s Session) string {
	b := make([]byte, 16)
	rand.Read(b)
	id := hex.EncodeToString(b)
	r.mu.Lock()
	r.sessions[id] = s
	r.mu.Unlock()
	return id
}

func (r *Registry) Get(id string) (Session, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	s, ok := r.sessions[id]
	return s, ok
}

// Remove forgets id and returns the session it held.
func (r *Registry) Remove(id string) (Session, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	s, ok := r.sessions[id]
	delete(r.sessions, id)
	return s, ok
}

// Track records cancel for queryID until the returned func is called.
func (r *Registry) Track(queryID int64, cancel context.CancelFunc) (untrack func()) {
	r.mu.Lock()
	r.queries[queryID] = cancel
	r.mu.Unlock()
	return func() {
		r.mu.Lock()
		delete(r.queries, queryID)
		r.mu.Unlock()
	}
}

// Cancel cancels a tracked query and reports whether one was running.
func (r *Registry) Cancel(queryID int64) bool {
	r.mu.Lock()
	cancel, ok := r.queries[queryID]
	r.mu.Unlock()
	if ok {
		cancel()
	}
	return ok
}

// CloseAll closes and forgets every session.
func (r *Registry) CloseAll() {
	r.mu.Lock()
	all := r.sessions
	r.sessions = map[string]Session{}
	r.mu.Unlock()
	for _, s := range all {
		s.Close()
	}
}
