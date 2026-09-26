#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/config_parser.sh"
source "${SCRIPT_DIR}/lib/config_validator.sh"

export LOG_FILE="/dev/null"
export VERBOSE=1
fail_critical() { echo "FAIL_CRITICAL: $1" >&2; exit 1; }
FAILURES=0

run_test() {
    local name="$1"
    local func="$2"
    local arg="$3"
    local expected_code="$4"
    local expected_output="$5"

    echo -n "Test: ${name}... "

    local output
    local exit_code=0

    if output=$($func "$arg" 2>&1); then
        exit_code=0
    else
        exit_code=$?
    fi

    if [[ "$expected_code" == "fail" ]]; then
        if [[ $exit_code -ne 0 ]] && [[ "$output" == *"$expected_output"* ]]; then
            echo -e "${GREEN}PASS${NC}"
        else
            echo -e "${RED}FAIL${NC} (Expected failure with '$expected_output', got exit $exit_code: $output)"
            FAILURES=$((FAILURES + 1))
        fi
    else
        if [[ $exit_code -eq $expected_code ]]; then
            echo -e "${GREEN}PASS${NC}"
        else
            echo -e "${RED}FAIL${NC} (Expected exit $expected_code, got $exit_code: $output)"
            FAILURES=$((FAILURES + 1))
        fi
    fi
}

# --- Setup Test Files ---
TEST_DIR="${SCRIPT_DIR}/tests/tmp"
mkdir -p "$TEST_DIR"

cat <<'EOF' >"${TEST_DIR}/valid.yaml"
schema_version: 1
profile:
  name: valid
modules:
  system: {}
  node:
    version: "20"
EOF

cat <<'EOF' >"${TEST_DIR}/missing_schema.yaml"
profile:
  name: invalid
modules:
  system: {}
EOF

cat <<'EOF' >"${TEST_DIR}/unknown_field.yaml"
schema_version: 1
fake_root_field: true
profile:
  name: invalid
modules:
  system: {}
EOF

cat <<'EOF' >"${TEST_DIR}/unknown_module.yaml"
schema_version: 1
profile:
  name: invalid
modules:
  imaginary-tool: {}
EOF

cat <<'EOF' >"${TEST_DIR}/unknown_option.yaml"
schema_version: 1
profile:
  name: invalid
modules:
  node:
    banana: true
EOF

cat <<'EOF' >"${TEST_DIR}/security_eval.yaml"
schema_version: 1
profile:
  name: $(touch /tmp/security_test_failed)
  description: "`touch /tmp/security_test_failed2`"
modules:
  system: {}
EOF

cat <<'EOF' >"${TEST_DIR}/v3_valid.yaml"
schemaVersion: "1"
setup:
  id: backend-dev
  version: "1.0.0"
components:
  - id: git
  - id: node
    options:
      version: "24"
EOF

cat <<'EOF' >"${TEST_DIR}/v3_missing_id.yaml"
schemaVersion: "1"
setup:
  version: "1.0.0"
components:
  - id: git
EOF

cat <<'EOF' >"${TEST_DIR}/v3_missing_version.yaml"
schemaVersion: "1"
setup:
  id: backend-dev
components:
  - id: git
EOF


# --- Run Tests ---
echo "Running Config Parser Tests..."

run_test "Parse valid config" "parse_config" "${TEST_DIR}/valid.yaml" 0 ""
# Verify global state after parsing valid config
parse_config "${TEST_DIR}/valid.yaml" >/dev/null
local_node_ver=$(grep "^node.version=" "$DOTUP_CONFIG_FILE" | cut -d= -f2)
if [[ "$CONFIG_SCHEMA_VERSION" == "1" ]] && [[ "$CONFIG_PROFILE_NAME" == "valid" ]] && [[ "${CONFIG_MODULES[*]}" == *"system"* ]] && [[ "$local_node_ver" == "20" ]]; then
    echo -e "Test: Parsed state verification... ${GREEN}PASS${NC}"
