package protocol

import (
	"bytes"
	"encoding/binary"
	"errors"
	"io"
	"strings"
	"testing"
)

func TestFrameRoundTripBothByteOrders(t *testing.T) {
	orig := byteOrder
	defer func() { byteOrder = orig }()
	for _, o := range []binary.ByteOrder{binary.LittleEndian, binary.BigEndian} {
		byteOrder = o
		var buf bytes.Buffer
		if err := WriteFrame(&buf, []byte(`{"id":1}`)); err != nil {
			t.Fatal(err)
		}
		if got := o.Uint32(buf.Bytes()[:4]); got != 8 {
			t.Fatalf("%v: header = %d, want 8", o, got)
		}
		p, err := ReadFrame(&buf)
		if err != nil || string(p) != `{"id":1}` {
			t.Fatalf("%v: got %q, %v", o, p, err)
		}
	}
}

func TestNativeByteOrderIsDefault(t *testing.T) {
	if byteOrder != binary.NativeEndian {
		t.Fatal("byteOrder must default to binary.NativeEndian")
	}
}

func TestReadFrameRejectsOversize(t *testing.T) {
	var hdr [4]byte
	byteOrder.PutUint32(hdr[:], MaxIncomingFrame+1)
	_, err := ReadFrame(bytes.NewReader(hdr[:]))
	if !errors.Is(err, ErrFrameTooLarge) {
		t.Fatalf("err = %v, want ErrFrameTooLarge", err)
	}
}

func TestReadFrameEOFAndTruncation(t *testing.T) {
	if _, err := ReadFrame(bytes.NewReader(nil)); err != io.EOF {
		t.Fatalf("empty: %v, want io.EOF", err)
	}
	var hdr [4]byte
	byteOrder.PutUint32(hdr[:], 10)
	if _, err := ReadFrame(bytes.NewReader(append(hdr[:], 'x'))); !errors.Is(err, io.ErrUnexpectedEOF) {
		t.Fatalf("truncated: %v, want ErrUnexpectedEOF", err)
	}
}

func TestWriteFrameRefusesOversizePayload(t *testing.T) {
	var buf bytes.Buffer
	err := WriteFrame(&buf, []byte(strings.Repeat("a", MaxOutgoingPayload+1)))
	if !errors.Is(err, ErrPayloadTooLarge) {
		t.Fatalf("err = %v, want ErrPayloadTooLarge", err)
	}
	if buf.Len() != 0 {
		t.Fatal("nothing may be written for a refused payload")
	}
	if err := WriteFrame(&buf, []byte(strings.Repeat("a", MaxOutgoingPayload))); err != nil {
		t.Fatalf("exactly 1 MiB must be accepted: %v", err)
	}
}
