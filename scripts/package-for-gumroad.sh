#!/bin/bash
# Package SheetSchedule for Gumroad sale
# Usage: bash scripts/package-for-gumroad.sh  (from project root)

set -e

PACKAGE_NAME="sheetschedule-v1.0.0"
OUTPUT_DIR="dist-gumroad"
ZIP_FILE="${OUTPUT_DIR}/${PACKAGE_NAME}.zip"

echo "=== SheetSchedule Gumroad Packager ==="

# Clean previous build
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Create zip from app/ excluding sensitive files
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT/app"
zip -r "$PROJECT_ROOT/$ZIP_FILE" . \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/__pycache__/*" \
  -x "*/.netlify/*" \
  -x "*/.env" \
  -x "*/credentials.json" \
  -x "*/*.pem" \
  -x "*/*.key" \
  -x ".DS_Store" \
  -x "*/.DS_Store"

echo ""
echo "=== Security Verification ==="

# Check for sensitive strings in the zip
SENSITIVE_PATTERNS=(
  "920976615761"          # GCP project number
  "natural-furnace"       # GCP project ID
  "kimgoodhap"            # Personal account
  "1Hw96Ma4DLGbPdKJQG9x81WT"  # Demo Sheet ID
  "sk-ant-"               # Anthropic API key pattern
  "gho_"                  # GitHub token pattern
  "AAIG6RNam"             # Telegram token pattern
  "service-account"       # Service account reference
  "eddybot"               # Original project name
)

FOUND_ISSUES=0
TEMP_DIR=$(mktemp -d)
unzip -q "$PROJECT_ROOT/$ZIP_FILE" -d "$TEMP_DIR"

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  MATCHES=$(grep -rl "$pattern" "$TEMP_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$MATCHES" -gt "0" ]; then
    echo "FAIL: Found '$pattern' in $MATCHES file(s):"
    grep -rl "$pattern" "$TEMP_DIR" 2>/dev/null | sed "s|$TEMP_DIR/||g"
    FOUND_ISSUES=1
  fi
done

rm -rf "$TEMP_DIR"

if [ "$FOUND_ISSUES" -eq "0" ]; then
  echo "PASS: No sensitive strings found in package"
  echo ""
  echo "=== Package Ready ==="
  echo "File: $PROJECT_ROOT/$ZIP_FILE"
  echo "Size: $(du -h "$PROJECT_ROOT/$ZIP_FILE" | cut -f1)"
  echo ""
  echo "Contents:"
  unzip -l "$PROJECT_ROOT/$ZIP_FILE" | tail -1
else
  echo ""
  echo "FAIL: Security check failed. Fix issues before distributing."
  exit 1
fi
