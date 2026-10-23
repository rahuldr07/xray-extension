#!/usr/bin/env bash
# Installs xray-db-helper and registers it as a Chrome native-messaging host.
#
#   install.sh [--binary PATH] [--version helper-vX.Y.Z]
#
# Without --binary it downloads the release binary for this OS/arch and verifies
# it against the release's SHA256SUMS before installing anything.
set -euo pipefail

XRAY_EXTENSION_ID="kjfoocnkoajdcjabnadfojdfaghpbeep"
HOST_NAME="com.xray.db_helper"
REPO="rahuldr07/xray-extension"

binary=""
version=""
while [ $# -gt 0 ]; do
  case "$1" in
    --binary)  [ $# -ge 2 ] || { echo "--binary needs a path" >&2; exit 2; }; binary="$2"; shift 2 ;;
    --version) [ $# -ge 2 ] || { echo "--version needs a tag" >&2; exit 2; }; version="$2"; shift 2 ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

case "$(uname -s)" in
  Darwin) os=darwin
          install_dir="$HOME/Library/Application Support/XRAY"
          browser_base="$HOME/Library/Application Support" ;;
  Linux)  os=linux
          install_dir="$HOME/.local/share/xray"
          browser_base="$HOME/.config" ;;
  *) echo "unsupported OS: $(uname -s) (use install.ps1 on Windows)" >&2; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64|amd64) arch=amd64 ;;
  arm64|aarch64) arch=arm64 ;;
  *) echo "unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if [ -z "$binary" ]; then
  name="xray-db-helper-$os-$arch"
  if [ -z "$version" ]; then
    version="$(curl -fsSL "https://api.github.com/repos/$REPO/releases?per_page=100" \
      | sed -n 's/.*"tag_name": *"\(helper-v[^"]*\)".*/\1/p' | head -n 1)"
    [ -n "$version" ] || { echo "could not find a helper-v* release" >&2; exit 1; }
  fi
  base="https://github.com/$REPO/releases/download/$version"
  curl -fsSL -o "$tmp/$name" "$base/$name"
  curl -fsSL -o "$tmp/SHA256SUMS" "$base/SHA256SUMS"
  want="$(awk -v n="$name" '$2 == n || $2 == "*" n { print $1 }' "$tmp/SHA256SUMS" | head -n 1)"
  [ -n "$want" ] || { echo "no checksum for $name in SHA256SUMS" >&2; exit 1; }
  if command -v sha256sum >/dev/null 2>&1; then
    got="$(sha256sum "$tmp/$name" | awk '{print $1}')"
  else
    got="$(shasum -a 256 "$tmp/$name" | awk '{print $1}')"
  fi
  if [ "$got" != "$want" ]; then
    echo "checksum mismatch for $name: refusing to install" >&2
    exit 1
  fi
  binary="$tmp/$name"
fi
[ -f "$binary" ] || { echo "binary not found: $binary" >&2; exit 1; }

mkdir -p "$install_dir"
dest="$install_dir/xray-db-helper"
cp "$binary" "$dest.tmp"
chmod 755 "$dest.tmp"
mv -f "$dest.tmp" "$dest"

# JSON-escape the path (backslash and double quote) for the host manifest.
json_path="$(printf '%s' "$dest" | sed 's/\\/\\\\/g; s/"/\\"/g')"

count=0
for browser in google-chrome chromium microsoft-edge BraveSoftware/Brave-Browser; do
  [ -d "$browser_base/$browser" ] || continue
  hosts="$browser_base/$browser/NativeMessagingHosts"
  mkdir -p "$hosts"
  cat > "$hosts/$HOST_NAME.json" <<JSON
{
  "name": "$HOST_NAME",
  "description": "XRAY database helper",
  "path": "$json_path",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$XRAY_EXTENSION_ID/"]
}
JSON
  echo "registered for $browser"
  count=$((count + 1))
done

echo "installed $dest"
[ "$count" -gt 0 ] || echo "no supported browser profile directory found; nothing registered" >&2
