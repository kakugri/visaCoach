#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${VISACOACH_PROD_URL:-https://visacoach.kakugri.dev}"

check_endpoint() {
  local label="$1"
  local path="$2"
  local url="${BASE_URL}${path}"

  printf '\n== %s ==\n' "$label"
  printf '%s\n' "$url"
  curl -fsS "$url"
  printf '\n'
}

printf 'VisaCoach beta health report\n'
printf 'Target: %s\n' "$BASE_URL"

check_endpoint "Backend live" "/api/live"
check_endpoint "Backend health" "/api/health"
check_endpoint "Analytics status" "/api/analytics/status"

printf '\nDone. This report does not call Gemini feedback or question-generation routes.\n'
