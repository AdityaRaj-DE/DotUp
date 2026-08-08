#!/usr/bin/env bash

# Temp dir management
setup_temp_dir() {
    TMP_DIR=$(mktemp -d)
    trap cleanup_temp_dir EXIT
    log_debug "Created temporary directory at ${TMP_DIR}"
}

cleanup_temp_dir() {
    if [[ -n "${TMP_DIR:-}" ]] && [[ -d "${TMP_DIR}" ]]; then
        rm -rf "${TMP_DIR}"
        log_debug "Cleaned up temporary directory ${TMP_DIR}"
    fi
}

fail_critical() {
    local msg="$1"
    log_error "${msg}"
    log_error "Critical failure. Stopping execution."
    log_info "Check logs at: ${LATEST_LOG}"
    exit 1
}
