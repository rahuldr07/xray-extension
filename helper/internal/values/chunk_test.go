package values

import (
	"encoding/json"
	"strings"
	"testing"
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
		flush, _ := ch.Add([]Cell{i, strings.Repeat("x", 100), nil})
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
	flush, ok := ch.Add([]Cell{big, big})
	if flush != nil {
		t.Fatal("nothing buffered to flush")
	}
	if ok {
		t.Fatal("expected truncation to be reported")
	}
	if !ch.Truncated() {
		t.Fatal("Truncated should be set")
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
		f, ok := ch.Add([]Cell{strings.Repeat("y", 30)})
		if !ok {
			t.Fatal("unexpected truncation")
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
