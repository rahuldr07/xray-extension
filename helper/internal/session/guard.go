package session

import (
	"net"
	"strings"
)

// TLSRequiredMessage is the refusal copy for tls "disable" to a remote host.
const TLSRequiredMessage = "This server is not on this computer, so XRAY requires TLS. Choose Require or Verify full."

// blocked are the first keywords that could end or change the read-only
// wrapping transaction.
var blocked = map[string]bool{
	"BEGIN": true, "START": true, "COMMIT": true, "END": true, "ROLLBACK": true, "ABORT": true,
	"SAVEPOINT": true, "RELEASE": true, "SET": true, "RESET": true, "DISCARD": true,
	"PREPARE": true, "LOCK": true,
}

// Guard returns the statement's first keyword, upper-cased, when read-only
// mode must refuse it, and "" otherwise. It skips whitespace, empty
// statements (";") and "--" and (nested) "/* */" comments.
func Guard(sql string) (blockedKeyword string) {
	i := skipNoise(sql)
	j := i
	for j < len(sql) && isWordByte(sql[j]) {
		j++
	}
	kw := strings.ToUpper(sql[i:j])
	if blocked[kw] {
		return kw
	}
	return ""
}

func isWordByte(b byte) bool {
	return b == '_' || (b >= 'a' && b <= 'z') || (b >= 'A' && b <= 'Z') || (b >= '0' && b <= '9')
}

func skipNoise(s string) int {
	i := 0
	for i < len(s) {
		switch c := s[i]; {
		case c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '\f' || c == '\v' || c == ';':
			i++
		case strings.HasPrefix(s[i:], "--"):
			for i < len(s) && s[i] != '\n' {
				i++
			}
		case strings.HasPrefix(s[i:], "/*"):
			depth := 0
			for i < len(s) {
				if strings.HasPrefix(s[i:], "/*") {
					depth++
					i += 2
				} else if strings.HasPrefix(s[i:], "*/") {
					depth--
					i += 2
					if depth == 0 {
						break
					}
				} else {
					i++
				}
			}
		default:
			return i
		}
	}
	return i
}

// IsLoopback reports whether host names this computer: "localhost",
// 127.0.0.0/8 or ::1 (brackets allowed).
func IsLoopback(host string) bool {
	h := strings.TrimSuffix(strings.TrimPrefix(host, "["), "]")
	if strings.EqualFold(h, "localhost") {
		return true
	}
	ip := net.ParseIP(h)
	return ip != nil && ip.IsLoopback()
}
