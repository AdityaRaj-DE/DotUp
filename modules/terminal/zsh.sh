#!/usr/bin/env bash

zsh_detect() {
    log_debug "Detecting zsh and Oh My Zsh..."
    local state="INSTALLED"
    
    if ! command -v zsh >/dev/null 2>&1; then
        state="NOT_INSTALLED"
    elif [[ ! -d "${HOME}/.oh-my-zsh" ]]; then
        state="BROKEN"
    fi
    
    echo "$state"
}

zsh_install() {
    log_info "Installing zsh..."
    pkg_install zsh
}

zsh_repair() {
    log_warn "Repairing zsh and Oh My Zsh..."
    zsh_install
}

zsh_configure() {
    log_info "Configuring zsh and Oh My Zsh..."
    
    if [[ "$SHELL" != *"zsh"* ]]; then
        log_info "Changing default shell to zsh..."
        if command -v zsh >/dev/null 2>&1; then
            ${SUDO_CMD:-} chsh -s "$(command -v zsh)" "${USER}" || log_warn "Failed to change default shell to zsh. You may need to do it manually."
        fi
    fi

    if [[ ! -d "${HOME}/.oh-my-zsh" ]]; then
        log_info "Installing Oh My Zsh..."
        RUNZSH=no CHSH=no KEEP_ZSHRC=yes sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" || fail_critical "Failed to install Oh My Zsh"
    fi

    local p10k_dir="${HOME}/.oh-my-zsh/custom/themes/powerlevel10k"
    if [[ ! -d "$p10k_dir" ]]; then
        log_info "Installing Powerlevel10k..."
        git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$p10k_dir" >/dev/null 2>&1 || fail_critical "Failed to install Powerlevel10k"
    fi
    
    local zshrc="${HOME}/.zshrc"
    if [[ ! -f "$zshrc" ]]; then
        log_info "Creating default .zshrc..."
        cat > "$zshrc" << 'EOF'
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"
plugins=(git)
source $ZSH/oh-my-zsh.sh
EOF
    else
        if ! grep -q "ZSH_THEME=\"powerlevel10k/powerlevel10k\"" "$zshrc"; then
            log_info "Backing up .zshrc and updating theme..."
            cp "$zshrc" "${zshrc}.backup.$(date +%s)"
            sed -i 's/^ZSH_THEME=.*/ZSH_THEME="powerlevel10k\/powerlevel10k"/' "$zshrc"
        fi
    fi
}

zsh_validate() {
    log_debug "Validating zsh..."
    if ! command -v zsh >/dev/null 2>&1; then
        fail_critical "zsh validation failed: executable not found."
    fi
    if [[ ! -d "${HOME}/.oh-my-zsh" ]]; then
        fail_critical "Oh My Zsh validation failed: directory not found."
    fi
    log_success "zsh and Oh My Zsh fully validated."
}
