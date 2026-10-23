// Package values maps database values to lossless JSON cells and packs rows
// into chunks that fit the native-messaging size cap.
package values

import (
	"encoding/hex"
	"math"
	"strconv"
	"strings"
	"unicode/utf8"
)

// Cell is a JSON-marshalable value: nil, bool, number, string, or a binary
// preview object.
type Cell = any

const (
	// MaxChunkBytes is the target ceiling for one marshalled rows chunk.
	MaxChunkBytes = 524288
	// MaxCellChars is the longest text cell kept, in characters.
	MaxCellChars = 1048576
	// BlobPreviewBytes is how many leading bytes of a binary value are kept.
	BlobPreviewBytes = 256
)

const maxSafeInt = 1<<53 - 1

// Postgres type OIDs.
const (
	oidBool    = 16
	oidBytea   = 17
	oidInt8    = 20
	oidInt2    = 21
	oidInt4    = 23
	oidFloat4  = 700
	oidFloat8  = 701
	oidNumeric = 1700
)

// FromPG maps a text-format Postgres value. truncated reports that a text
// value was cut to MaxCellChars.
func FromPG(oid uint32, text []byte, isNull bool) (Cell, bool) {
	if isNull {
		return nil, false
	}
	s := string(text)
	switch oid {
	case oidBool:
		return s == "t" || s == "true", false
	case oidInt2, oidInt4:
		return safeInt(s)
	case oidFloat4, oidFloat8:
		return finiteFloat(s)
	case oidBytea:
		if b, err := hex.DecodeString(strings.TrimPrefix(s, `\x`)); err == nil && strings.HasPrefix(s, `\x`) {
			return blob(b), false
		}
		return blob(text), false
	case oidInt8, oidNumeric:
		return textCell(s)
	}
	return textCell(s)
}

// FromMySQL maps a MySQL value by its driver database type name.
func FromMySQL(dbType string, raw []byte, isNull bool) (Cell, bool) {
	if isNull {
		return nil, false
	}
	t := strings.TrimPrefix(strings.ToUpper(dbType), "UNSIGNED ")
	switch t {
	case "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "INTEGER":
		return safeInt(string(raw))
	case "FLOAT", "DOUBLE":
		return finiteFloat(string(raw))
	case "BIT", "BLOB", "TINYBLOB", "MEDIUMBLOB", "LONGBLOB", "BINARY", "VARBINARY":
		return blob(raw), false
	}
	// BIGINT, DECIMAL, JSON, dates and everything else keep the server text.
	return textCell(string(raw))
}

func safeInt(s string) (Cell, bool) {
	n, err := strconv.ParseInt(s, 10, 64)
	if err != nil || n > maxSafeInt || n < -maxSafeInt {
		return textCell(s)
	}
	return n, false
}

func finiteFloat(s string) (Cell, bool) {
	f, err := strconv.ParseFloat(s, 64)
	if err != nil || math.IsNaN(f) || math.IsInf(f, 0) {
		return textCell(s)
	}
	return f, false
}

func blob(b []byte) Cell {
	n := len(b)
	if n > BlobPreviewBytes {
		b = b[:BlobPreviewBytes]
	}
	return map[string]any{"hex": hex.EncodeToString(b), "length": n}
}

func textCell(s string) (Cell, bool) {
	// Fast path: byte length is an upper bound on rune count.
	if len(s) <= MaxCellChars {
		return s, false
	}
	if utf8.RuneCountInString(s) <= MaxCellChars {
		return s, false
	}
	i, n := 0, 0
	for n < MaxCellChars {
		_, w := utf8.DecodeRuneInString(s[i:])
		i += w
		n++
	}
	return s[:i], true
}
