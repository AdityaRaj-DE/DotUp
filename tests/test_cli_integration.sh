#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
export ENGINE_DIR="${SCRIPT_DIR}/engine"
source "${SCRIPT_DIR}/engine/lib/colors.sh"

FAILURES=0
export LOG_FILE="/dev/null"
export DOTUP_ENV="test"

# Create mock sudo for testing
MOCK_DIR=$(mktemp -d)
export DOTUP_BIN_DIR="$MOCK_DIR/bin"
cat <<'MOCK' >"$MOCK_DIR/sudo"
#!/bin/sh
exit 0
MOCK
chmod +x "$MOCK_DIR/sudo"
export PATH="$MOCK_DIR:$PATH"

run_cli_test() {
    local name="$1"
    local cmd="$2"
    local expected_code="$3"
    local expected_output="$4"

    echo -n "Test CLI: ${name}... "
    local output
    local exit_code=0

    if output=$(bash -c "$cmd" 2>&1); then
        exit_code=0
    else
        exit_code=$?
    fi

    local passed=true
    if [[ $exit_code -ne $expected_code ]]; then
        echo -e "${RED}FAIL${NC} (Expected exit $expected_code, got $exit_code)"
        passed=false
    elif [[ -n "$expected_output" && "$output" != *"$expected_output"* ]]; then
        echo -e "${RED}FAIL${NC} (Missing expected output: '$expected_output')"
        passed=false
    fi

    if [[ "$passed" == "true" ]]; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo "Output was:"
        echo "$output"
        FAILURES=$((FAILURES + 1))
    fi
}

echo "Running CLI Integration Tests..."

# Test dotup wrapper unknown command
run_cli_test "dotup wrapper unknown" "bash ${SCRIPT_DIR}/dotup unknown-command" 1 "Unknown command:"

# Test dotup version
run_cli_test "dotup version" "bash ${SCRIPT_DIR}/dotup version" 0 "dotup version"

# Minimal mock config
cat <<'YAMLEOF' >/tmp/dotup-test-mock.yaml
schema_version: 1
profile:
  name: test-mock
modules:
  system: {}
YAMLEOF

# Test install plan
run_cli_test "install --plan with V2 config" "bash ${SCRIPT_DIR}/dotup install --config /tmp/dotup-test-mock.yaml --plan" 0 "Execution Plan"

# Test install with plan but missing config (should fail because V1 doesn't support plan)
run_cli_test "install --plan without --config" "bash ${SCRIPT_DIR}/dotup install --plan" 1 "--plan is only supported for V2 YAML configurations"

# Test doctor without config (runs ALL_MODULES fallback). Expect exit 1 because the CI machine likely misses some modules (like python or java)
run_cli_test "doctor V1 fallback (no config)" "bash ${SCRIPT_DIR}/dotup doctor" 1 "Legacy V1 comprehensive diagnostics"
# Test doctor with V2 config. Assuming system is installed.
run_cli_test "doctor V2 config" "bash ${SCRIPT_DIR}/dotup doctor --config /tmp/dotup-test-mock.yaml" 0 "diagnostics via configuration"

# Create a mock module for V3 integration tests
mkdir -p "${SCRIPT_DIR}/engine/modules/mock-test"
cat <<'MOCKMOD' >"${SCRIPT_DIR}/engine/modules/mock-test/mock-test.sh"
mock_test_detect_state() { echo "status=NOT_INSTALLED"; }
mock_test_install() { echo "Installing mock-test..."; return 0; }
mock_test_configure() { return 0; }
mock_test_validate() { return 0; }
MOCKMOD

# V3 config
cat <<'YAMLEOF' >/tmp/v3_integration.yaml
schemaVersion: "1"
setup:
  id: "v3-test"
  version: "1.0.0"
components:
  - id: "mock-test"
YAMLEOF

# Test install with V3 config
run_cli_test "install V3 config" "bash ${SCRIPT_DIR}/install.sh --config /tmp/v3_integration.yaml" 0 "Installing mock-test..."

# Clean up
rm -f /tmp/dotup-test-mock.yaml /tmp/v3_integration.yaml
rm -rf "$MOCK_DIR"
rm -rf "${SCRIPT_DIR}/engine/modules/mock-test"

if [[ $FAILURES -eq 0 ]]; then
    echo -e "\n${GREEN}All CLI integration tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}${FAILURES} CLI integration tests failed.${NC}"
    exit 1
fi
