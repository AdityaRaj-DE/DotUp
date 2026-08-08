#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/utils.sh"
source "${SCRIPT_DIR}/lib/os.sh"
source "${SCRIPT_DIR}/lib/network.sh"
source "${SCRIPT_DIR}/lib/sudo.sh"
source "${SCRIPT_DIR}/lib/package-manager.sh"

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

setup_logging

echo -e "${BOLD}${CYAN}DotUp Repair${NC}"
echo -e "${CYAN}────────────────────────────${NC}\n"

setup_temp_dir
check_network
detect_os
detect_package_manager
setup_sudo

ALL_MODULES=(system git zsh node python java docker gcloud chrome vscode antigravity)
repaired=0

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

echo ""
if [[ $repaired -gt 0 ]]; then
    echo -e "${GREEN}Repaired ${repaired} component(s).${NC}"
else
    echo -e "${GREEN}All components are healthy. Nothing to repair.${NC}"
fi
