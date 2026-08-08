#!/usr/bin/env bash

detect_package_manager() {
    log_debug "Detecting package manager..."
    if command -v apt-get >/dev/null 2>&1; then
        PKG_MANAGER="apt"
        log_debug "Package manager detected: apt"
    else
        fail_critical "Supported package manager (apt) not found."
    fi
}

pkg_update() {
    log_info "Updating package lists..."
    if ! ${SUDO_CMD:-} apt-get update -y >/dev/null 2>>"${LOG_FILE}"; then
        fail_critical "Failed to update package lists."
    fi
}

pkg_install() {
    local pkgs="$*"
    log_info "Installing packages: ${pkgs}"
    if ! env DEBIAN_FRONTEND=noninteractive ${SUDO_CMD:-} apt-get install -yq ${pkgs} >/dev/null 2>>"${LOG_FILE}"; then
        fail_critical "Failed to install packages: ${pkgs}"
    fi
}
