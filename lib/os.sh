#!/usr/bin/env bash

detect_os() {
    log_debug "Detecting OS..."

    if [[ ! -f "/etc/os-release" ]]; then
        fail_critical "/etc/os-release not found. Unsupported OS."
    fi

    # shellcheck disable=SC1091
    source /etc/os-release

    local os_id="${ID}"
    local os_id_like="${ID_LIKE:-}"

    if [[ "$os_id" == "ubuntu" ]] || [[ "$os_id" == "debian" ]] || [[ "$os_id" == "linuxmint" ]] || [[ "$os_id" == "pop" ]] || [[ "$os_id_like" == *"ubuntu"* ]] || [[ "$os_id_like" == *"debian"* ]]; then
        log_success "Supported OS detected: ${PRETTY_NAME}"
        # shellcheck disable=SC2034
        OS_FAMILY="debian"
    else
        fail_critical "Unsupported OS: ${PRETTY_NAME}. DevBootstrap V1 only supports the Debian/Ubuntu family."
    fi

    # Detect Architecture
    ARCH=$(uname -m)
    case "$ARCH" in
    x86_64) ARCH_NAME="amd64" ;;
    aarch64) ARCH_NAME="arm64" ;;
    armv7l) ARCH_NAME="armhf" ;;
    *) fail_critical "Unsupported architecture: $ARCH" ;;
    esac
    log_debug "Detected architecture: $ARCH_NAME"
}
