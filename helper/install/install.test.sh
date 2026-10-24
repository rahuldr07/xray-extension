#!/usr/bin/env bash
# Exercises install.sh / uninstall.sh against a throwaway HOME, once as the real
# OS and once with `uname` stubbed to Darwin. `curl` is stubbed, so no network.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }

expected_id="$(sed -n 's/^XRAY_EXTENSION_ID="\([a-p]\{32\}\)"$/\1/p' "$here/install.sh")"
[ -n "$expected_id" ] || fail "install.sh has no XRAY_EXTENSION_ID"

printf '#!/bin/sh\nexit 0\n' > "$tmp/dummy"
sha() { if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi; }

# Stub tools, put first on PATH. UNAME_S selects the faked OS; the stub falls
# back to the real uname when it is unset.
stubs="$tmp/stubs"
mkdir -p "$stubs" "$tmp/serve"
cat > "$stubs/uname" <<STUB
#!/bin/sh
if [ -n "\${UNAME_S:-}" ]; then
  case "\$1" in -s) echo "\$UNAME_S"; exit 0 ;; -m) echo x86_64; exit 0 ;; esac
fi
exec $(command -v uname) "\$@"
STUB
# curl stub: serves files from \$SERVE_DIR, rejects non-https and anything but the
# flags the scripts pass, and answers the releases API from \$SERVE_DIR/releases.json.
cat > "$stubs/curl" <<'STUB'
#!/bin/sh
out=""; url=""; proto=0; tls=0
while [ $# -gt 0 ]; do
  case "$1" in
    --proto) [ "$2" = "=https" ] && proto=1; shift 2 ;;
    --tlsv1.2) tls=1; shift ;;
    -o) out="$2"; shift 2 ;;
    -*) shift ;;
    *) url="$1"; shift ;;
  esac
