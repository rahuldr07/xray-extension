// Command xray-db-helper is the native-messaging host for the XRAY SQL client.
package main

import (
	"os"

	"github.com/rahuldr07/xray-extension/helper/internal/my"
	"github.com/rahuldr07/xray-extension/helper/internal/pg"
	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
	"github.com/rahuldr07/xray-extension/helper/internal/session"
)

// version is set at build time: -ldflags "-X main.version=...".
var version = "0.0.0-dev"

// newHandler wires the database engines into the ops dispatcher.
func newHandler() protocol.Handler {
	return session.NewOps(map[string]session.Connector{"postgres": pg.Connect, "mysql": my.Connect})
}

func main() {
	if err := protocol.ServeWith(os.Stdin, os.Stdout, os.Stderr, version, newHandler()); err != nil {
		os.Exit(1)
	}
}
