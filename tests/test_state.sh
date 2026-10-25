#!/usr/bin/env bash
# shellcheck disable=SC2317,SC2034,SC2154
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
export ENGINE_DIR="${SCRIPT_DIR}/engine"
source "${SCRIPT_DIR}/engine/lib/colors.sh"
source "${SCRIPT_DIR}/engine/lib/logger.sh"
source "${SCRIPT_DIR}/engine/lib/state_engine.sh"
source "${SCRIPT_DIR}/engine/lib/registry.sh"
source "${SCRIPT_DIR}/engine/lib/module_adapter.sh"

export LOG_FILE="/dev/null"
export VERBOSE=1
FAILURES=0

run_test() {
    local name="$1"
    local func="$2"
    local expected_output="$3"

    echo -n "Test: ${name}... "

    local output
    local exit_code=0

    if output=$($func 2>&1); then
        exit_code=0
    else
        exit_code=$?
    fi

    if [[ "$expected_output" == "pass" ]]; then
        if [[ $exit_code -eq 0 ]]; then
            echo -e "${GREEN}PASS${NC}"
        else
            echo -e "${RED}FAIL${NC} (Got exit $exit_code: $output)"
            FAILURES=$((FAILURES + 1))
        fi
    elif [[ "$output" == *"$expected_output"* ]]; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC} (Expected output '$expected_output', got: $output)"
        FAILURES=$((FAILURES + 1))
    fi
}

echo "Running State Engine Tests..."

# --- 1. Desired State Tests ---
# Mock configuration
CONFIG_MODULES=("git" "node" "python")

export DOTUP_CONFIG_FILE="/tmp/dotup-test-state-config.tmp"
cat <<'MOCK' >"$DOTUP_CONFIG_FILE"
node.version=20
python.version=3.12
MOCK

test_desired() {
    collect_desired_state "${CONFIG_MODULES[@]}"

    # shellcheck disable=SC2154
    if [[ "$DESIRED_STATE_git_status" != "INSTALLED" ]]; then
        echo "Git status incorrect: $DESIRED_STATE_git_status"
        return 1
    fi
    if [[ "$DESIRED_STATE_node_version" != "20" ]]; then
        echo "Node version incorrect: $DESIRED_STATE_node_version"
        return 1
    fi
    return 0
}
run_test "Collect Desired State" test_desired "pass"

# --- 2. Actual State Tests ---
# Mock adapter function for detection
execute_module_action() {
    local mod="$1"
    local action="$2"
    if [[ "$action" != "detect" ]]; then return 0; fi

    if [[ "$mod" == "git" ]]; then
        echo "status=INSTALLED"
        echo "version=2.45.0"
    elif [[ "$mod" == "node" ]]; then
        echo "status=NOT_INSTALLED"
    elif [[ "$mod" == "python" ]]; then
        echo "status=BROKEN"
    elif [[ "$mod" == "fake_module" ]]; then
        echo "status=UNKNOWN"
    fi
}

CONFIG_MODULES=("git" "node" "python" "fake_module")

test_actual() {
    collect_actual_state "${CONFIG_MODULES[@]}"

    if [[ "$ACTUAL_STATE_git_status" != "INSTALLED" || "$ACTUAL_STATE_git_version" != "2.45.0" ]]; then
        echo "Git actual state incorrect"
        return 1
    fi

    if [[ "$ACTUAL_STATE_node_status" != "NOT_INSTALLED" ]]; then
        echo "Node actual state incorrect"
        return 1
    fi

    if [[ "$ACTUAL_STATE_python_status" != "BROKEN" ]]; then
        echo "Python actual state incorrect"
        return 1
    fi

    # shellcheck disable=SC2154
    if [[ "$ACTUAL_STATE_fake_module_status" != "UNKNOWN" ]]; then
        echo "Fake module status incorrect: $ACTUAL_STATE_fake_module_status"
        return 1
    fi

    return 0
}
run_test "Collect Actual State" test_actual "pass"

# --- 3. Difference (Compare) Tests ---

test_compare() {
    collect_desired_state "${CONFIG_MODULES[@]}"
    collect_actual_state "${CONFIG_MODULES[@]}"
    compare_state "${CONFIG_MODULES[@]}"

    if [[ "$DIFF_STATE_git_action" != "SATISFIED" ]]; then
        echo "Git diff incorrect: $DIFF_STATE_git_action"
        return 1
    fi
    if [[ "$DIFF_STATE_node_action" != "INSTALL_REQUIRED" ]]; then
        echo "Node diff incorrect: $DIFF_STATE_node_action"
        return 1
    fi
    if [[ "$DIFF_STATE_python_action" != "REPAIR_REQUIRED" ]]; then
        echo "Python diff incorrect: $DIFF_STATE_python_action"
        return 1
    fi
    if [[ "$DIFF_STATE_fake_module_action" != "UNKNOWN" ]]; then
        echo "Fake diff incorrect: $DIFF_STATE_fake_module_action"
        return 1
    fi
    return 0
}
run_test "Compare State Actions" test_compare "pass"

# Test version change
test_version_diff() {
    # Override git actual version to mismatch desired
    echo "git.version=3.0" >>"$DOTUP_CONFIG_FILE"

    collect_desired_state "${CONFIG_MODULES[@]}"
    collect_actual_state "${CONFIG_MODULES[@]}"
    compare_state "${CONFIG_MODULES[@]}"

    if [[ "$DIFF_STATE_git_action" != "VERSION_CHANGE_REQUIRED" ]]; then
        echo "Git diff incorrect: $DIFF_STATE_git_action"
        return 1
    fi
    return 0
}
run_test "Compare Version Change Required" test_version_diff "pass"

# Test semantic version match
test_semantic_version() {
    # Override git actual version to match prefix of desired
    echo "git.version=2.45" >>"$DOTUP_CONFIG_FILE"

    collect_desired_state "${CONFIG_MODULES[@]}"
    collect_actual_state "${CONFIG_MODULES[@]}"
    compare_state "${CONFIG_MODULES[@]}"

    if [[ "$DIFF_STATE_git_action" != "SATISFIED" ]]; then
        echo "Git diff incorrect: $DIFF_STATE_git_action"
        return 1
    fi
    return 0
}
run_test "Compare Semantic Version Match" test_semantic_version "pass"

if [[ $FAILURES -eq 0 ]]; then
    echo -e "\n${GREEN}All state engine tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}${FAILURES} state tests failed.${NC}"
    exit 1
fi
