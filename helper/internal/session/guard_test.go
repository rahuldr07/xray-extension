package session

import "testing"

func TestGuard(t *testing.T) {
	cases := []struct{ sql, want string }{
		{"  -- c\nCOMMIT", "COMMIT"},
		{"/*x*/set x=1", "SET"},
		{"with a as (select 1) select * from a", ""},
		{"select 1", ""},
		{"/* a /* nested */ still comment */ begin", "BEGIN"},
		{";; rollback", "ROLLBACK"},
		{"\tStart transaction", "START"},
		{"end", "END"},
		{"abort", "ABORT"},
		{"savepoint s", "SAVEPOINT"},
		{"release s", "RELEASE"},
		{"reset all", "RESET"},
		{"discard all", "DISCARD"},
		{"prepare p as select 1", "PREPARE"},
		{"lock table t", "LOCK"},
		{"settle", ""},
		{"update t set x=1", ""},
		{"", ""},
		{"-- only a comment", ""},
	}
	for _, c := range cases {
		if got := Guard(c.sql); got != c.want {
			t.Errorf("Guard(%q) = %q, want %q", c.sql, got, c.want)
		}
	}
}

func TestIsLoopback(t *testing.T) {
	for _, h := range []string{"localhost", "LOCALHOST", "127.0.0.5", "::1", "[::1]", "127.0.0.1"} {
		if !IsLoopback(h) {
			t.Errorf("IsLoopback(%q) = false, want true", h)
		}
	}
	for _, h := range []string{"db.example.com", "10.0.0.1", "", "localhost.example.com", "128.0.0.1"} {
		if IsLoopback(h) {
			t.Errorf("IsLoopback(%q) = true, want false", h)
		}
	}
}
