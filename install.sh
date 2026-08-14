#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROFILE=""
CONFIG_FILE=""
PLAN_MODE=0

while [[ "$#" -gt 0 ]]; do
    case $1 in
    --profile)
        PROFILE="$2"
        shift
        ;;
    --config)
        CONFIG_FILE="$2"
        shift
        ;;
    --plan)
        PLAN_MODE=1
        ;;
    *)
        echo "Unknown parameter passed: $1"
        exit 1
        ;;
    esac
    shift
done

if [[ -z "$PROFILE" && -z "$CONFIG_FILE" ]]; then
    PROFILE="full"
fi

source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/utils.sh"
source "${SCRIPT_DIR}/lib/os.sh"
source "${SCRIPT_DIR}/lib/network.sh"
source "${SCRIPT_DIR}/lib/sudo.sh"
source "${SCRIPT_DIR}/lib/package-manager.sh"
source "${SCRIPT_DIR}/lib/config_parser.sh"
source "${SCRIPT_DIR}/lib/config_validator.sh"
source "${SCRIPT_DIR}/lib/state_engine.sh"

source "${SCRIPT_DIR}/modules/system/packages.sh"
source "${SCRIPT_DIR}/modules/development/git.sh"
source "${SCRIPT_DIR}/modules/terminal/zsh.sh"
source "${SCRIPT_DIR}/modules/development/node.sh"
source "${SCRIPT_DIR}/modules/development/python.sh"
source "${SCRIPT_DIR}/modules/development/java.sh"
source "${SCRIPT_DIR}/modules/infrastructure/docker.sh"
source "${SCRIPT_DIR}/modules/infrastructure/gcloud.sh"
source "${SCRIPT_DIR}/modules/applications/chrome.sh"
source "${SCRIPT_DIR}/modules/editors/vscode.sh"
source "${SCRIPT_DIR}/modules/editors/antigravity.sh"

execute_module() {
    local module="$1"
    log_info "Executing module: ${module}..."
    local detect_fn="${module}_detect"
    local install_fn="${module}_install"
    local repair_fn="${module}_repair"
    local config_fn="${module}_configure"
    local validate_fn="${module}_validate"

    if ! declare -F "$detect_fn" >/dev/null; then
        fail_critical "Module function not found: $detect_fn"
    fi

    local state
    state=$("$detect_fn")

    if [[ "$state" == "NOT_INSTALLED" ]]; then
        "$install_fn"
        "$config_fn"
    elif [[ "$state" == "BROKEN" ]]; then
        "$repair_fn"
        "$config_fn"
    elif [[ "$state" == "NOT_APPLICABLE" ]]; then
        log_warn "Module ${module} is not applicable (skipped)."
    else
        log_info "${module} already installed, ensuring configuration..."
        "$config_fn"
    fi
    "$validate_fn"
}

print_plan() {
    echo -e "\n${BOLD}${CYAN}════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN} Execution Plan${NC}"
    echo -e "${BOLD}${CYAN}════════════════════════════════════${NC}"
    
    for mod in "${CONFIG_MODULES[@]}"; do
        local safe_mod="${mod//-/_}"
        local action_var="DIFF_STATE_${safe_mod}_action"
        local action="${!action_var:-UNKNOWN}"
        
        case "$action" in
            SATISFIED)
                echo -e "  [${GREEN}SATISFIED${NC}] ${mod}"
                ;;
            INSTALL_REQUIRED)
                echo -e "  [${YELLOW}INSTALL${NC}]   ${mod}"
                ;;
            VERSION_CHANGE_REQUIRED)
                echo -e "  [${YELLOW}UPDATE${NC}]    ${mod}"
                ;;
            REPAIR_REQUIRED)
                echo -e "  [${RED}REPAIR${NC}]    ${mod}"
                ;;
            UNSUPPORTED)
                echo -e "  [${RED}UNSUPPORTED${NC}] ${mod}"
                ;;
            *)
                echo -e "  [${RED}UNKNOWN${NC}]   ${mod}"
                ;;
        esac
    done
    echo ""
}

