#!/usr/bin/env bash

python_detect() {
    log_debug "Detecting Python environment..."
    if command -v python3 >/dev/null 2>&1 && command -v pip3 >/dev/null 2>&1 && command -v pipx >/dev/null 2>&1; then
        if python3 -c 'import venv' >/dev/null 2>&1; then
            echo "INSTALLED"
            return
        fi
    fi
    
    echo "NOT_INSTALLED"
}

python_install() {
    log_info "Installing Python tools..."
    pkg_install python3 python3-pip python3-venv pipx
}

python_repair() {
    log_warn "Repairing Python tools..."
    python_install
}

python_configure() {
    log_info "Configuring Python tools..."
    if command -v pipx >/dev/null 2>&1; then
        pipx ensurepath >/dev/null 2>&1 || true
    fi
}

python_validate() {
    log_debug "Validating Python..."
    if ! command -v python3 >/dev/null 2>&1; then
        fail_critical "Python validation failed: python3 not found."
    fi
    if ! command -v pip3 >/dev/null 2>&1; then
        fail_critical "Python validation failed: pip3 not found."
    fi
    if ! python3 -m venv --help >/dev/null 2>&1; then
        fail_critical "Python validation failed: venv module not working."
    fi
    if ! command -v pipx >/dev/null 2>&1; then
        fail_critical "Python validation failed: pipx not found."
    fi
    log_success "Python fully validated."
}
