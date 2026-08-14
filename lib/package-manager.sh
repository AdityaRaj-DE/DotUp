#!/usr/bin/env bash

# Package Abstraction API

detect_package_manager() {
    log_debug "Detecting package manager..."
    local pm
    pm=$(platform_package_manager)

    if [[ "$pm" == "apt" ]]; then
        # shellcheck disable=SC2034
        PKG_MANAGER="apt"
        log_debug "Package manager detected: apt"
    else
        fail_critical "Package manager '$pm' is not currently supported for installation."
    fi
}

pkg_update() {
    log_info "Updating package lists..."
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        if ! ${SUDO_CMD:-} apt-get update -y >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to update package lists."
        fi
    else
        fail_critical "pkg_update not implemented for $PKG_MANAGER"
    fi
}

pkg_install() {
    local pkgs="$*"
    log_info "Installing packages: ${pkgs}"
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        # shellcheck disable=SC2086
        if ! env DEBIAN_FRONTEND=noninteractive ${SUDO_CMD:-} apt-get install -yq ${pkgs} >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to install packages: ${pkgs}"
        fi
    else
        fail_critical "pkg_install not implemented for $PKG_MANAGER"
    fi
}

pkg_is_installed() {
    local pkg="$1"
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"
    else
        fail_critical "pkg_is_installed not implemented for $PKG_MANAGER"
    fi
}

pkg_is_available() {
    local pkg="$1"
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        apt-cache show "$pkg" >/dev/null 2>&1
    else
        fail_critical "pkg_is_available not implemented for $PKG_MANAGER"
    fi
}
