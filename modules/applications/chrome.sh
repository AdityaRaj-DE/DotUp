#!/usr/bin/env bash

chrome_detect() {
    log_debug "Detecting Google Chrome..."
    if command -v google-chrome >/dev/null 2>&1 || command -v google-chrome-stable >/dev/null 2>&1; then
        echo "INSTALLED"
    elif [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
        echo "NOT_APPLICABLE"
    else
        echo "NOT_INSTALLED"
    fi
}

chrome_install() {
    log_info "Installing Google Chrome..."
    if [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
        log_warn "Headless environment detected. Skipping Chrome installation."
        return
    fi

    local tmp_file
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        tmp_file="${TMP_DIR}/google-chrome-stable_current_amd64.deb"
        curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o "$tmp_file" || fail_critical "Failed to download Google Chrome."
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        tmp_file="${TMP_DIR}/google-chrome-stable_current_x86_64.rpm"
        curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm -o "$tmp_file" || fail_critical "Failed to download Google Chrome."
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        fail_critical "Google Chrome installation via script is unsupported on Arch. Use an AUR helper like yay to install google-chrome."
    else
        fail_critical "Unsupported package manager for Chrome installation."
    fi

    pkg_install_local "$tmp_file"
}

chrome_repair() {
    log_warn "Repairing Google Chrome..."
    chrome_install
}

chrome_configure() {
    log_debug "Configuring Google Chrome..."
}

chrome_validate() {
    log_debug "Validating Google Chrome..."
    if [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
        log_success "Chrome validation skipped (Headless)."
        return
    fi
    if ! command -v google-chrome >/dev/null 2>&1 && ! command -v google-chrome-stable >/dev/null 2>&1; then
        fail_critical "Chrome validation failed: command not found."
    fi
    log_success "Google Chrome fully validated."
}