done
[ "$proto" = 1 ] && [ "$tls" = 1 ] || { echo "curl stub: missing --proto/--tlsv1.2" >&2; exit 3; }
case "$url" in
  https://api.github.com/*/releases*) src="$SERVE_DIR/releases.json" ;;
  https://github.com/*/releases/download/*) echo "$url" >> "$SERVE_DIR/urls"; src="$SERVE_DIR/${url##*/}"
    case "$url" in */helper-v1.2.3/*) ;; *) echo "curl stub: unexpected tag in $url" >&2; exit 22 ;; esac ;;
  *) echo "curl stub: unexpected url $url" >&2; exit 22 ;;
esac
[ -f "$src" ] || exit 22
if [ -n "$out" ]; then cp "$src" "$out"; else cat "$src"; fi
STUB
chmod +x "$stubs/uname" "$stubs/curl"
export PATH="$stubs:$PATH" SERVE_DIR="$tmp/serve"

# Newest entry is a prerelease and must be skipped; a non-helper tag is ignored.
cat > "$SERVE_DIR/releases.json" <<'JSON'
[
  {"tag_name": "helper-v9.9.9", "draft": false, "prerelease": true, "assets": []},
  {"tag_name": "v0.3.1", "draft": false, "prerelease": false, "assets": []},
  {"tag_name": "helper-v1.2.3", "draft": false, "prerelease": false, "assets": []},
  {"tag_name": "helper-v1.0.0", "draft": false, "prerelease": false, "assets": []}
]
JSON

check_manifest() { # file expected-path
  python3 - "$1" "$2" "$expected_id" <<'PY' || fail "manifest content wrong: $1"
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
}

run_case() { # label uname-s bin base installed-browsers... -- absent-browsers...
  local label="$1" os="$2" bin="$3" base="$4"; shift 4
  local present=() absent=() seen=0 b
  for b in "$@"; do
    if [ "$b" = "--" ]; then seen=1; continue; fi
    if [ "$seen" = 0 ]; then present+=("$b"); else absent+=("$b"); fi
  done
  export HOME="$tmp/home-$label"
  rm -rf "$HOME"; mkdir -p "$HOME"
  if [ -n "$os" ]; then export UNAME_S="$os"; else unset UNAME_S; fi
  bin="${bin//@HOME@/$HOME}"; base="${base//@HOME@/$HOME}"
  for b in "${present[@]}"; do mkdir -p "$base/$b"; done

  bash "$here/install.sh" --binary "$tmp/dummy" >/dev/null
  [ -x "$bin" ] || fail "[$label] binary missing or not executable: $bin"
  for b in "${present[@]}"; do
    m="$base/$b/NativeMessagingHosts/com.xray.db_helper.json"
    [ -f "$m" ] || fail "[$label] no host manifest for $b"
    check_manifest "$m" "$bin"
  done
  for b in "${absent[@]}"; do
    [ ! -e "$base/$b" ] || fail "[$label] created a directory for absent browser $b"
  done

  bash "$here/install.sh" --binary "$tmp/dummy" >/dev/null   # overwrite cleanly

  bash "$here/uninstall.sh" >/dev/null
  [ ! -e "$bin" ] || fail "[$label] uninstall left the binary"
  for b in "${present[@]}"; do
    [ ! -e "$base/$b/NativeMessagingHosts/com.xray.db_helper.json" ] || fail "[$label] uninstall left a manifest for $b"
    [ -d "$base/$b" ] || fail "[$label] uninstall removed the browser's own directory"
  done

  if bash "$here/install.sh" --bogus >/dev/null 2>&1; then fail "[$label] accepted an unknown flag"; fi
  if bash "$here/install.sh" --binary "$tmp/nope" >/dev/null 2>&1; then fail "[$label] accepted a missing binary"; fi

  # Default path: resolves the newest non-prerelease helper-v* tag, downloads
  # the binary and SHA256SUMS, verifies, installs.
  local goos=linux; [ "$os" = Darwin ] && goos=darwin
  local asset="xray-db-helper-$goos-amd64"
  cp "$tmp/dummy" "$SERVE_DIR/$asset"
  echo "$(sha "$SERVE_DIR/$asset")  $asset" > "$SERVE_DIR/SHA256SUMS"
  : > "$SERVE_DIR/urls"
  bash "$here/install.sh" >/dev/null
  [ -x "$bin" ] || fail "[$label] download install produced no binary"
  grep -q "/helper-v1.2.3/$asset\$" "$SERVE_DIR/urls" || fail "[$label] did not pick helper-v1.2.3 (got: $(cat "$SERVE_DIR/urls"))"
  bash "$here/uninstall.sh" >/dev/null

  # Checksum mismatch: exit 1, nothing installed or registered.
  echo "0000000000000000000000000000000000000000000000000000000000000000  $asset" > "$SERVE_DIR/SHA256SUMS"
  if bash "$here/install.sh" >/dev/null 2>"$tmp/err"; then fail "[$label] installed despite a checksum mismatch"; fi
  grep -q "checksum mismatch" "$tmp/err" || fail "[$label] no mismatch message"
  [ ! -e "$bin" ] || fail "[$label] binary installed after a mismatch"
  for b in "${present[@]}"; do
    [ ! -e "$base/$b/NativeMessagingHosts/com.xray.db_helper.json" ] || fail "[$label] manifest written after a mismatch"
  done
  echo "ok: $label"
}

# Linux layout (the real OS when run on Linux; uname stubbed otherwise).
run_case linux Linux \
  "@HOME@/.local/share/xray/xray-db-helper" "@HOME@/.config" \
  chromium google-chrome -- microsoft-edge BraveSoftware

# macOS layout, with `uname` stubbed, so both branches run on any host.
run_case darwin Darwin \
  "@HOME@/Library/Application Support/XRAY/xray-db-helper" "@HOME@/Library/Application Support" \
  "Google/Chrome" "Microsoft Edge" -- Chromium BraveSoftware

# The Linux names must not register anything on macOS (the old bug).
export HOME="$tmp/home-wrongnames" UNAME_S=Darwin
mkdir -p "$HOME/Library/Application Support/google-chrome" "$HOME/Library/Application Support/chromium"
bash "$here/install.sh" --binary "$tmp/dummy" >/dev/null 2>&1
[ ! -e "$HOME/Library/Application Support/google-chrome/NativeMessagingHosts" ] || fail "darwin used a Linux directory name"

echo "install.test.sh: ok"
