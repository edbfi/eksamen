#!/usr/bin/env bash
set -euo pipefail

# The shared action owns server readiness, deadlines and process cleanup.
# Retain content assertions for both first-party pages. Ministry-owned exam
# archive content is intentionally outside this smoke check.
page=$(mktemp)
trap 'rm -f "$page"' EXIT
for path in /index.html /optagelsesprover.html; do
  echo "==> ${path}"
  # Read to a file: piping into grep -q can make curl fail with SIGPIPE.
  curl --noproxy '*' -fsS -m 10 -o "$page" "http://127.0.0.1:4321${path}"
  grep -qi '<html' "$page" \
    || { echo "SMOKE FAILED: ${path} served no <html>"; exit 1; }
done
