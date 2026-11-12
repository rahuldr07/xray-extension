package main

import (
	"net"
	"os"
	"strconv"
	"strings"
	"testing"

	"github.com/go-sql-driver/mysql"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/rahuldr07/xray-extension/helper/internal/testclient"
)

// The production handler, driven end to end: a failed Postgres connect with a
// wrong password never echoes the password on stdout or stderr.
func TestFailedConnectNeverLeaksPasswordRealPostgres(t *testing.T) {
	dsn := os.Getenv("XRAY_TEST_PG_DSN")
	if dsn == "" {
		t.Skip("XRAY_TEST_PG_DSN is not set")
	}
	cfg, err := pgconn.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	c := testclient.Start(t, newHandler())
	_, f := c.Call(map[string]any{"op": "connect", "engine": "postgres", "host": cfg.Host, "port": cfg.Port,
		"database": cfg.Database, "user": cfg.User, "password": "s3cret-xyz", "tls": "disable", "readOnly": true})
	if testclient.ErrCode(f) != "auth-failed" {
		t.Fatalf("expected auth-failed: %v", f)
	}
	c.Close()
	if strings.Contains(c.Stdout(), "s3cret-xyz") || strings.Contains(c.Stderr(), "s3cret-xyz") {
		t.Fatal("password leaked")
	}
	for _, line := range strings.Split(strings.TrimSpace(c.Stderr()), "\n") {
		if !strings.HasPrefix(line, "xray-db-helper: ") {
			t.Fatalf("stderr line %q is not a code line", line)
		}
	}
}

// The same for MySQL: a wrong password answers auth-failed and appears in
// neither stdout nor stderr.
func TestFailedConnectNeverLeaksPasswordRealMySQL(t *testing.T) {
	dsn := os.Getenv("XRAY_TEST_MYSQL_DSN")
	if dsn == "" {
		t.Skip("XRAY_TEST_MYSQL_DSN is not set")
	}
	cfg, err := mysql.ParseDSN(dsn)
	if err != nil {
		t.Fatal(err)
	}
	host, port, err := net.SplitHostPort(cfg.Addr)
	if err != nil {
		t.Fatal(err)
	}
	p, _ := strconv.Atoi(port)
	c := testclient.Start(t, newHandler())
	_, f := c.Call(map[string]any{"op": "connect", "engine": "mysql", "host": host, "port": p,
		"database": cfg.DBName, "user": cfg.User, "password": "s3cret-xyz", "tls": "disable", "readOnly": true})
	if testclient.ErrCode(f) != "auth-failed" {
		t.Fatalf("expected auth-failed: %v", f)
	}
	c.Close()
	if strings.Contains(c.Stdout(), "s3cret-xyz") || strings.Contains(c.Stderr(), "s3cret-xyz") {
		t.Fatal("password leaked")
	}
	for _, line := range strings.Split(strings.TrimSpace(c.Stderr()), "\n") {
		if !strings.HasPrefix(line, "xray-db-helper: ") {
			t.Fatalf("stderr line %q is not a code line", line)
		}
	}
}
