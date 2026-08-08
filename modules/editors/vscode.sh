#!/usr/bin/env bash

vscode_detect() {
    log_debug "Detecting VS Code..."
    if command -v code >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        echo "NOT_INSTALLED"
    fi
}

vscode_install() {
    log_info "Installing VS Code..."
    pkg_install wget gpg apt-transport-https
    
    ${SUDO_CMD:-} wget -qO- https://packages.microsoft.com/keys/microsoft.asc | ${SUDO_CMD:-} gpg --dearmor > "${TMP_DIR}/packages.microsoft.gpg"
    ${SUDO_CMD:-} install -D -o root -g root -m 644 "${TMP_DIR}/packages.microsoft.gpg" /etc/apt/keyrings/packages.microsoft.gpg
    echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | ${SUDO_CMD:-} tee /etc/apt/sources.list.d/vscode.list > /dev/null
    
    pkg_update
    pkg_install code
}

vscode_repair() {
    log_warn "Repairing VS Code..."
    vscode_install
}

vscode_configure() {
    log_debug "Configuring VS Code..."
}

vscode_validate() {
    log_debug "Validating VS Code..."
    if ! command -v code >/dev/null 2>&1; then
        fail_critical "VS Code validation failed: 'code' command not found."
    fi
    log_success "VS Code fully validated."
}