else
    echo -e "Test: Parsed state verification... ${RED}FAIL${NC}"
    echo "State: VERSION=$CONFIG_SCHEMA_VERSION NAME=$CONFIG_PROFILE_NAME MODULES=${CONFIG_MODULES[*]} NODE_VER=$local_node_ver"
    FAILURES=$((FAILURES + 1))
fi

# Verify colons in description are handled correctly
cat <<'EOF' >"${TEST_DIR}/colon_test.yaml"
schema_version: 1
profile:
  name: valid
  description: "hello: world"
modules:
  system: {}
EOF
parse_config "${TEST_DIR}/colon_test.yaml" >/dev/null
if [[ "$CONFIG_PROFILE_DESCRIPTION" == "hello: world" ]]; then
    echo -e "Test: Parser handles colons in values... ${GREEN}PASS${NC}"
else
    echo -e "Test: Parser handles colons in values... ${RED}FAIL${NC} (Got: $CONFIG_PROFILE_DESCRIPTION)"
    FAILURES=$((FAILURES + 1))
fi

# We must parse missing_schema to trigger the validation failure correctly
parse_config "${TEST_DIR}/missing_schema.yaml"
run_test "Missing schema_version validation" "validate_config" "" "fail" "schema_version' is missing"

run_test "Unknown root field" "parse_config" "${TEST_DIR}/unknown_field.yaml" "fail" "Unknown root field"

parse_config "${TEST_DIR}/unknown_module.yaml"
run_test "Unknown module validation" "validate_config_semantics" "" "fail" "Unknown module 'imaginary-tool'"

parse_config "${TEST_DIR}/unknown_option.yaml"
run_test "Unknown option validation" "validate_config_semantics" "" "fail" "Invalid option 'banana'"

rm -f /tmp/security_test_failed /tmp/security_test_failed2
parse_config "${TEST_DIR}/security_eval.yaml" >/dev/null
if [[ ! -f /tmp/security_test_failed && ! -f /tmp/security_test_failed2 ]]; then
    echo -e "Test: Security eval injection prevented... ${GREEN}PASS${NC}"
else
    echo -e "Test: Security eval injection prevented... ${RED}FAIL${NC}"
    FAILURES=$((FAILURES + 1))
    rm -f /tmp/security_test_failed /tmp/security_test_failed2
fi

# --- V3 Format Tests ---
echo "Running V3 Config Parser Tests..."

run_test "Parse valid V3 config" "parse_config" "${TEST_DIR}/v3_valid.yaml" 0 ""
# Verify global state after parsing valid V3 config
parse_config "${TEST_DIR}/v3_valid.yaml" >/dev/null
local_node_ver_v3=$(grep "^node.version=" "$DOTUP_CONFIG_FILE" | cut -d= -f2)
if [[ "$CONFIG_SCHEMA_VERSION" == "1" ]] && [[ "$CONFIG_PROFILE_NAME" == "backend-dev" ]] && [[ "$CONFIG_SETUP_VERSION" == "1.0.0" ]] && [[ "${CONFIG_MODULES[*]}" == *"git"* ]] && [[ "${CONFIG_MODULES[*]}" == *"node"* ]] && [[ "$local_node_ver_v3" == "24" ]]; then
    echo -e "Test: V3 parsed state verification... ${GREEN}PASS${NC}"
else
    echo -e "Test: V3 parsed state verification... ${RED}FAIL${NC}"
    echo "State: VERSION=$CONFIG_SCHEMA_VERSION NAME=$CONFIG_PROFILE_NAME SETUP_VER=$CONFIG_SETUP_VERSION MODULES=${CONFIG_MODULES[*]} NODE_VER=$local_node_ver_v3"
    FAILURES=$((FAILURES + 1))
fi

parse_config "${TEST_DIR}/v3_missing_id.yaml"
run_test "Missing setup.id validation" "validate_config" "" "fail" "setup.id' is missing"

parse_config "${TEST_DIR}/v3_missing_version.yaml"
run_test "Missing setup.version validation" "validate_config" "" "fail" "setup.version' is missing"

# Cleanup
rm -rf "$TEST_DIR"

if [[ $FAILURES -eq 0 ]]; then
    echo -e "\n${GREEN}All config tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}${FAILURES} config tests failed.${NC}"
    exit 1
fi
