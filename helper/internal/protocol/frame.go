// Package protocol implements Chrome Native Messaging framing and the
// request/response envelope spoken between the XRAY extension and xray-db-helper.
package protocol

import (
	"encoding/binary"
	"encoding/json"
	"errors"
	"io"
	"sync"
)

const (
	// MaxIncomingFrame is the largest frame Chrome may send us (64 MiB).
	MaxIncomingFrame = 64 << 20
	// MaxOutgoingPayload is the largest payload we may send (Chrome caps host messages at 1 MiB).
	MaxOutgoingPayload = 1 << 20
)

var (
	ErrFrameTooLarge   = errors.New("frame too large")
	ErrPayloadTooLarge = errors.New("payload too large")
)

// byteOrder is native endian, as Native Messaging requires. A variable so tests can stub it.
var byteOrder binary.ByteOrder = binary.NativeEndian

// ReadFrame reads one length-prefixed frame. It returns io.EOF only on a clean end of input.
func ReadFrame(r io.Reader) ([]byte, error) {
	var hdr [4]byte
	if _, err := io.ReadFull(r, hdr[:]); err != nil {
		return nil, err
	}
	n := byteOrder.Uint32(hdr[:])
	if n > MaxIncomingFrame {
		return nil, ErrFrameTooLarge
	}
	buf := make([]byte, n)
	if _, err := io.ReadFull(r, buf); err != nil {
		if err == io.EOF {
			err = io.ErrUnexpectedEOF
		}
		return nil, err
	}
	return buf, nil
}

// WriteFrame writes one length-prefixed frame in a single Write call.
func WriteFrame(w io.Writer, payload []byte) error {
	if len(payload) > MaxOutgoingPayload {
		return ErrPayloadTooLarge
	}
	buf := make([]byte, 4+len(payload))
	byteOrder.PutUint32(buf[:4], uint32(len(payload)))
	copy(buf[4:], payload)
	_, err := w.Write(buf)
	return err
}

// Writer serializes concurrent frame writes to one stream.
type Writer struct {
	mu sync.Mutex
	w  io.Writer
}

func NewWriter(w io.Writer) *Writer { return &Writer{w: w} }

// Send marshals v and writes it as one frame.
func (w *Writer) Send(v any) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}
	w.mu.Lock()
	defer w.mu.Unlock()
	return WriteFrame(w.w, b)
}
