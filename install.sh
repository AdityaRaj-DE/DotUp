#!/usr/bin/env bash
set -Eeuo pipefail

# Determine script directory
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Source core libraries
source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/utils.sh"
source "${SCRIPT_DIR}/lib/os.sh"
source "${SCRIPT_DIR}/lib/network.sh"
source "${SCRIPT_DIR}/lib/sudo.sh"
source "${SCRIPT_DIR}/lib/package-manager.sh"

main() {
    setup_logging
    echo -e "${BOLD}${CYAN}════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN} DevBootstrap V1${NC}"
    echo -e "${BOLD}${CYAN}════════════════════════════════════${NC}"
    
    log_info "Initializing..."
    
    setup_temp_dir
    check_network
    detect_os
    detect_package_manager
    setup_sudo
    
    log_success "Preflight checks passed."
    
    # Load Modules
    source "${SCRIPT_DIR}/modules/system/packages.sh"
    source "${SCRIPT_DIR}/modules/development/git.sh"
    source "${SCRIPT_DIR}/modules/terminal/zsh.sh"
    source "${SCRIPT_DIR}/modules/development/node.sh"
    source "${SCRIPT_DIR}/modules/development/python.sh"
    source "${SCRIPT_DIR}/modules/development/java.sh"
    
    # Execute System Packages Module
    local sys_state
    sys_state=$(system_detect)
    if [[ "$sys_state" == "NOT_INSTALLED" ]]; then
        system_install
        system_configure
    elif [[ "$sys_state" == "BROKEN" ]]; then
        system_repair
        system_configure
    else
        log_info "System base packages already installed."
    fi
    system_validate

    # Execute Git Module
    local git_state
    git_state=$(git_detect)
    if [[ "$git_state" == "NOT_INSTALLED" ]]; then
        git_install
        git_configure
    elif [[ "$git_state" == "BROKEN" ]]; then
        git_repair
        git_configure
    else
        log_info "Git already installed, ensuring configuration..."
        git_configure
    fi
    git_validate

    # Execute Zsh Module
    local zsh_state
    zsh_state=$(zsh_detect)
    if [[ "$zsh_state" == "NOT_INSTALLED" ]]; then
        zsh_install
        zsh_configure
    elif [[ "$zsh_state" == "BROKEN" ]]; then
        zsh_repair
        zsh_configure
    else
        log_info "Zsh already installed, ensuring configuration..."
        zsh_configure
    fi
    zsh_validate

    # Execute Node.js Module
    local node_state
    node_state=$(node_detect)
    if [[ "$node_state" == "NOT_INSTALLED" ]]; then
        node_install
        node_configure
    elif [[ "$node_state" == "BROKEN" ]]; then
        node_repair
        node_configure
    else
        log_info "Node.js already installed, ensuring configuration..."
        node_configure
    fi
    node_validate

    # Execute Python Module
    local python_state
    python_state=$(python_detect)
    if [[ "$python_state" == "NOT_INSTALLED" ]]; then
        python_install
        python_configure
    elif [[ "$python_state" == "BROKEN" ]]; then
        python_repair
        python_configure
    else
        log_info "Python already installed, ensuring configuration..."
        python_configure
    fi
    python_validate

    # Execute Java Module
    local java_state
    java_state=$(java_detect)
    if [[ "$java_state" == "NOT_INSTALLED" ]]; then
        java_install
        java_configure
    elif [[ "$java_state" == "BROKEN" ]]; then
        java_repair
        java_configure
    else
        log_info "Java already installed, ensuring configuration..."
        java_configure
    fi
    java_validate
    
    log_success "DevBootstrap execution complete!"
    log_info "View detailed logs at: ${LATEST_LOG}"
}

main "$@"
