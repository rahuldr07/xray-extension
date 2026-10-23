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
	"PREPARE": true, "LOCK": true, "COPY": true,
}

// Guard returns the statement's first keyword and whether read-only mode
// must refuse it. It fails closed: a statement without a first keyword
// (empty, only comments, or starting with a byte that is not a word) is
// refused, since the guard cannot tell what it does.
func Guard(sql string) (keyword string, refused bool) {
	kw := FirstKeyword(sql)
	return kw, kw == "" || blocked[kw]
}

// Blocked reports whether kw is a first keyword read-only mode refuses
// because it could end or change the wrapping transaction.
func Blocked(kw string) bool { return blocked[kw] }

// ReadOnlyMessage is the refusal text for first keyword kw.
func ReadOnlyMessage(kw string) string {
	if kw == "" {
		return "This connection is read-only, so a statement that does not start with a keyword is not allowed."
	}
	return "This connection is read-only, so " + kw + " is not allowed."
}

// FirstKeyword returns the statement's first word, upper-cased, or "(" for a
// parenthesised statement. It skips whitespace, empty statements (";") and
// "--" and (nested) "/* */" comments. "" means there is no first word.
func FirstKeyword(sql string) string {
	i := skipNoise(sql)
	if i < len(sql) && sql[i] == '(' {
		return "("
	}
	j := i
	for j < len(sql) && isWordByte(sql[j]) {
		j++
	}
	return strings.ToUpper(sql[i:j])
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
