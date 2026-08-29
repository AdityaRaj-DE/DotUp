#!/usr/bin/env bash

# Package Abstraction API

detect_package_manager() {
    log_debug "Detecting package manager..."
    local pm
    pm=$(platform_package_manager)

    if [[ "$pm" == "apt" || "$pm" == "dnf" || "$pm" == "pacman" ]]; then
        # shellcheck disable=SC2034
        PKG_MANAGER="$pm"
        log_debug "Package manager detected: $pm"
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
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        if ! ${SUDO_CMD:-} dnf makecache -y >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to update package lists (dnf makecache)."
        fi
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        if ! ${SUDO_CMD:-} pacman -Sy >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to update package lists (pacman -Sy)."
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
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        # shellcheck disable=SC2086
        if ! ${SUDO_CMD:-} dnf install -yq ${pkgs} >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to install packages: ${pkgs}"
        fi
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        # shellcheck disable=SC2086
        if ! ${SUDO_CMD:-} pacman -S --noconfirm --needed ${pkgs} >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to install packages: ${pkgs}"
        fi
    else
        fail_critical "pkg_install not implemented for $PKG_MANAGER"
    fi
}

pkg_install_local() {
    local file_path="$1"
    log_info "Installing local package: ${file_path}"
    if [[ ! -f "$file_path" ]]; then
        fail_critical "Local package file not found: $file_path"
    fi

    if [[ "$PKG_MANAGER" == "apt" ]]; then
        # shellcheck disable=SC2086
        if ! env DEBIAN_FRONTEND=noninteractive ${SUDO_CMD:-} apt-get install -yq "$file_path" >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to install local package: ${file_path}"
        fi
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        if ! ${SUDO_CMD:-} dnf install -yq "$file_path" >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to install local package: ${file_path}"
        fi
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        if ! ${SUDO_CMD:-} pacman -U --noconfirm "$file_path" >/dev/null 2>>"${LOG_FILE}"; then
            fail_critical "Failed to install local package: ${file_path}"
        fi
    else
        fail_critical "pkg_install_local not implemented for $PKG_MANAGER"
    fi
}

pkg_is_installed() {
    local pkg="$1"
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        rpm -q "$pkg" >/dev/null 2>&1
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        pacman -Q "$pkg" >/dev/null 2>&1
    else
        fail_critical "pkg_is_installed not implemented for $PKG_MANAGER"
    fi
}

pkg_is_available() {
    local pkg="$1"
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        apt-cache show "$pkg" >/dev/null 2>&1
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        dnf list available "$pkg" >/dev/null 2>&1 || dnf list installed "$pkg" >/dev/null 2>&1
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        pacman -Si "$pkg" >/dev/null 2>&1 || pacman -Qi "$pkg" >/dev/null 2>&1
    else
        fail_critical "pkg_is_available not implemented for $PKG_MANAGER"
    fi
}
