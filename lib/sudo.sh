#!/usr/bin/env bash

setup_sudo() {
    log_debug "Setting up sudo privileges..."
    
    if [ "$EUID" -eq 0 ]; then
        log_warn "Running entirely as root is not recommended."
        SUDO_CMD=""
        return 0
    fi

    if command -v sudo >/dev/null 2>&1; then
        if sudo -n true 2>/dev/null; then
            log_debug "Sudo privileges already active."
            SUDO_CMD="sudo"
        else
            log_info "Sudo privileges required for package management. Please authenticate."
            if sudo -v; then
                # Keep sudo alive in the background while the script runs
                (while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null) &
                # shellcheck disable=SC2034
                SUDO_CMD="sudo"
                log_success "Sudo privileges acquired."
            else
                fail_critical "Failed to acquire sudo privileges."
            fi
        fi
    else
        fail_critical "sudo command not found. Cannot elevate privileges."
    fi
}
