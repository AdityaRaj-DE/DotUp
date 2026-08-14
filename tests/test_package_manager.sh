#!/usr/bin/env bash

set -e

# Mock logger and platform context
log_debug() { :; }
log_info() { :; }
fail_critical() {
    echo "FAIL_CRITICAL: $1"
}

_MOCK_PLATFORM_PM="apt"
platform_package_manager() {
    echo "$_MOCK_PLATFORM_PM"
}

# Mock apt-get, dpkg-query, apt-cache
apt-get() {
    echo "mock apt-get $@"
    if [[ "$_MOCK_APT_FAIL" == "true" ]]; then
        return 1
    fi
    return 0
}

dpkg-query() {
    if [[ "$_MOCK_PKG_INSTALLED" == "true" ]]; then
        echo "ok installed"
        return 0
    else
        return 1
    fi
}

apt-cache() {
    if [[ "$_MOCK_PKG_AVAILABLE" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "${SCRIPT_DIR}/../lib/package-manager.sh"

run_test() {
    local name="$1"
    local fn="$2"
    local arg="$3"
    local expected_ret="$4"
    local expect_fail_msg="$5"

    echo "Running test: $name"
    local out
    set +e
    out=$($fn "$arg")
    local ret=$?
    set -e

    if [[ "$expected_ret" == "fail" ]]; then
        if [[ "$out" != *"FAIL_CRITICAL:"* ]]; then
            echo "FAIL: Expected failure, but got success"
            exit 1
        fi
        if [[ -n "$expect_fail_msg" && "$out" != *"$expect_fail_msg"* ]]; then
            echo "FAIL: Expected failure message containing '$expect_fail_msg', got '$out'"
            exit 1
        fi
    else
        if [[ $ret -ne $expected_ret ]]; then
            echo "FAIL: Expected return code $expected_ret, got $ret"
            exit 1
        fi
    fi
    echo "PASS: $name"
}

# Tests for pkg_is_installed
_MOCK_PLATFORM_PM="apt"
PKG_MANAGER="apt"
_MOCK_PKG_INSTALLED="true"
run_test "pkg_is_installed (true)" "pkg_is_installed" "curl" 0

_MOCK_PKG_INSTALLED="false"
run_test "pkg_is_installed (false)" "pkg_is_installed" "curl" 1

# Tests for pkg_is_available
_MOCK_PKG_AVAILABLE="true"
run_test "pkg_is_available (true)" "pkg_is_available" "btop" 0

_MOCK_PKG_AVAILABLE="false"
run_test "pkg_is_available (false)" "pkg_is_available" "btop" 1

# Tests for unsupported package manager
_MOCK_PLATFORM_PM="dnf"
PKG_MANAGER="dnf"
run_test "pkg_is_installed (dnf)" "pkg_is_installed" "curl" "fail" "not implemented"
run_test "pkg_is_available (dnf)" "pkg_is_available" "curl" "fail" "not implemented"
run_test "pkg_update (dnf)" "pkg_update" "" "fail" "not implemented"
run_test "pkg_install (dnf)" "pkg_install" "curl" "fail" "not implemented"

# Test detect_package_manager success and fail
_MOCK_PLATFORM_PM="apt"
run_test "detect_package_manager (apt)" "detect_package_manager" "" 0
_MOCK_PLATFORM_PM="dnf"
run_test "detect_package_manager (dnf)" "detect_package_manager" "" "fail" "not currently supported"

echo "All package-manager tests passed!"
