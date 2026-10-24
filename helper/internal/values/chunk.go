package values

import (
	"encoding/json"
	"errors"
	"unicode/utf8"
)

// ErrRowTooLarge means a row cannot be made to fit in one chunk even after
// every shrinkable cell was cut down to nothing.
var ErrRowTooLarge = errors.New("row too large to fit in a chunk")

// Chunker groups rows into chunks whose JSON encoding stays within MaxBytes
// (zero means MaxChunkBytes).
type Chunker struct {
	MaxBytes int

	rows  [][]Cell
	bytes int // marshalled size of rows, excluding the enclosing brackets
	cut   int
}

func (c *Chunker) limit() int {
	if c.MaxBytes <= 0 {
		return MaxChunkBytes
	}
	return c.MaxBytes
}

// Add buffers row, which the Chunker keeps and may mutate: pass a fresh slice.
// If adding it would push the buffer past the limit, the buffered rows are
// returned as flush first. A row that alone exceeds the limit has its largest
// text and blob-preview cells halved until it fits. cut counts the cells that
// halving cut and that alreadyCut (may be nil) did not already mark as cut.
// When nothing shrinkable is left and the row still does not fit, Add returns
// ErrRowTooLarge and does not buffer the row.
func (c *Chunker) Add(row []Cell, alreadyCut []bool) (flush [][]Cell, cut int, err error) {
	max := c.limit()
	rb, cut, err := fit(row, alreadyCut, max-2)
	if err != nil {
		return nil, 0, err
	}
	c.cut += cut
	sep := 0
	if len(c.rows) > 0 {
		sep = 1
	}
	if len(c.rows) > 0 && 2+c.bytes+sep+rb > max {
		flush = c.take()
		sep = 0
	}
	c.rows = append(c.rows, row)
	c.bytes += sep + rb
	return flush, cut, nil
}

// Flush returns any buffered rows, or nil when there are none.
func (c *Chunker) Flush() [][]Cell {
	if len(c.rows) == 0 {
		return nil
	}
	return c.take()
}

// Cut is the running total of cells cut by Add.
func (c *Chunker) Cut() int { return c.cut }

func (c *Chunker) take() [][]Cell {
	r := c.rows
	c.rows, c.bytes = nil, 0
	return r
}

func cellSize(cell Cell) int {
	b, err := json.Marshal(cell)
	if err != nil {
		return 0
	}
	return len(b)
}

// fit shrinks row until its marshalled size is at most limit and returns that
// size and the number of newly cut cells.
func fit(row []Cell, alreadyCut []bool, limit int) (size, cut int, err error) {
	sizes := make([]int, len(row))
	size = 2
	for i, cell := range row {
		sizes[i] = cellSize(cell)
		size += sizes[i]
	}
	if len(row) > 1 {
		size += len(row) - 1
	}
	touched := make([]bool, len(row))
	for size > limit {
		idx := -1
		for i, cell := range row {
			if shrinkable(cell) && (idx < 0 || sizes[i] > sizes[idx]) {
				idx = i
			}
		}
		if idx < 0 {
			return 0, 0, ErrRowTooLarge
		}
		row[idx] = halve(row[idx])
		touched[idx] = true
		n := cellSize(row[idx])
		size += n - sizes[idx]
		sizes[idx] = n
	}
	for i, t := range touched {
		if t && !(i < len(alreadyCut) && alreadyCut[i]) {
			cut++
		}
	}
	return size, cut, nil
}

func shrinkable(cell Cell) bool {
	switch v := cell.(type) {
	case string:
		return len(v) > 0
	case map[string]any:
		h, ok := v["hex"].(string)
		return ok && len(h) > 0
	}
	return false
}

func halve(cell Cell) Cell {
	switch v := cell.(type) {
	case string:
		n := len(v) / 2
		for n > 0 && !utf8.RuneStart(v[n]) {
			n--
		}
		return v[:n]
	case map[string]any:
		h := v["hex"].(string)
		return map[string]any{"hex": h[:len(h)/2&^1], "length": v["length"]}
	}
	return cell
}