execute_module_v2() {
    local module="$1"
    local safe_mod="${module//-/_}"
    local action_var="DIFF_STATE_${safe_mod}_action"
    local action="${!action_var:-UNKNOWN}"

    log_info "Processing module [V2]: ${module} (Action: ${action})"
    
    local install_fn="${safe_mod}_install"
    local repair_fn="${safe_mod}_repair"
    local config_fn="${safe_mod}_configure"
    local validate_fn="${safe_mod}_validate"

    case "$action" in
        INSTALL_REQUIRED|VERSION_CHANGE_REQUIRED)
            "$install_fn"
            "$config_fn"
            "$validate_fn"
            ;;
        REPAIR_REQUIRED)
            "$repair_fn"
            "$config_fn"
            "$validate_fn"
            ;;
        SATISFIED)
            log_info "${module} already satisfied, ensuring configuration..."
            "$config_fn"
            "$validate_fn"
            ;;
        UNSUPPORTED)
            log_warn "Module ${module} is UNSUPPORTED on this platform (skipped)."
            ;;
        *)
            log_warn "Module ${module} has UNKNOWN state. Attempting configuration anyway..."
            "$config_fn"
            if declare -F "$validate_fn" >/dev/null; then
                "$validate_fn"
            fi
            ;;
    esac
}

main() {
    setup_logging
    echo -e "${BOLD}${CYAN}════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN} DotUp V1${NC}"
    echo -e "${BOLD}${CYAN}════════════════════════════════════${NC}"

    log_info "Initializing..."

    setup_temp_dir
    check_network
    detect_os
    verify_platform_support
    detect_package_manager
    setup_sudo

    log_success "Preflight checks passed."

    local modules_to_run=()

    if [[ -n "$CONFIG_FILE" ]]; then
        log_info "Loading YAML config: ${CONFIG_FILE}"
        parse_config "$CONFIG_FILE"
        validate_config
        
        # In V2, we dynamically source exactly the modules requested
        for mod in "${CONFIG_MODULES[@]}"; do
            modules_to_run+=("$mod")
            for mod_file in "${SCRIPT_DIR}/modules"/*/"${mod}.sh"; do
                if [[ -f "$mod_file" ]]; then
                    # shellcheck source=/dev/null
                    source "$mod_file"
                    break
                fi
            done
        done
        
        # Phase 7B: Execute State Engine
        collect_desired_state
        collect_actual_state
        compare_state
        
        if [[ $PLAN_MODE -eq 1 ]]; then
            print_plan
            exit 0
        fi

        for mod in "${modules_to_run[@]}"; do
            execute_module_v2 "$mod"
        done
    else
        # V1 Legacy Profile Support
        local profile_file="${SCRIPT_DIR}/config/profiles/${PROFILE}.conf"
        if [[ ! -f "$profile_file" ]]; then
            fail_critical "Profile not found: ${PROFILE}"
        fi

        log_info "Loading legacy profile: ${PROFILE}"
        while IFS= read -r line || [[ -n "$line" ]]; do
            [[ -z "$line" || "$line" =~ ^#.*$ ]] && continue
            modules_to_run+=("$line")
        done <"$profile_file"
        
        if [[ $PLAN_MODE -eq 1 ]]; then
            fail_critical "--plan is only supported for V2 YAML configurations (--config)."
        fi

        for mod in "${modules_to_run[@]}"; do
            execute_module "$mod"
        done
    fi

    log_info "Installing dotup CLI wrapper..."
    local bin_dir="${HOME}/.local/bin"
    mkdir -p "${bin_dir}"
    cp "${SCRIPT_DIR}/dotup" "${bin_dir}/dotup"
    chmod +x "${bin_dir}/dotup"

    if [[ ":$PATH:" != *":$bin_dir:"* ]]; then
        log_warn "${bin_dir} is not in your PATH. Please add it to your shell configuration."
    fi

    echo -e "\n${BOLD}${CYAN}════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN} dotup Installation Complete${NC}"
    echo -e "${BOLD}${CYAN}════════════════════════════════════${NC}"

    log_info "View detailed logs at: ${LATEST_LOG}"
}

main "$@"
