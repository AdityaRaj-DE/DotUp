#!/usr/bin/env bash

git_detect() {
    log_debug "Detecting Git..."
    if command -v git >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        echo "NOT_INSTALLED"
    fi
}

git_install() {
    log_info "Installing Git..."
    pkg_install git
}

git_repair() {
    log_warn "Repairing Git..."
    git_install
}

git_configure() {
    log_info "Configuring Git..."
    
    if ! git config --global user.name >/dev/null 2>&1; then
        log_warn "Git user.name not set. Run: git config --global user.name 'Your Name'"
    fi
    
    if ! git config --global user.email >/dev/null 2>&1; then
        log_warn "Git user.email not set. Run: git config --global user.email 'you@example.com'"
    fi

    git config --global init.defaultBranch main
    git config --global pull.rebase false

    local ssh_dir="${HOME}/.ssh"
    local ssh_key="${ssh_dir}/id_ed25519"
    
    if [[ ! -f "$ssh_key" ]]; then
        log_info "Generating new SSH key (id_ed25519)..."
        mkdir -p "$ssh_dir"
        chmod 700 "$ssh_dir"
        ssh-keygen -t ed25519 -f "$ssh_key" -N "" -q
        log_success "SSH key generated at $ssh_key"
    else
        log_info "SSH key already exists at $ssh_key. Skipping generation."
    fi
}

git_validate() {
    log_debug "Validating Git..."
    if ! command -v git >/dev/null 2>&1; then
        fail_critical "Git validation failed: executable not found."
    fi
    log_success "Git is fully validated."
}
