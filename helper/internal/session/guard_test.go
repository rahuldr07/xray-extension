package session

import "testing"

func TestGuard(t *testing.T) {
	cases := []struct {
		sql, want string
		refused   bool
	}{
		{"  -- c\nCOMMIT", "COMMIT", true},
		{"/*x*/set x=1", "SET", true},
		{"with a as (select 1) select * from a", "WITH", false},
		{"select 1", "SELECT", false},
		{"/* a /* nested */ still comment */ begin", "BEGIN", true},
		{";; rollback", "ROLLBACK", true},
		{"\tStart transaction", "START", true},
		{"end", "END", true},
		{"abort", "ABORT", true},
		{"savepoint s", "SAVEPOINT", true},
		{"release s", "RELEASE", true},
		{"reset all", "RESET", true},
		{"discard all", "DISCARD", true},
		{"prepare p as select 1", "PREPARE", true},
		{"lock table t", "LOCK", true},
		{"copy t to program 'id'", "COPY", true},
		{"settle", "SETTLE", false},
		{"update t set x=1", "UPDATE", false},
		// Fail closed: a statement without a first keyword is refused.
		{"", "", true},
		{"-- only a comment", "", true},
		{"\x01select 1", "", true},
		// Postgres reads "--" as a comment whatever byte follows it.
		{"--\x01\ncommit", "COMMIT", true},
		{"--\x1fx\ncreate table t(a int)", "CREATE", false},
		{"(select 1)", "(", false},
	}
	for _, c := range cases {
		if got, refused := Guard(c.sql); got != c.want || refused != c.refused {
			t.Errorf("Guard(%q) = %q, %v, want %q, %v", c.sql, got, refused, c.want, c.refused)
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

func TestReadOnlyMessage(t *testing.T) {
	if m := ReadOnlyMessage("COMMIT"); m != "This connection is read-only, so COMMIT is not allowed." {
		t.Fatal(m)
	}
	if m := ReadOnlyMessage(""); m != "This connection is read-only, so a statement that does not start with a keyword is not allowed." {
		t.Fatal(m)
	}
}
