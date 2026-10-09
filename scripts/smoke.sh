#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-only
# Smoke test of the site: serve docs/ statically, the way GitHub Pages does, and request
# both first-party pages. Ministry-owned exam archive content is intentionally outside this check.
set -euo pipefail
cd "$(dirname "$0")/.."
port="${PORT:-$(python3 -I -c 'import socket; s = socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')}"
base="http://127.0.0.1:${port}"
work="$(mktemp -d)"
server=''
trap 'if [[ -n "$server" ]]; then kill "$server" 2>/dev/null || true; wait "$server" 2>/dev/null || true; fi; rm -rf "$work"' EXIT

python3 -I -u -m http.server "$port" --bind 127.0.0.1 --directory docs >"$work/server.log" 2>&1 &
server=$!
# Ready only once this server has bound the port and answers: if it exits (e.g. the port is
# taken), fail instead of testing whatever else listens there.
for _ in $(seq 150); do
  kill -0 "$server" 2>/dev/null || { echo "SMOKE FAILED: server exited"; cat "$work/server.log"; exit 1; }
  grep -q '^Serving HTTP on' "$work/server.log" && curl --noproxy '*' -fs -o /dev/null "$base/index.html" && break
  sleep 0.2
done
kill -0 "$server" 2>/dev/null && grep -q '^Serving HTTP on' "$work/server.log" \
  || { echo "SMOKE FAILED: server did not start on $base"; cat "$work/server.log"; exit 1; }

for path in /index.html /optagelsesprover.html; do
  # Read to a file: piping into grep -q can make curl fail with SIGPIPE.
  code="$(curl --noproxy '*' -sS -m 10 -o "$work/page" -w '%{http_code}' "$base$path" || true)"
  [[ "$code" == 200 ]] || { echo "SMOKE FAILED: $path returned ${code:-no response}, not 200"; exit 1; }
  title="$(grep -o '<title>[^<]*' "$work/page" | head -1 | cut -c8- || true)"
  # http.server lists a directory with a 200 and a title; Pages would 404.
  [[ -f "docs$path" && "$title" != "Directory listing"* ]] \
    || { echo "SMOKE FAILED: docs$path is not a file (served: $title)"; exit 1; }
  grep -qi '<html' "$work/page" || { echo "SMOKE FAILED: $path served no <html>"; exit 1; }
  [[ "$title" == *Eksamensarkiv* ]] || { echo "SMOKE FAILED: $path title is '$title'"; exit 1; }
  echo "ok $path: $title"
done
