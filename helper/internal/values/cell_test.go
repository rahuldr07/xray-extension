package values

import (
	"encoding/json"
	"strings"
	"testing"
)

func mustJSON(t *testing.T, c Cell) string {
	t.Helper()
	b, err := json.Marshal(c)
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

func TestFromPG(t *testing.T) {
	blob := `\x00ff` + strings.Repeat("ab", 298)
	tests := []struct {
		name string
		oid  uint32
		text string
		null bool
		want string
	}{
		{"int8 beyond safe", 20, "9007199254740993", false, `"9007199254740993"`},
		{"int4", 23, "42", false, `42`},
		{"int2 negative", 21, "-7", false, `-7`},
		{"float8 NaN", 701, "NaN", false, `"NaN"`},
		{"float8 Infinity", 701, "Infinity", false, `"Infinity"`},
		{"float8 finite", 701, "1.5", false, `1.5`},
		{"float4", 700, "0.25", false, `0.25`},
		{"numeric", 1700, "1.10", false, `"1.10"`},
		{"bool true", 16, "t", false, `true`},
		{"bool false", 16, "f", false, `false`},
		{"jsonb text", 3802, `{"a": 1}`, false, `"{\"a\": 1}"`},
		{"json text", 114, `[1]`, false, `"[1]"`},
		{"timestamptz", 1184, "2024-01-02 03:04:05.123456+00", false, `"2024-01-02 03:04:05.123456+00"`},
		{"text", 25, "héllo", false, `"héllo"`},
		{"null", 23, "", true, `null`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, trunc := FromPG(tt.oid, []byte(tt.text), tt.null)
			if got := mustJSON(t, c); got != tt.want {
				t.Fatalf("got %s want %s", got, tt.want)
			}
			if trunc {
				t.Fatal("unexpected truncation")
			}
		})
	}

	t.Run("bytea", func(t *testing.T) {
		c, trunc := FromPG(17, []byte(blob), false)
		m, ok := c.(map[string]any)
		if !ok {
			t.Fatalf("got %T", c)
		}
		hex := m["hex"].(string)
		if len(hex) != 512 || !strings.HasPrefix(hex, "00ff") || m["length"] != 300 {
			t.Fatalf("hex len %d length %v", len(hex), m["length"])
		}
		if trunc {
			t.Fatal("blob preview is not truncation")
		}
	})
}

func TestFromPGTruncatesLongText(t *testing.T) {
	long := strings.Repeat("é", MaxCellChars+5)
	c, trunc := FromPG(25, []byte(long), false)
	s := c.(string)
	if !trunc || len([]rune(s)) != MaxCellChars {
		t.Fatalf("trunc=%v runes=%d", trunc, len([]rune(s)))
	}
}

func TestFromMySQL(t *testing.T) {
	blob := string(make([]byte, 300))
	tests := []struct {
		name string
		typ  string
		raw  []byte
		null bool
		want string
	}{
		{"tinyint", "TINYINT", []byte("5"), false, `5`},
		{"int", "INT", []byte("-42"), false, `-42`},
		{"unsigned int", "UNSIGNED INT", []byte("4294967295"), false, `4294967295`},
		{"bigint safe-breaking", "BIGINT", []byte("9007199254740993"), false, `"9007199254740993"`},
		{"unsigned bigint", "UNSIGNED BIGINT", []byte("18446744073709551615"), false, `"18446744073709551615"`},
		{"decimal", "DECIMAL", []byte("1.10"), false, `"1.10"`},
		{"double", "DOUBLE", []byte("2.5"), false, `2.5`},
		{"float", "FLOAT", []byte("0.5"), false, `0.5`},
		{"bit8", "BIT", []byte{0xa5}, false, `{"hex":"a5","length":1}`},
		{"json", "JSON", []byte(`{"a":1}`), false, `"{\"a\":1}"`},
		{"datetime", "DATETIME", []byte("2024-01-02 03:04:05"), false, `"2024-01-02 03:04:05"`},
		{"varchar", "VARCHAR", []byte("hi"), false, `"hi"`},
		{"null", "INT", nil, true, `null`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, trunc := FromMySQL(tt.typ, tt.raw, tt.null)
			if got := mustJSON(t, c); got != tt.want {
				t.Fatalf("got %s want %s", got, tt.want)
			}
			if trunc {
				t.Fatal("unexpected truncation")
			}
		})
	}
	for _, typ := range []string{"BLOB", "LONGBLOB", "BINARY", "VARBINARY"} {
		c, _ := FromMySQL(typ, []byte(blob), false)
		m := c.(map[string]any)
		if len(m["hex"].(string)) != 512 || m["length"] != 300 {
			t.Fatalf("%s: %v", typ, m["length"])
		}
	}
}

func TestSafeIntegerBoundary(t *testing.T) {
	cases := map[string]string{
		"9007199254740991":  `9007199254740991`,
		"-9007199254740991": `-9007199254740991`,
		"9007199254740992":  `"9007199254740992"`,
		"-9007199254740992": `"-9007199254740992"`,
	}
	for in, want := range cases {
		c, _ := FromPG(23, []byte(in), false)
		if got := mustJSON(t, c); got != want {
			t.Fatalf("%s: got %s want %s", in, got, want)
		}
		c, _ = FromMySQL("BIGINT", []byte(in), false)
		if _, isStr := c.(string); !isStr {
			t.Fatalf("bigint %s should be text", in)
		}
		c, _ = FromMySQL("INT", []byte(in), false)
		if got := mustJSON(t, c); got != want {
			t.Fatalf("mysql int %s: got %s want %s", in, got, want)
		}
	}
}
