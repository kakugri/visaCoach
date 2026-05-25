#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-https://visacoach.kakugri.dev}"
APP_URL="${APP_URL%/}"

check_url() {
  local label="$1"
  local url="$2"
  local expected="$3"

  printf 'Checking %s... ' "$label"
  local response
  response="$(curl -fsS "$url")"

  if [[ "$response" != *"$expected"* ]]; then
    printf 'failed\n'
    printf 'Expected response from %s to contain: %s\n' "$url" "$expected" >&2
    printf 'Response was:\n%s\n' "$response" >&2
    return 1
  fi

  printf 'ok\n'
}

check_header() {
  local label="$1"
  local url="$2"

  printf 'Checking %s... ' "$label"
  curl -fsSI "$url" >/dev/null
  printf 'ok\n'
}

check_post_json() {
  local label="$1"
  local url="$2"
  local body="$3"
  local expected="$4"

  printf 'Checking %s... ' "$label"
  local response
  response="$(curl -fsS -X POST "$url" -H 'Content-Type: application/json' -d "$body")"

  if [[ "$response" != *"$expected"* ]]; then
    printf 'failed\n'
    printf 'Expected response from %s to contain: %s\n' "$url" "$expected" >&2
    printf 'Response was:\n%s\n' "$response" >&2
    return 1
  fi

  printf 'ok\n'
}

printf 'VisaCoach production smoke test\n'
printf 'Target: %s\n\n' "$APP_URL"

check_header "frontend HTML" "$APP_URL/"
check_url "frontend app shell" "$APP_URL/" "VisaCoach"
check_url "backend liveness" "$APP_URL/api/live" '"status":"ok"'
check_url "backend health" "$APP_URL/api/health" '"service":"visacoach-backend"'
check_url "backend direct health route" "$APP_URL/health" "ok"
check_url "public prep tips route" "$APP_URL/api/interview/tips?country=US&visaType=F1" "study plan"
check_post_json "analytics event endpoint" "$APP_URL/api/analytics/event" '{"eventName":"smoke_test","properties":{"source":"smoke"}}' '"accepted":true'

printf '\nSmoke test passed.\n'
