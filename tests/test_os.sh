#!/usr/bin/env bash

set -e

# Mock logger
log_debug() { :; }
log_warn() { :; }
log_success() { :; }
fail_critical() {
    # Don't exit the script during tests, just log it so we can test the failure case
    echo "FAIL_CRITICAL: $1"
}

mock_uname() {
    echo "$MOCK_UNAME_OUT"
}

command() {
    if [[ "$1" == "-v" && "$2" == "systemctl" ]]; then
        if [[ "$MOCK_SYSTEMCTL" == "true" ]]; then
            return 0
        else
            return 1
        fi
    fi
    builtin command "$@"
}

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
alias uname=mock_uname
shopt -s expand_aliases

source "${SCRIPT_DIR}/../lib/os.sh"

run_test() {
    local name="$1"
    local mock_os_release="$2"
    local mock_uname_val="$3"
    local expected_dist="$4"
    local expected_arch="$5"
    local expected_pkg="$6"
    local mock_systemctl_val="${7:-false}"
    local expected_init="${8:-UNKNOWN}"

    echo "Running test: $name"

    MOCK_UNAME_OUT="$mock_uname_val"
    MOCK_SYSTEMCTL="$mock_systemctl_val"

    if [[ -n "$mock_os_release" ]]; then
        echo -e "$mock_os_release" > /tmp/os-release-mock
        export DOTUP_OS_RELEASE_FILE="/tmp/os-release-mock"
    else
        export DOTUP_OS_RELEASE_FILE="/tmp/non-existent-file"
    fi

    # Reset variables
    _PLATFORM_DISTRIBUTION="UNKNOWN"
    _PLATFORM_VERSION="UNKNOWN"
    _PLATFORM_DIST_ID="UNKNOWN"
    _PLATFORM_ARCHITECTURE="UNKNOWN"
    _PLATFORM_PACKAGE_MANAGER="UNKNOWN"
    _PLATFORM_INIT_SYSTEM="UNKNOWN"

    # Run detection
    detect_os >/dev/null

    # Assertions
    local actual_dist
    actual_dist=$(platform_distribution)
    local actual_arch
    actual_arch=$(platform_architecture)
    local actual_pkg
    actual_pkg=$(platform_package_manager)
    local actual_init
    actual_init=$(platform_init_system)

    if [[ "$actual_dist" != "$expected_dist" ]]; then
        echo "FAIL: Expected dist '$expected_dist', got '$actual_dist'"
        exit 1
    fi

    if [[ "$actual_arch" != "$expected_arch" ]]; then
        echo "FAIL: Expected arch '$expected_arch', got '$actual_arch'"
        exit 1
    fi

    if [[ "$actual_pkg" != "$expected_pkg" ]]; then
        echo "FAIL: Expected pkg manager '$expected_pkg', got '$actual_pkg'"
        exit 1
    fi

    if [[ "$actual_init" != "$expected_init" ]]; then
        echo "FAIL: Expected init system '$expected_init', got '$actual_init'"
        exit 1
    fi

    echo "PASS: $name"
}

# 1. Ubuntu
run_test "Ubuntu x86_64" "ID=ubuntu\nVERSION_ID=24.04\nPRETTY_NAME=\"Ubuntu 24.04 LTS\"" "x86_64" "Ubuntu" "amd64" "apt" true "systemd"

# 2. Debian
run_test "Debian arm64" "ID=debian\nVERSION_ID=12\nPRETTY_NAME=\"Debian GNU/Linux 12\"" "aarch64" "Debian" "arm64" "apt" false "UNKNOWN"

# 3. Fedora
run_test "Fedora x86_64" "ID=fedora\nVERSION_ID=40\nPRETTY_NAME=\"Fedora Linux 40\"" "x86_64" "Fedora" "amd64" "dnf" true "systemd"

# 4. Arch
run_test "Arch Linux" "ID=arch\nPRETTY_NAME=\"Arch Linux\"" "x86_64" "Arch" "amd64" "pacman" true "systemd"

# 5. Linux Mint (Ubuntu derivative)
run_test "Linux Mint" "ID=linuxmint\nID_LIKE=ubuntu\nPRETTY_NAME=\"Linux Mint 21\"" "x86_64" "Linux Mint 21" "amd64" "apt" true "systemd"

# 6. Unknown OS
run_test "Unknown OS" "ID=mycustomos\nPRETTY_NAME=\"My Custom OS\"" "armv7l" "UNKNOWN" "armhf" "UNKNOWN" false "UNKNOWN"

# 7. Missing os-release
run_test "Missing os-release" "" "x86_64" "UNKNOWN" "amd64" "UNKNOWN" false "UNKNOWN"

# 8. Architecture edge cases
run_test "Arch armv7l" "ID=ubuntu" "armv7l" "Ubuntu" "armhf" "apt"
run_test "Arch unknown" "ID=ubuntu" "mips64" "Ubuntu" "unknown" "apt"

echo "All OS tests passed!"
