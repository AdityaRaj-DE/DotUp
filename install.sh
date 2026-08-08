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
    
    # Modules execution point (to be implemented in subsequent phases)
    
    log_success "DevBootstrap execution complete!"
    log_info "View detailed logs at: ${LATEST_LOG}"
}

main "$@"
