#!/usr/bin/env bash

vscode_detect() {
    log_debug "Detecting VS Code..."
    if command -v code >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        echo "NOT_INSTALLED"
    fi
}

vscode_detect_state() {
    if command -v code >/dev/null 2>&1; then
        echo "status=INSTALLED"
    else
        echo "status=NOT_INSTALLED"
    fi
}

vscode_install() {
    log_info "Installing VS Code..."
    
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        pkg_install wget gpg apt-transport-https
        ${SUDO_CMD:-} wget -qO- https://packages.microsoft.com/keys/microsoft.asc | ${SUDO_CMD:-} gpg --dearmor >"${TMP_DIR}/packages.microsoft.gpg"
        ${SUDO_CMD:-} install -D -o root -g root -m 644 "${TMP_DIR}/packages.microsoft.gpg" /etc/apt/keyrings/packages.microsoft.gpg
        echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | ${SUDO_CMD:-} tee /etc/apt/sources.list.d/vscode.list >/dev/null
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        ${SUDO_CMD:-} rpm --import https://packages.microsoft.com/keys/microsoft.asc
        echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | ${SUDO_CMD:-} tee /etc/yum.repos.d/vscode.repo >/dev/null
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        fail_critical "VS Code installation via script is unsupported on Arch. Use an AUR helper like yay to install visual-studio-code-bin."
    else
        fail_critical "Unsupported package manager for VS Code installation."
    fi

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

vscode_validate_options() {
    local key="$1"
    local val="$2"
    return 1
}
