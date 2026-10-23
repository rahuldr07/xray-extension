package values

import (
	"encoding/json"
	"unicode/utf8"
)

// Chunker groups rows into chunks whose JSON encoding stays within MaxBytes.
type Chunker struct {
	MaxBytes int

	rows      [][]Cell
	bytes     int // marshalled size of rows, excluding the enclosing brackets
	truncated bool
}

// Add buffers row. If adding it would push the buffer past MaxBytes, the
// buffered rows are returned as flush first. A row that alone exceeds MaxBytes
// has its largest text cells halved until it fits; ok is false when that
// happened (the row is still added) and Truncated reports it cumulatively.
func (c *Chunker) Add(row []Cell) (flush [][]Cell, ok bool) {
	ok = true
	rb := rowSize(row)
	if rb+2 > c.MaxBytes {
		ok = !shrink(row, c.MaxBytes-2)
		if !ok {
			c.truncated = true
		}
		rb = rowSize(row)
	}
	sep := 0
	if len(c.rows) > 0 {
		sep = 1
	}
	if len(c.rows) > 0 && 2+c.bytes+sep+rb > c.MaxBytes {
		flush = c.take()
		sep = 0
	}
	c.rows = append(c.rows, row)
	c.bytes += sep + rb
	return flush, ok
}

// Flush returns any buffered rows, or nil when there are none.
func (c *Chunker) Flush() [][]Cell {
	if len(c.rows) == 0 {
		return nil
	}
	return c.take()
}

// Truncated reports whether any row had cells cut to fit a chunk.
func (c *Chunker) Truncated() bool { return c.truncated }

func (c *Chunker) take() [][]Cell {
	r := c.rows
	c.rows, c.bytes = nil, 0
	return r
}

func rowSize(row []Cell) int {
	b, err := json.Marshal(row)
	if err != nil {
		return 0
	}
	return len(b)
}

// shrink halves the largest string cell until the row marshals within limit.
// It reports whether any cell was cut.
func shrink(row []Cell, limit int) bool {
	cut := false
	for rowSize(row) > limit {
		idx, best := -1, 0
		for i, cell := range row {
			if s, isStr := cell.(string); isStr && len(s) > best {
				idx, best = i, len(s)
			}
		}
		if idx < 0 {
			break
		}
		s := row[idx].(string)
		n := len(s) / 2
		for n > 0 && !utf8.RuneStart(s[n]) {
			n--
		}
		row[idx] = s[:n]
		cut = true
	}
	return cut
}
