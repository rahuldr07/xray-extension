package protocol

const Version = 1

// Error codes carried in ErrorBody.Code.
const (
	CodeBadRequest = "bad-request"
	CodeInternal   = "internal"
)

type ErrorBody struct {
	Code     string `json:"code"`
	Message  string `json:"message"`
	SQLState string `json:"sqlState,omitempty"`
	Position *int   `json:"position,omitempty"`
	Hint     string `json:"hint,omitempty"`
	Detail   string `json:"detail,omitempty"`
}

type Response struct {
	ID    int64      `json:"id"`
	OK    bool       `json:"ok"`
	Value any        `json:"value,omitempty"`
	Error *ErrorBody `json:"error,omitempty"`
}

// okResponse always carries "value", even when empty.
type okResponse struct {
	ID    int64 `json:"id"`
	OK    bool  `json:"ok"`
	Value any   `json:"value"`
}

type Column struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type ColumnsMessage struct {
	ID      int64    `json:"id"`
	Stream  string   `json:"stream"` // "columns"
	Columns []Column `json:"columns"`
}

type RowsMessage struct {
	ID     int64   `json:"id"`
	Stream string  `json:"stream"` // "rows"
	Rows   [][]any `json:"rows"`
}

type ExecuteResult struct {
	RowCount       int      `json:"rowCount"`
	Affected       *int64   `json:"affected"` // null for SELECT-like statements
	DurationMs     float64  `json:"durationMs"`
	Notices        []string `json:"notices"`
	HasMore        bool     `json:"hasMore"`
	TruncatedCells int      `json:"truncatedCells"`
	InTransaction  bool     `json:"inTransaction"`
}

type envelope struct {
	ID int64  `json:"id"`
	Op string `json:"op"`
}

// helloRequest is the hello op. ProtocolVersion is the version the extension
// speaks; the reply carries the helper's, and the extension decides.
type helloRequest struct {
	ID              int64  `json:"id"`
	Op              string `json:"op"`
	ProtocolVersion *int   `json:"protocolVersion"`
}

// HelloValue is the reply to the hello op.
type HelloValue struct {
	ProtocolVersion int    `json:"protocolVersion"`
	HelperVersion   string `json:"helperVersion"`
}
