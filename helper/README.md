# xray-db-helper

Native-messaging host that lets the XRAY extension query Postgres and MySQL.

    go vet ./...
    go test ./...
    bash scripts/test-with-docker.sh   # Postgres 16, MySQL 8.4, PgBouncer in Docker
    CGO_ENABLED=0 go build -ldflags "-s -w -X main.version=0.0.0-dev" -o xray-db-helper ./cmd/xray-db-helper
