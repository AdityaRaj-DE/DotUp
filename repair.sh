#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROFILE=""
CONFIG_FILE=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
    --profile)
        # shellcheck disable=SC2034
        PROFILE="$2"
        shift
        ;;
    --config)
        CONFIG_FILE="$2"
        shift
        ;;
    *)
        echo "Unknown parameter passed: $1"
        exit 1
        ;;
    esac
    shift
done

source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/utils.sh"
source "${SCRIPT_DIR}/lib/os.sh"
source "${SCRIPT_DIR}/lib/network.sh"
source "${SCRIPT_DIR}/lib/sudo.sh"
source "${SCRIPT_DIR}/lib/package-manager.sh"
source "${SCRIPT_DIR}/lib/config_parser.sh"
source "${SCRIPT_DIR}/lib/state_engine.sh"

source "${SCRIPT_DIR}/modules/system/system.sh"
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

setup_logging

echo -e "${BOLD}${CYAN}DotUp Repair${NC}"
echo -e "${CYAN}────────────────────────────${NC}\n"

setup_temp_dir
check_network
detect_os
verify_platform_support
detect_package_manager
setup_sudo

repaired=0

if [[ -n "$CONFIG_FILE" ]]; then
    log_info "Running V2 diagnostics via configuration: ${CONFIG_FILE}"
    parse_config "$CONFIG_FILE"
    collect_desired_state
    collect_actual_state
    compare_state

    for module in "${CONFIG_MODULES[@]}"; do
        safe_mod="${module//-/_}"
        action_var="DIFF_STATE_${safe_mod}_action"
        action="${!action_var:-UNKNOWN}"

        if [[ "$action" == "REPAIR_REQUIRED" ]]; then
            echo -e "${YELLOW}Repairing ${module}...${NC}"
            "${module}_repair"
            "${module}_configure"
            "${module}_validate"
            ((repaired++))
        else
            echo -e "${GREEN}Skipping ${module}...${NC} (Status: ${action})"
        fi
    done
else
    log_info "Running Legacy V1 comprehensive repair on all modules..."
    ALL_MODULES=(system git zsh node python java docker gcloud chrome vscode antigravity)
    for module in "${ALL_MODULES[@]}"; do
        state=$("${module}_detect")
        if [[ "$state" == "BROKEN" ]] || [[ "$state" == "NOT_INSTALLED" ]]; then
            echo -e "${YELLOW}Repairing ${module}...${NC}"
            "${module}_repair"
            "${module}_configure"
            "${module}_validate"
            ((repaired++))
        else
            echo -e "${GREEN}Skipping ${module}...${NC} (Status: ${state})"
        fi
    done
fi

echo ""
if [[ $repaired -gt 0 ]]; then
    echo -e "${GREEN}Repaired ${repaired} component(s).${NC}"
else
    echo -e "${GREEN}All components are healthy. Nothing to repair.${NC}"
fi
