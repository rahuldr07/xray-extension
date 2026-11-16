#!/usr/bin/env bash
# Runs the helper's Go tests against throwaway Postgres 16, MySQL 8.4 and
# PgBouncer (transaction mode) containers on random free local ports.
# Every container and the network it starts are removed on exit, pass or fail.
#
#   bash scripts/test-with-docker.sh [go test args]   the helper's Go tests
#   bash scripts/test-with-docker.sh --e2e            the extension's real end-to-end test
#                                                     (test/e2e/sql-remote.e2e.mjs) against
#                                                     Postgres 16 and MySQL 8.4, no PgBouncer
set -euo pipefail

cd "$(dirname "$0")/.."

e2e=false
if [ "${1:-}" = "--e2e" ]; then
  e2e=true
  shift
fi
# The e2e asserts the password never shows in the page, so it needs one that no UI text contains.
if $e2e; then pw=xray-E2e-pw7; else pw=xray; fi

run_id="xray-test-$$-$RANDOM"
net="$run_id-net"
pg="$run_id-pg"
my="$run_id-mysql"
bouncer="$run_id-pgbouncer"
started=()

cleanup() {
  local status=$?
  for c in "${started[@]}"; do
    docker rm -f "$c" >/dev/null 2>&1 || true
  done
  docker network rm "$net" >/dev/null 2>&1 || true
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

docker network create "$net" >/dev/null

started+=("$pg")
docker run -d --name "$pg" --network "$net" \
  -e POSTGRES_PASSWORD="$pw" -e POSTGRES_DB=xray \
  -p 127.0.0.1::5432 postgres:16 >/dev/null

started+=("$my")
docker run -d --name "$my" --network "$net" \
  -e MYSQL_ROOT_PASSWORD="$pw" -e MYSQL_DATABASE=xray \
  -p 127.0.0.1::3306 mysql:8.4 >/dev/null

if ! $e2e; then
  started+=("$bouncer")
  docker run -d --name "$bouncer" --network "$net" \
    -e DB_HOST="$pg" -e DB_PORT=5432 -e DB_USER=postgres -e DB_PASSWORD="$pw" -e DB_NAME=xray \
    -e POOL_MODE=transaction -e AUTH_TYPE=scram-sha-256 -e LISTEN_PORT=6432 \
    -p 127.0.0.1::6432 edoburu/pgbouncer >/dev/null
fi

host_port() { docker port "$1" "$2" | head -n1 | sed 's/.*://'; }

wait_for() {
  local what=$1; shift
  for _ in $(seq 1 90); do
    if "$@" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  echo "test-with-docker: $what did not become ready" >&2
  return 1
}

# pg_isready alone is true during the init restart; require a real query.
wait_for postgres docker exec "$pg" psql -U postgres -d xray -h 127.0.0.1 -c 'select 1'
$e2e || wait_for pgbouncer docker exec -e PGPASSWORD="$pw" "$pg" psql -h "$bouncer" -p 6432 -U postgres -d xray -c 'select 1'
wait_for mysql docker exec "$my" mysql -h 127.0.0.1 -uroot -p"$pw" -e 'select 1' xray

pg_port=$(host_port "$pg" 5432)
my_port=$(host_port "$my" 3306)

if $e2e; then
  # Connection strings as a user pastes them into the connection dialog.
  export XRAY_E2E_PG_DSN="postgres://postgres:$pw@127.0.0.1:$pg_port/xray?sslmode=disable"
  export XRAY_E2E_MYSQL_DSN="mysql://root:$pw@127.0.0.1:$my_port/xray?ssl-mode=disabled"
  cd ..
  # Rebuild with the committed bundles' build stamp, so the rebuilt dist/ matches what is
  # committed and the run leaves git status clean. Falls back to the last commit's time.
  stamp="$(git show HEAD:dist/panel-ui.js 2>/dev/null | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2} UTC' | head -n1 || true)"
  SOURCE_DATE_EPOCH="$( { [ -n "$stamp" ] && date -u -d "$stamp" +%s 2>/dev/null; } || git log -1 --format=%ct)"
  export SOURCE_DATE_EPOCH
  npm run build
  node --test test/e2e/sql-remote.e2e.mjs
  exit
fi

bouncer_port=$(host_port "$bouncer" 6432)

export XRAY_TEST_PG_DSN="postgres://postgres:$pw@127.0.0.1:$pg_port/xray?sslmode=disable"
export XRAY_TEST_MYSQL_DSN="root:$pw@tcp(127.0.0.1:$my_port)/xray"
export XRAY_TEST_PGBOUNCER_DSN="postgres://postgres:$pw@127.0.0.1:$bouncer_port/xray?sslmode=disable"

go test -count=1 "$@" ./...
