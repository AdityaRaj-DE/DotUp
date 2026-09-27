#!/usr/bin/env bash
set -Eeuo pipefail

ENGINE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
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

source "${ENGINE_DIR}/lib/colors.sh"
source "${ENGINE_DIR}/lib/logger.sh"
source "${ENGINE_DIR}/lib/utils.sh"
source "${ENGINE_DIR}/lib/os.sh"
source "${ENGINE_DIR}/lib/network.sh"
source "${ENGINE_DIR}/lib/sudo.sh"
source "${ENGINE_DIR}/lib/package-manager.sh"
source "${ENGINE_DIR}/lib/config_parser.sh"
source "${ENGINE_DIR}/lib/config_validator.sh"
source "${ENGINE_DIR}/lib/state_engine.sh"
source "${ENGINE_DIR}/lib/module_adapter.sh"
source "${ENGINE_DIR}/lib/registry.sh"


execute_module() {
    local module="$1"
    log_info "Executing module: ${module}..."
    
    # We still need to call detect directly for the old logic, but through the adapter it would just be `execute_module_action detect` 
    # Actually, the adapter doesn't return state, it just executes the function.
    # To return state, we should just let it run or modify the adapter to echo.
    # Wait, the adapter handles sourcing. So we can just rely on the adapter to source it, then call detect.
    # Let's keep it simple: the adapter handles the action.
    
    # In V1, detect is expected to echo the state.
    # Let's source the module explicitly for detect here, or add 'detect' to adapter.
    # But adapter currently just executes it. If it executes it, stdout is preserved!
    
    local state
    state=$(execute_module_action "$module" "detect") || fail_critical "Module function not found for $module detect"

    if [[ "$state" == "NOT_INSTALLED" ]]; then
        execute_module_action "$module" "install"
        execute_module_action "$module" "configure"
    elif [[ "$state" == "BROKEN" ]]; then
        execute_module_action "$module" "repair"
        execute_module_action "$module" "configure"
    elif [[ "$state" == "NOT_APPLICABLE" ]]; then
        log_warn "Module ${module} is not applicable (skipped)."
    else
        log_info "${module} already installed, ensuring configuration..."
        execute_module_action "$module" "configure"
    fi
    execute_module_action "$module" "validate"
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

    case "$action" in
    INSTALL_REQUIRED | VERSION_CHANGE_REQUIRED)
        execute_module_action "$module" "install"
        execute_module_action "$module" "configure"
        execute_module_action "$module" "validate"
        ;;
    REPAIR_REQUIRED)
        execute_module_action "$module" "repair"
        execute_module_action "$module" "configure"
        execute_module_action "$module" "validate"
        ;;
    SATISFIED)
        log_info "${module} already satisfied, ensuring configuration..."
        execute_module_action "$module" "configure"
        execute_module_action "$module" "validate"
        ;;
    UNSUPPORTED)
        log_warn "Module ${module} is UNSUPPORTED on this platform (skipped)."
        ;;
    *)
        log_warn "Module ${module} has UNKNOWN state. Attempting configuration anyway..."
        execute_module_action "$module" "configure"
        execute_module_action "$module" "validate"
        ;;
    esac
}

execute_components_v2() {
    local modules=("$@")
    
    # Phase 7B: Execute State Engine
    collect_desired_state "${modules[@]}"
    collect_actual_state "${modules[@]}"
    compare_state "${modules[@]}"

    if [[ $PLAN_MODE -eq 1 ]]; then
        print_plan
        exit 0
    fi

    # Phase 7C: V2 Execution Routing
    for mod in "${modules[@]}"; do
        execute_module_v2 "$mod"
    done
}

execute_components_v1() {
    local modules=("$@")
    
    if [[ $PLAN_MODE -eq 1 ]]; then
        fail_critical "--plan is only supported for V2 YAML configurations (--config)."
    fi

    for mod in "${modules[@]}"; do
        execute_module "$mod"
    done
}

main() {
    setup_logging
    echo -e "${BOLD}${CYAN}════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN} DotUp${NC}"
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

        # In V2, we simply build the array of modules requested
        for mod in "${CONFIG_MODULES[@]}"; do
            modules_to_run+=("$mod")
        done

        execute_components_v2 "${modules_to_run[@]}"
    else
        # V1 Legacy Profile Support
        local profile_file="${ENGINE_DIR}/config/profiles/${PROFILE}.conf"
        if [[ ! -f "$profile_file" ]]; then
            fail_critical "Profile not found: ${PROFILE}"
        fi

        log_info "Loading legacy profile: ${PROFILE}"
        while IFS= read -r line || [[ -n "$line" ]]; do
            [[ -z "$line" || "$line" =~ ^#.*$ ]] && continue
            modules_to_run+=("$line")
        done <"$profile_file"

        execute_components_v1 "${modules_to_run[@]}"
    fi

    log_info "Installing dotup CLI wrapper..."
    local bin_dir="${HOME}/.local/bin"
    mkdir -p "${bin_dir}"
    cp "${ENGINE_DIR}/cli/dotup" "${bin_dir}/dotup"
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
