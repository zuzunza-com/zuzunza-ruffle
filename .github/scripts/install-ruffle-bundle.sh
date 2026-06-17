#!/usr/bin/env bash
# Atomic install of CI-built ruffle selfhosted bundle on the production server.
# Called by .github/workflows/deploy.yml via SSH (path on runner checkout).
set -euo pipefail

TARBALL="${1:?usage: install-ruffle-bundle.sh /path/to/ruffle-bundle.tgz [dest-dir]}"
DEST="${2:-/srv/appdata/zuzunza/dist/external/superkomi/main/ruffle}"
TMP="${DEST}.tmp.$$"

if [[ ! -f "$TARBALL" ]]; then
  echo "ERROR: tarball not found: $TARBALL" >&2
  exit 1
fi

install -d "$(dirname "$DEST")"
rm -rf "$TMP"
mkdir -p "$TMP"
tar -xzf "$TARBALL" -C "$TMP"

if [[ ! -f "${TMP}/ruffle.js" ]]; then
  echo "ERROR: bundle missing ruffle.js" >&2
  exit 1
fi

if [[ -d "${DEST}.bak" ]]; then
  rm -rf "${DEST}.bak"
fi
if [[ -d "$DEST" ]]; then
  mv "$DEST" "${DEST}.bak"
fi
mv "$TMP" "$DEST"
rm -rf "${DEST}.bak"

printf '[install-ruffle-bundle] installed %s (%s bytes)\n' \
  "${DEST}/ruffle.js" \
  "$(stat -c '%s' "${DEST}/ruffle.js" 2>/dev/null || wc -c < "${DEST}/ruffle.js")"
