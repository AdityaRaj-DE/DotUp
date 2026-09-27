#!/usr/bin/env bash
set -Eeuo pipefail

ENGINE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
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

source "${ENGINE_DIR}/lib/colors.sh"
source "${ENGINE_DIR}/lib/logger.sh"
source "${ENGINE_DIR}/lib/utils.sh"
source "${ENGINE_DIR}/lib/os.sh"
source "${ENGINE_DIR}/lib/package-manager.sh"
source "${ENGINE_DIR}/lib/config_parser.sh"
source "${ENGINE_DIR}/lib/state_engine.sh"
source "${ENGINE_DIR}/lib/module_adapter.sh"
source "${ENGINE_DIR}/lib/registry.sh"


setup_logging
detect_os
detect_package_manager

echo -e "${BOLD}${CYAN}DotUp Doctor${NC}"
echo -e "${CYAN}────────────────────────────${NC}\n"

problems=0

if [[ -n "$CONFIG_FILE" ]]; then
    log_info "Running diagnostics via configuration: ${CONFIG_FILE}"
    parse_config "$CONFIG_FILE"
    collect_desired_state "${CONFIG_MODULES[@]}"
    collect_actual_state "${CONFIG_MODULES[@]}"
    compare_state "${CONFIG_MODULES[@]}"

    for mod in "${CONFIG_MODULES[@]}"; do
        safe_mod="${mod//-/_}"
        action_var="DIFF_STATE_${safe_mod}_action"
        action="${!action_var:-UNKNOWN}"

        if [[ "$action" == "SATISFIED" ]]; then
            echo -e "${GREEN}✓${NC} ${mod}"
        elif [[ "$action" == "REPAIR_REQUIRED" ]]; then
            echo -e "${RED}✗${NC} ${mod} (Broken)"
            ((problems++))
        elif [[ "$action" == "UNSUPPORTED" ]]; then
            echo -e "${YELLOW}-Skipped-${NC} ${mod} (Unsupported)"
        else
            echo -e "${YELLOW}-Skipped-${NC} ${mod} (Needs Install/Update)"
            ((problems++))
        fi
    done
else
    log_info "Running Legacy V1 comprehensive diagnostics on all modules..."

    check_module() {
        local module="$1"
        local name="$2"
        local state
        state=$(execute_module_action "$module" "detect")

        # state contains "status=..." and optionally "version=..."
        local status_val
        status_val=$(echo "$state" | grep "status=" | cut -d= -f2 || echo "UNKNOWN")
        
        if [[ "$status_val" == "INSTALLED" ]]; then
            echo -e "${GREEN}✓${NC} ${name}"
        elif [[ "$status_val" == "NOT_APPLICABLE" ]]; then
            echo -e "${YELLOW}-Skipped-${NC} ${name} (Not Applicable)"
        else
            echo -e "${RED}✗${NC} ${name} (${status_val})"
            problems=$((problems + 1))
        fi
    }

    
    read -r -a ALL_MODS <<< "$(registry_list_all_modules)"
    
    echo -e "${BOLD}Installed Components${NC}"
    for mod in "${ALL_MODS[@]}"; do
        check_module "$mod" "$mod"
    done
    echo ""
fi

if [[ $problems -gt 0 ]]; then
    echo -e "${RED}${problems} problem(s) detected.${NC} Run ./repair.sh to attempt automatic repair."
    exit 1
else
    echo -e "${GREEN}No problems detected.${NC}"
    exit 0
fi
