#!/usr/bin/env bash

# Platform Context API
_PLATFORM_DISTRIBUTION="UNKNOWN"
_PLATFORM_VERSION="UNKNOWN"
_PLATFORM_DIST_ID="UNKNOWN"
_PLATFORM_ARCHITECTURE="UNKNOWN"
_PLATFORM_PACKAGE_MANAGER="UNKNOWN"
_PLATFORM_INIT_SYSTEM="UNKNOWN"

detect_os() {
    log_debug "Detecting OS identity..."

    local os_release_file="${DOTUP_OS_RELEASE_FILE:-/etc/os-release}"
    if [[ -f "$os_release_file" ]]; then
        # shellcheck disable=SC1090
        source "$os_release_file"
        _PLATFORM_DIST_ID="${ID:-UNKNOWN}"
        _PLATFORM_VERSION="${VERSION_ID:-UNKNOWN}"

        case "${_PLATFORM_DIST_ID}" in
        ubuntu | debian | linuxmint | pop)
            if [[ "${_PLATFORM_DIST_ID}" == "ubuntu" ]]; then
                _PLATFORM_DISTRIBUTION="Ubuntu"
            elif [[ "${_PLATFORM_DIST_ID}" == "debian" ]]; then
                _PLATFORM_DISTRIBUTION="Debian"
            else
                _PLATFORM_DISTRIBUTION="${PRETTY_NAME:-$_PLATFORM_DIST_ID}"
            fi
            _PLATFORM_PACKAGE_MANAGER="apt"
            ;;
        fedora)
            _PLATFORM_DISTRIBUTION="Fedora"
            _PLATFORM_PACKAGE_MANAGER="dnf"
            ;;
        arch)
            _PLATFORM_DISTRIBUTION="Arch"
            _PLATFORM_PACKAGE_MANAGER="pacman"
            ;;
        *)
            local id_like="${ID_LIKE:-}"
            if [[ "$id_like" == *"ubuntu"* ]] || [[ "$id_like" == *"debian"* ]]; then
                _PLATFORM_DISTRIBUTION="${PRETTY_NAME:-$_PLATFORM_DIST_ID}"
                _PLATFORM_PACKAGE_MANAGER="apt"
            elif [[ "$id_like" == *"fedora"* ]]; then
                _PLATFORM_DISTRIBUTION="${PRETTY_NAME:-$_PLATFORM_DIST_ID}"
                _PLATFORM_PACKAGE_MANAGER="dnf"
            elif [[ "$id_like" == *"arch"* ]]; then
                _PLATFORM_DISTRIBUTION="${PRETTY_NAME:-$_PLATFORM_DIST_ID}"
                _PLATFORM_PACKAGE_MANAGER="pacman"
            else
                _PLATFORM_DISTRIBUTION="UNKNOWN"
            fi
            ;;
        esac
    else
        log_warn "/etc/os-release not found. Platform identity may be UNKNOWN."
    fi

    local raw_arch
    raw_arch=$(uname -m 2>/dev/null || echo "unknown")
    case "$raw_arch" in
    x86_64 | amd64) _PLATFORM_ARCHITECTURE="amd64" ;;
    aarch64 | arm64) _PLATFORM_ARCHITECTURE="arm64" ;;
    armv7l | armhf) _PLATFORM_ARCHITECTURE="armhf" ;;
    *) _PLATFORM_ARCHITECTURE="unknown" ;;
    esac

    if command -v systemctl >/dev/null 2>&1; then
        _PLATFORM_INIT_SYSTEM="systemd"
    else
        _PLATFORM_INIT_SYSTEM="UNKNOWN"
    fi

    log_debug "Detected platform: ${_PLATFORM_DISTRIBUTION}"
    log_debug "Detected architecture: ${_PLATFORM_ARCHITECTURE}"
}

verify_platform_support() {
    local dist
    dist=$(platform_distribution)
    local pkg_mgr
    pkg_mgr=$(platform_package_manager)

    if [[ "$pkg_mgr" == "apt" ]]; then
        log_success "DotUp installation support: Supported (${dist})"
        # Legacy compat for remaining V1 code
        # shellcheck disable=SC2034
        OS_FAMILY="debian"
        # shellcheck disable=SC2034
        ARCH_NAME="$(platform_architecture)"
    else
        fail_critical "DotUp installation support for '${dist}' is Not implemented."
    fi
}

platform_distribution() {
    echo "${_PLATFORM_DISTRIBUTION}"
}

platform_version() {
    echo "${_PLATFORM_VERSION}"
}

platform_dist_id() {
    echo "${_PLATFORM_DIST_ID}"
}

platform_architecture() {
    echo "${_PLATFORM_ARCHITECTURE}"
}

platform_package_manager() {
    echo "${_PLATFORM_PACKAGE_MANAGER}"
}

platform_init_system() {
    echo "${_PLATFORM_INIT_SYSTEM}"
}
