#!/usr/bin/env bash

# System Module
# Installs core developer utilities

SYSTEM_PACKAGES=(
    curl
    wget
    git
    unzip
    zip
    tar
    jq
    tree
    tmux
    ripgrep
    fd-find
    xclip
    ca-certificates
    gnupg
    lsb-release
    build-essential
)

OPTIONAL_PACKAGES=(
    htop
    btop
)

system_detect() {
    log_debug "Detecting system base packages..."
    local missing=0
    for pkg in "${SYSTEM_PACKAGES[@]}"; do
        if ! pkg_is_installed "$pkg"; then
            missing=1
            break
        fi
    done

    if [ $missing -eq 1 ]; then
        echo "NOT_INSTALLED"
    else
        echo "INSTALLED"
    fi
}

system_detect_state() {
    local missing=0
    for pkg in "${SYSTEM_PACKAGES[@]}"; do
        if ! pkg_is_installed "$pkg"; then
            missing=1
            break
        fi
    done

    if [ $missing -eq 1 ]; then
        echo "status=NOT_INSTALLED"
    else
        echo "status=INSTALLED"
    fi
}

system_install() {
    log_info "Installing system base packages..."
    pkg_update

    local to_install=("${SYSTEM_PACKAGES[@]}")

    for pkg in "${OPTIONAL_PACKAGES[@]}"; do
        if pkg_is_available "$pkg"; then
            to_install+=("$pkg")
        fi
    done

    pkg_install "${to_install[@]}"
}

system_repair() {
    log_warn "Repairing system base packages..."
    system_install
}

system_configure() {
    log_debug "Configuring system packages..."
    if command -v fdfind >/dev/null 2>&1 && ! command -v fd >/dev/null 2>&1; then
        log_info "Setting up fd symlink for fd-find"
        mkdir -p "${HOME}/.local/bin"
        ln -sf "$(command -v fdfind)" "${HOME}/.local/bin/fd"
    fi
}

system_validate() {
    log_debug "Validating system packages..."
    local failed=0

    local cmds=(curl wget git unzip jq tree tmux rg make)
    for cmd in "${cmds[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            log_error "Validation failed: command '$cmd' not found."
            failed=1
        fi
    done

    if [ $failed -eq 1 ]; then
        fail_critical "System package validation failed."
    fi
    log_success "System base packages fully validated."
}
