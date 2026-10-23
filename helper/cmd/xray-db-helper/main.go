// Command xray-db-helper is the native-messaging host for the XRAY SQL client.
package main

import (
	"os"

	"github.com/rahuldr07/xray-extension/helper/internal/protocol"
)

// version is set at build time: -ldflags "-X main.version=...".
var version = "0.0.0-dev"

func main() {
	if err := protocol.Serve(os.Stdin, os.Stdout, os.Stderr, version); err != nil {
		os.Exit(1)
	}
}
