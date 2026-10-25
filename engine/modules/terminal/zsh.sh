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

zsh_detect_state() {
    if ! command -v zsh >/dev/null 2>&1; then
        echo "status=NOT_INSTALLED"
    elif [[ ! -d "${HOME}/.oh-my-zsh" ]]; then
        echo "status=BROKEN"
    else
        echo "status=INSTALLED"
    fi
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

    local zsh_path
    if command -v zsh >/dev/null 2>&1; then
        zsh_path=$(command -v zsh)
        if [[ "$SHELL" != "$zsh_path" ]]; then
            log_info "Changing default shell to zsh..."
            if grep -q "$zsh_path" /etc/shells 2>/dev/null; then
                ${SUDO_CMD:-} chsh -s "$zsh_path" "${USER:-$(whoami)}" || log_warn "Failed to change default shell to zsh. You may need to do it manually."
            else
                log_warn "zsh is not in /etc/shells. Skipping chsh."
            fi
        fi
    fi

    if [[ ! -d "${HOME}/.oh-my-zsh" ]]; then
        log_info "Installing Oh My Zsh..."
        git clone https://github.com/ohmyzsh/ohmyzsh.git "${HOME}/.oh-my-zsh" >/dev/null 2>&1 || fail_critical "Failed to clone Oh My Zsh repository."
    fi

    local p10k_dir="${HOME}/.oh-my-zsh/custom/themes/powerlevel10k"
    if [[ ! -d "$p10k_dir" ]]; then
        log_info "Installing Powerlevel10k..."
        git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$p10k_dir" >/dev/null 2>&1 || fail_critical "Failed to install Powerlevel10k"
    fi

    local syntax_plugin_dir="${HOME}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting"
    if [[ ! -d "$syntax_plugin_dir" ]]; then
        log_info "Installing zsh-syntax-highlighting plugin..."
        git clone https://github.com/zsh-users/zsh-syntax-highlighting.git "$syntax_plugin_dir" >/dev/null 2>&1 || fail_critical "Failed to clone zsh-syntax-highlighting."
    fi

    local fonts_dir="${HOME}/.local/share/fonts"
    if [[ ! -f "${fonts_dir}/JetBrainsMonoNerdFont-Regular.ttf" ]]; then
        log_info "Installing JetBrains Mono Nerd Font..."
        pkg_install unzip fontconfig >/dev/null 2>&1 || true
        mkdir -p "${fonts_dir}"
        local tmp_font_dir
        tmp_font_dir=$(mktemp -d)
        curl -sSLo "${tmp_font_dir}/JetBrainsMono.zip" https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/JetBrainsMono.zip
        unzip -q "${tmp_font_dir}/JetBrainsMono.zip" -d "${fonts_dir}"
        fc-cache -f -v >/dev/null 2>&1 || true
        rm -rf "${tmp_font_dir}"
        log_success "JetBrains Mono Nerd Font installed."
    fi

    # Ensure eza is installed so ls/ll/la aliases function properly
    if ! command -v eza >/dev/null 2>&1; then
        log_info "Installing eza (modern ls replacement)..."
        local installed_eza=false
        # 1. Try system package manager if available
        if pkg_is_available "eza" 2>/dev/null; then
            pkg_install "eza" >/dev/null 2>&1 && installed_eza=true || true
        fi

        # 2. If package manager didn't install eza, download prebuilt binary directly
        if [[ "$installed_eza" != "true" ]] && ! command -v eza >/dev/null 2>&1; then
            local arch
            arch=$(uname -m)
            local eza_target=""
            case "$arch" in
            x86_64 | amd64)
                eza_target="eza_x86_64-unknown-linux-gnu.tar.gz"
                ;;
            aarch64 | arm64)
                eza_target="eza_aarch64-unknown-linux-gnu.tar.gz"
                ;;
            armv7l | armhf)
                eza_target="eza_arm-unknown-linux-gnueabihf.tar.gz"
                ;;
            esac

            if [[ -n "$eza_target" ]]; then
                local tmp_eza_dir
                tmp_eza_dir=$(mktemp -d)
                local eza_url="https://github.com/eza-community/eza/releases/latest/download/${eza_target}"
                if curl -sSLf "$eza_url" -o "${tmp_eza_dir}/${eza_target}" 2>/dev/null; then
                    tar -xzf "${tmp_eza_dir}/${eza_target}" -C "${tmp_eza_dir}" 2>/dev/null || true
                    if [[ -f "${tmp_eza_dir}/eza" ]]; then
                        chmod +x "${tmp_eza_dir}/eza"
                        mkdir -p "${HOME}/.local/bin"
                        cp "${tmp_eza_dir}/eza" "${HOME}/.local/bin/eza"
                        if [[ -n "${SUDO_CMD:-}" ]] && command -v sudo >/dev/null 2>&1; then
                            ${SUDO_CMD:-} cp "${tmp_eza_dir}/eza" /usr/local/bin/eza 2>/dev/null || true
                        fi
                        installed_eza=true
                        log_success "eza binary installed successfully."
                    fi
                fi
                rm -rf "${tmp_eza_dir}"
            fi
        fi

        if [[ "$installed_eza" != "true" ]] && ! command -v eza >/dev/null 2>&1; then
            log_warn "eza could not be downloaded automatically; falling back to standard ls."
        fi
    fi

    # Ensure trash-cli (trash-put) is installed so rm alias functions properly
    if ! command -v trash-put >/dev/null 2>&1; then
        log_info "Installing trash-cli for safe file deletion..."
        if pkg_is_available "trash-cli" 2>/dev/null; then
            pkg_install "trash-cli" >/dev/null 2>&1 || log_warn "Failed to install trash-cli via package manager."
        elif command -v pip3 >/dev/null 2>&1; then
            pip3 install --user trash-cli >/dev/null 2>&1 || log_warn "Failed to install trash-cli via pip."
        elif command -v pip >/dev/null 2>&1; then
            pip install --user trash-cli >/dev/null 2>&1 || log_warn "Failed to install trash-cli via pip."
        fi
    fi

    local zshrc="${HOME}/.zshrc"
    local p10k="${HOME}/.p10k.zsh"
    local repo_root
    repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

    if [[ -f "$zshrc" ]]; then
        log_info "Backing up existing .zshrc..."
        cp "$zshrc" "${zshrc}.backup.$(date +%s)"
    fi
    log_info "Deploying custom .zshrc..."
    cp "${repo_root}/docs/.zshrc.txt" "$zshrc" || fail_critical "Failed to copy .zshrc.txt"

    if [[ -f "$p10k" ]]; then
        log_info "Backing up existing .p10k.zsh..."
        cp "$p10k" "${p10k}.backup.$(date +%s)"
    fi
    log_info "Deploying custom .p10k.zsh..."
    cp "${repo_root}/docs/.p10k.zsh.txt" "$p10k" || fail_critical "Failed to copy .p10k.zsh.txt"

    log_success "Zsh configuration complete! Please restart your terminal or log out and log back in to apply."
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

zsh_validate_options() {
    # shellcheck disable=SC2034
    local key="$1"
    # shellcheck disable=SC2034
    local val="$2"
    return 1
}
