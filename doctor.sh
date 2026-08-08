#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/utils.sh"

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

echo -e "${BOLD}${CYAN}DotUp Doctor${NC}"
echo -e "${CYAN}────────────────────────────${NC}\n"

problems=0

check_module() {
    local module="$1"
    local name="$2"
    local state
    state=$("${module}_detect")

    if [[ "$state" == "INSTALLED" ]]; then
        echo -e "${GREEN}✓${NC} ${name}"
    elif [[ "$state" == "NOT_APPLICABLE" ]]; then
        echo -e "${YELLOW}-Skipped-${NC} ${name} (Not Applicable)"
    else
        echo -e "${RED}✗${NC} ${name} (${state})"
        ((problems++))
    fi
}

echo -e "${BOLD}System${NC}"
check_module system "System Packages"
echo ""
echo -e "${BOLD}Development${NC}"
check_module git "Git"
check_module node "Node.js (fnm)"
check_module python "Python"
check_module java "Java JDK"
echo ""
echo -e "${BOLD}Infrastructure${NC}"
check_module docker "Docker"
check_module gcloud "Google Cloud CLI"
echo ""
echo -e "${BOLD}Terminal${NC}"
check_module zsh "Zsh & Oh My Zsh"
echo ""
echo -e "${BOLD}Editors & Applications${NC}"
check_module vscode "VS Code"
check_module chrome "Google Chrome"
check_module antigravity "Antigravity"
echo ""

if [[ $problems -gt 0 ]]; then
    echo -e "${RED}${problems} problem(s) detected.${NC} Run ./repair.sh to attempt automatic repair."
    exit 1
else
    echo -e "${GREEN}No problems detected.${NC}"
    exit 0
fi
