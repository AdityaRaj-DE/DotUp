#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/logger.sh"
source "${SCRIPT_DIR}/lib/state_engine.sh"

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
CONFIG_MODULE_node_version="20"
CONFIG_MODULE_python_version="3.12"

test_desired() {
    collect_desired_state
    
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
# Mock module detection functions
git_detect_state() {
    echo "status=INSTALLED"
    echo "version=2.45.0"
}
node_detect_state() {
    echo "status=NOT_INSTALLED"
}
python_detect_state() {
    echo "status=BROKEN"
}
# Unknown module
unknown_module_detect_state() {
    echo "status=UNKNOWN"
}

CONFIG_MODULES=("git" "node" "python" "fake_module")

test_actual() {
    collect_actual_state
    
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
    
    if [[ "$ACTUAL_STATE_fake_module_status" != "UNKNOWN" ]]; then
        echo "Fake module status incorrect: $ACTUAL_STATE_fake_module_status"
        return 1
    fi
    
    return 0
}
run_test "Collect Actual State" test_actual "pass"


# --- 3. Difference (Compare) Tests ---

test_compare() {
    collect_desired_state
    collect_actual_state
    compare_state
    
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
    CONFIG_MODULE_git_version="3.0"
    
    collect_desired_state
    collect_actual_state
    compare_state
    
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
    CONFIG_MODULE_git_version="2.45"
    
    collect_desired_state
    collect_actual_state
    compare_state
    
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

