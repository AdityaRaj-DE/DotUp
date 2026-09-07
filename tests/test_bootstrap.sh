#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
source "${SCRIPT_DIR}/lib/colors.sh"

FAILURES=0

run_test() {
    local name="$1"
    local cmd="$2"
    local expected_output="$3"

    echo -n "Test Bootstrap: ${name}... "
    local output
    
    if output=$(bash -c "$cmd" 2>&1); then
        if [[ "$output" == *"$expected_output"* ]]; then
            echo -e "${GREEN}PASS${NC}"
        else
            echo -e "${RED}FAIL${NC} (Missing expected output: '$expected_output')"
            echo "Output was:"
            echo "$output"
            FAILURES=$((FAILURES + 1))
        fi
    else
        echo -e "${RED}FAIL${NC} (Script exited with error)"
        echo "Output was:"
        echo "$output"
        FAILURES=$((FAILURES + 1))
    fi
}

echo "Running Bootstrap Integration Tests..."

# Create a mock release tarball
TEST_DIR=$(mktemp -d)
mkdir -p "${TEST_DIR}/dotup-test"
cat << 'MOCK' > "${TEST_DIR}/dotup-test/install.sh"
#!/bin/bash
echo "MOCK_INSTALL_SUCCESS"
MOCK
chmod +x "${TEST_DIR}/dotup-test/install.sh"

(cd "$TEST_DIR" && tar -czf dotup-test.tar.gz dotup-test/)
(cd "$TEST_DIR" && sha256sum dotup-test.tar.gz > SHA256SUMS)

export DOTUP_LOCAL_TAR="${TEST_DIR}/dotup-test.tar.gz"
export DOTUP_LOCAL_SHA="${TEST_DIR}/SHA256SUMS"
export DOTUP_VERSION="test"

run_test "Local artifact extraction and execution" "bash ${SCRIPT_DIR}/bootstrap.sh" "MOCK_INSTALL_SUCCESS"

# Test custom target script
cat << 'MOCK' > "${TEST_DIR}/dotup-test/custom.sh"
#!/bin/bash
echo "MOCK_CUSTOM_SUCCESS"
MOCK
chmod +x "${TEST_DIR}/dotup-test/custom.sh"
(cd "$TEST_DIR" && tar -czf dotup-test.tar.gz dotup-test/)
(cd "$TEST_DIR" && sha256sum dotup-test.tar.gz > SHA256SUMS)

export DOTUP_SCRIPT="custom.sh"
run_test "Custom target script execution" "bash ${SCRIPT_DIR}/bootstrap.sh" "MOCK_CUSTOM_SUCCESS"

rm -rf "$TEST_DIR"

if [[ $FAILURES -eq 0 ]]; then
    echo -e "\n${GREEN}All bootstrap tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}${FAILURES} bootstrap tests failed.${NC}"
    exit 1
fi
