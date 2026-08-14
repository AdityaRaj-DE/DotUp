#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROFILE="full"

while [[ "$#" -gt 0 ]]; do
    case $1 in
    --profile)
        PROFILE="$2"
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

    local profile_file="${SCRIPT_DIR}/config/profiles/${PROFILE}.conf"
    if [[ ! -f "$profile_file" ]]; then
        fail_critical "Profile not found: ${PROFILE}"
    fi

    log_info "Loading profile: ${PROFILE}"
    local modules=()
    while IFS= read -r line || [[ -n "$line" ]]; do
        [[ -z "$line" || "$line" =~ ^#.*$ ]] && continue
        modules+=("$line")
    done <"$profile_file"

    for mod in "${modules[@]}"; do
        execute_module "$mod"
    done

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
