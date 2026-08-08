#!/usr/bin/env bash

node_detect() {
    log_debug "Detecting Node.js (via fnm)..."
    if command -v fnm >/dev/null 2>&1 && command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        if command -v fnm >/dev/null 2>&1; then
            echo "BROKEN"
        else
            echo "NOT_INSTALLED"
        fi
    fi
}

node_install() {
    log_info "Installing fnm and Node.js..."
    
    if ! command -v fnm >/dev/null 2>&1; then
        log_info "Downloading and installing fnm..."
        curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell || fail_critical "Failed to install fnm"
        export PATH="${HOME}/.local/share/fnm:$PATH"
    fi
    
    log_info "Installing Node LTS..."
    fnm install --lts || fail_critical "Failed to install Node LTS via fnm"
    fnm default lts-latest || fail_critical "Failed to set default Node version"
}

node_repair() {
    log_warn "Repairing Node.js..."
    export PATH="${HOME}/.local/share/fnm:$PATH"
    node_install
}

node_configure() {
    log_info "Configuring fnm shell integration..."
    
    local bashrc="${HOME}/.bashrc"
    if [[ -f "$bashrc" ]] && ! grep -q "fnm env" "$bashrc"; then
        log_debug "Adding fnm to .bashrc"
        echo 'eval "$(fnm env --use-on-cd --shell bash)"' >> "$bashrc"
    fi
    
    local zshrc="${HOME}/.zshrc"
    if [[ -f "$zshrc" ]] && ! grep -q "fnm env" "$zshrc"; then
        log_debug "Adding fnm to .zshrc"
        echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> "$zshrc"
    fi
}

node_validate() {
    log_debug "Validating Node.js..."
    export PATH="${HOME}/.local/share/fnm:$PATH"
    if command -v fnm >/dev/null 2>&1; then
        eval "$(fnm env --shell bash)"
    fi
    
    if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
        fail_critical "Node validation failed: node or npm not found in path."
    fi
    
    local node_ver
    node_ver=$(node -v)
    log_success "Node.js validated: $node_ver"
}
