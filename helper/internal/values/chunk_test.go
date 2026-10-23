package values

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"unicode/utf8"
)

func size(t *testing.T, rows [][]Cell) int {
	t.Helper()
	b, err := json.Marshal(rows)
	if err != nil {
		t.Fatal(err)
	}
	return len(b)
}

func TestChunkerManySmallRows(t *testing.T) {
	ch := &Chunker{MaxBytes: MaxChunkBytes}
	var chunks [][][]Cell
	total := 0
	for i := 0; i < 10000; i++ {
		flush, _, _ := ch.Add([]Cell{i, strings.Repeat("x", 100), nil}, nil)
		if flush != nil {
			chunks = append(chunks, flush)
		}
	}
	if f := ch.Flush(); f != nil {
		chunks = append(chunks, f)
	}
	if len(chunks) < 2 {
		t.Fatalf("expected several chunks, got %d", len(chunks))
	}
	for _, c := range chunks {
		total += len(c)
		if s := size(t, c); s > MaxChunkBytes {
			t.Fatalf("chunk %d bytes", s)
		}
	}
	if total != 10000 {
		t.Fatalf("rows %d", total)
	}
	if ch.Flush() != nil {
		t.Fatal("second flush should be empty")
	}
}

func TestChunkerOversizeRow(t *testing.T) {
	ch := &Chunker{MaxBytes: MaxChunkBytes}
	big := strings.Repeat("a", 900000)
	flush, cut, err := ch.Add([]Cell{big, big}, nil)
	if err != nil || flush != nil {
		t.Fatalf("flush=%v err=%v", flush != nil, err)
	}
	if cut != 2 || ch.Cut() != 2 {
		t.Fatalf("cut=%d total=%d", cut, ch.Cut())
	}
	rows := ch.Flush()
	if len(rows) != 1 {
		t.Fatalf("rows %d", len(rows))
	}
	if s := size(t, rows); s > MaxChunkBytes {
		t.Fatalf("size %d", s)
	}
}

func TestChunkerFlushesBeforeOverflow(t *testing.T) {
	ch := &Chunker{MaxBytes: 100}
	var out [][]Cell
	for i := 0; i < 5; i++ {
		f, cut, err := ch.Add([]Cell{strings.Repeat("y", 30)}, nil)
		if err != nil || cut != 0 {
			t.Fatalf("cut=%d err=%v", cut, err)
		}
		out = append(out, f...)
		if f != nil && size(t, f) > 100 {
			t.Fatal("too big")
		}
	}
	out = append(out, ch.Flush()...)
	if len(out) != 5 {
		t.Fatalf("rows %d", len(out))
	}
}

func TestChunkerEscapeInflation(t *testing.T) {
	ch := &Chunker{}
	quotes := strings.Repeat(`"`, 200000)
	ctrl := strings.Repeat("\x01", 200000)
	if _, cut, err := ch.Add([]Cell{quotes, ctrl}, nil); err != nil || cut == 0 {
		t.Fatalf("cut=%d err=%v", cut, err)
	}
	if s := size(t, ch.Flush()); s > MaxChunkBytes {
		t.Fatalf("size %d", s)
	}
}

func TestChunkerCutsStayValid(t *testing.T) {
	for _, unit := range []string{"é", "😀", "\xff\xfe"} {
		ch := &Chunker{MaxBytes: 1000}
		cell := strings.Repeat(unit, 5000)
		if _, cut, err := ch.Add([]Cell{cell}, nil); err != nil || cut != 1 {
			t.Fatalf("%q cut=%d err=%v", unit, cut, err)
		}
		rows := ch.Flush()
		b, err := json.Marshal(rows)
		if err != nil || !json.Valid(b) || len(b) > 1000 {
			t.Fatalf("%q invalid or oversize: %v %d", unit, err, len(b))
		}
		if s := rows[0][0].(string); unit != "\xff\xfe" && !utf8.ValidString(s) {
			t.Fatalf("%q cut mid-rune", unit)
		}
	}
}

func TestChunkerExactBoundary(t *testing.T) {
	row := []Cell{"abcdef"}
	exact := size(t, [][]Cell{row})
	ch := &Chunker{MaxBytes: exact}
	if f, cut, err := ch.Add([]Cell{"abcdef"}, nil); f != nil || cut != 0 || err != nil {
		t.Fatalf("exact row altered: cut=%d err=%v", cut, err)
	}
	ch = &Chunker{MaxBytes: exact - 1}
	if _, cut, err := ch.Add([]Cell{"abcdef"}, nil); err != nil || cut != 1 {
		t.Fatalf("one over: cut=%d err=%v", cut, err)
	}
}

func TestChunkerBlobRow(t *testing.T) {
	row := make([]Cell, 1500)
	for i := range row {
		row[i], _ = FromPG(17, []byte(`\x`+strings.Repeat("ab", 300)), false)
	}
	ch := &Chunker{}
	_, cut, err := ch.Add(row, nil)
	if err != nil && !errors.Is(err, ErrRowTooLarge) {
		t.Fatal(err)
	}
	if err == nil {
		if cut == 0 {
			t.Fatal("expected cuts")
		}
		if s := size(t, ch.Flush()); s > MaxChunkBytes {
			t.Fatalf("size %d", s)
		}
	}
}

func TestChunkerRowTooLarge(t *testing.T) {
	row := make([]Cell, 100)
	for i := range row {
		row[i] = i
	}
	ch := &Chunker{MaxBytes: 50}
	if _, _, err := ch.Add(row, nil); !errors.Is(err, ErrRowTooLarge) {
		t.Fatalf("err=%v", err)
	}
	if ch.Flush() != nil {
		t.Fatal("row must not be buffered")
	}
}

func TestChunkerNoDoubleCount(t *testing.T) {
	ch := &Chunker{MaxBytes: 1000}
	big := strings.Repeat("a", 5000)
	_, cut, err := ch.Add([]Cell{big, big, 1}, []bool{true, false, false})
	if err != nil || cut != 1 {
		t.Fatalf("cut=%d err=%v", cut, err)
	}
}
