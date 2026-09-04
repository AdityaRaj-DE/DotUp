#!/usr/bin/env bash

git_detect() {
    log_debug "Detecting Git..."
    if command -v git >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        echo "NOT_INSTALLED"
    fi
}

git_detect_state() {
    if ! command -v git >/dev/null 2>&1; then
        echo "status=NOT_INSTALLED"
        return
    fi

    echo "status=INSTALLED"
    local v
    # git version output is usually "git version 2.45.2"
    v=$(git --version | awk '{print $3}')
    if [[ -n "$v" ]]; then
        echo "version=$v"
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

    local interactive="true"
    if [[ "${CI:-}" == "true" ]] || [[ ! -t 1 ]]; then
        interactive="false"
        log_debug "Non-interactive mode detected. Skipping prompts."
    fi

    local current_name
    current_name=$(git config --global user.name 2>/dev/null || true)
    if [[ -z "$current_name" ]]; then
        if [[ "$interactive" == "true" ]]; then
            read -r -p "Enter Git user.name: " new_name </dev/tty
            if [[ -n "$new_name" ]]; then
                git config --global user.name "$new_name"
                log_success "Git user.name set to '$new_name'"
            fi
        else
            log_warn "Git user.name not set. Run: git config --global user.name 'Your Name'"
        fi
    else
        if [[ "$interactive" == "true" ]]; then
            read -r -p "Git user.name is currently '$current_name'. Do you want to change it? [y/N]: " change_name </dev/tty
            if [[ "$change_name" =~ ^[Yy]$ ]]; then
                read -r -p "Enter new Git user.name: " new_name </dev/tty
                if [[ -n "$new_name" ]]; then
                    git config --global user.name "$new_name"
                    log_success "Git user.name updated to '$new_name'"
                fi
            fi
        fi
    fi

    local current_email
    current_email=$(git config --global user.email 2>/dev/null || true)
    if [[ -z "$current_email" ]]; then
        if [[ "$interactive" == "true" ]]; then
            read -r -p "Enter Git user.email: " new_email </dev/tty
            if [[ -n "$new_email" ]]; then
                git config --global user.email "$new_email"
                log_success "Git user.email set to '$new_email'"
            fi
        else
            log_warn "Git user.email not set. Run: git config --global user.email 'you@example.com'"
        fi
    else
        if [[ "$interactive" == "true" ]]; then
            read -r -p "Git user.email is currently '$current_email'. Do you want to change it? [y/N]: " change_email </dev/tty
            if [[ "$change_email" =~ ^[Yy]$ ]]; then
                read -r -p "Enter new Git user.email: " new_email </dev/tty
                if [[ -n "$new_email" ]]; then
                    git config --global user.email "$new_email"
                    log_success "Git user.email updated to '$new_email'"
                fi
            fi
        fi
    fi

    git config --global init.defaultBranch main
    git config --global pull.rebase false

    local ssh_dir="${HOME}/.ssh"
    local ssh_key="${ssh_dir}/id_ed25519"
    local generate_key="true"

    if [[ -f "$ssh_key" ]]; then
        if [[ "$interactive" == "true" ]]; then
            read -r -p "SSH key already exists at $ssh_key. Do you want to generate a new one? [y/N]: " change_ssh </dev/tty
            if [[ "$change_ssh" =~ ^[Yy]$ ]]; then
                log_info "Backing up existing SSH key..."
                mv "$ssh_key" "${ssh_key}.bak"
                if [[ -f "${ssh_key}.pub" ]]; then
                    mv "${ssh_key}.pub" "${ssh_key}.pub.bak"
                fi
            else
                generate_key="false"
                log_info "Keeping existing SSH key."
            fi
        else
            generate_key="false"
            log_debug "Keeping existing SSH key in non-interactive mode."
        fi
    fi

    if [[ "$generate_key" == "true" ]]; then
        log_info "Generating new SSH key (id_ed25519)..."
        mkdir -p "$ssh_dir"
        chmod 700 "$ssh_dir"
        ssh-keygen -t ed25519 -f "$ssh_key" -N "" -q
        log_success "SSH key generated at $ssh_key"
    fi

    if [[ -f "${ssh_key}.pub" ]]; then
        log_success "Your SSH Public Key is:"
        cat "${ssh_key}.pub"
        if [[ "$interactive" == "true" ]]; then
            log_info "Please copy the key above and add it to your GitHub account settings."
        fi
    fi
}

git_validate() {
    log_debug "Validating Git..."
    if ! command -v git >/dev/null 2>&1; then
        fail_critical "Git validation failed: executable not found."
    fi
    log_success "Git is fully validated."
}

git_validate_options() {
    # shellcheck disable=SC2034
    local key="$1"
    # shellcheck disable=SC2034
    local val="$2"
    return 1
}
