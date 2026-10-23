#!/usr/bin/env bash
# Exercises install.sh / uninstall.sh against a throwaway HOME. No network.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }

export HOME="$tmp/home"
mkdir -p "$HOME/.config/chromium" "$HOME/.config/google-chrome"
printf '#!/bin/sh\nexit 0\n' > "$tmp/dummy"

expected_id="$(sed -n 's/^XRAY_EXTENSION_ID="\([a-p]\{32\}\)"$/\1/p' "$here/install.sh")"
[ -n "$expected_id" ] || fail "install.sh has no XRAY_EXTENSION_ID"

bash "$here/install.sh" --binary "$tmp/dummy" >/dev/null

case "$(uname -s)" in
  Darwin) bin="$HOME/Library/Application Support/XRAY/xray-db-helper"
          base="$HOME/Library/Application Support" ;;
  *)      bin="$HOME/.local/share/xray/xray-db-helper"
          base="$HOME/.config" ;;
esac
[ -x "$bin" ] || fail "binary missing or not executable: $bin"

for browser in chromium google-chrome; do
  m="$base/$browser/NativeMessagingHosts/com.xray.db_helper.json"
  [ -f "$m" ] || fail "no host manifest for $browser"
  python3 - "$m" "$bin" "$expected_id" <<'PY' || fail "manifest content wrong for $browser"
import json, sys
m = json.load(open(sys.argv[1]))
assert m == {
    "name": "com.xray.db_helper",
    "description": "XRAY database helper",
    "path": sys.argv[2],
    "type": "stdio",
    "allowed_origins": ["chrome-extension://%s/" % sys.argv[3]],
}, m
PY
done

# Browsers that are not installed are left alone.
[ ! -e "$base/microsoft-edge" ] || fail "created a directory for an absent browser"
[ ! -e "$base/BraveSoftware" ] || fail "created a directory for an absent browser"

# A second run overwrites cleanly.
bash "$here/install.sh" --binary "$tmp/dummy" >/dev/null

bash "$here/uninstall.sh" >/dev/null
[ ! -e "$bin" ] || fail "uninstall left the binary"
for browser in chromium google-chrome; do
  [ ! -e "$base/$browser/NativeMessagingHosts/com.xray.db_helper.json" ] || fail "uninstall left a manifest for $browser"
done
[ -d "$base/chromium" ] || fail "uninstall removed the browser's own directory"

# Unknown flags and a missing binary are errors.
if bash "$here/install.sh" --bogus >/dev/null 2>&1; then fail "accepted an unknown flag"; fi
if bash "$here/install.sh" --binary "$tmp/nope" >/dev/null 2>&1; then fail "accepted a missing binary"; fi

echo "install.test.sh: ok"
