#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/utils.sh"

setup_logging

log_info "Checking for updates..."
log_info "Delegating update to bootstrap.sh to fetch the latest stable release..."

TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

BOOTSTRAP_URL="https://raw.githubusercontent.com/AdityaRaj-DE/DotUp/main/bootstrap.sh"
if ! curl -fsSL "$BOOTSTRAP_URL" -o "${TMP_DIR}/bootstrap.sh"; then
    fail_critical "Failed to download update bootstrapper."
fi

chmod +x "${TMP_DIR}/bootstrap.sh"
log_info "Executing update..."
exec "${TMP_DIR}/bootstrap.sh" "$@"
