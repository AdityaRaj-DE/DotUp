#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
export ENGINE_DIR="${SCRIPT_DIR}/engine"
source "${SCRIPT_DIR}/engine/lib/colors.sh"
source "${SCRIPT_DIR}/engine/lib/utils.sh"
source "${SCRIPT_DIR}/engine/lib/logger.sh"
source "${SCRIPT_DIR}/engine/lib/registry.sh"
source "${SCRIPT_DIR}/engine/lib/module_adapter.sh"
source "${SCRIPT_DIR}/engine/lib/state_engine.sh"

export LOG_FILE="/dev/null"
export DOTUP_ENV="test"
export PLAN_MODE=1

# Mock the print_plan function locally to capture output instead of stdout printing
MOCK_OUTPUT_FILE=$(mktemp)
trap 'rm -f $MOCK_OUTPUT_FILE' EXIT

print_plan() {
    # We inspect the global DIFF_STATE vars directly since execute_components_v2
    # will populate them for the provided arguments.
    # To do this safely for the test, we iterate the exported vars
    for var in ${!DIFF_STATE_*}; do
        local mod_name="${var#DIFF_STATE_}"
        mod_name="${mod_name%_action}"
        local action="${!var}"
        echo "${mod_name}=${action}" >> "$MOCK_OUTPUT_FILE"
    done
}

# The target function under test
execute_components_v2() {
    local modules=("$@")
    
    # Phase 7B: Execute State Engine
    collect_desired_state "${modules[@]}"
    collect_actual_state "${modules[@]}"
    compare_state "${modules[@]}"

    if [[ $PLAN_MODE -eq 1 ]]; then
        print_plan
        return 0
    fi
}

# We need an empty dotup config file so the state engine doesn't crash or read garbage
export DOTUP_CONFIG_FILE=$(mktemp)
trap 'rm -f $DOTUP_CONFIG_FILE' EXIT

echo "Running Programmatic Execution Test..."

# Test executing an arbitrary list of components without a config file
execute_components_v2 "git" "node"

# Verify that the state engine processed exactly those two modules
if grep -q "git=INSTALL_REQUIRED\|git=SATISFIED" "$MOCK_OUTPUT_FILE" && grep -q "node=INSTALL_REQUIRED\|node=SATISFIED" "$MOCK_OUTPUT_FILE"; then
    echo -e "${GREEN}PASS${NC}: Programmatic array execution successfully generated a plan for requested modules."
else
    echo -e "${RED}FAIL${NC}: Programmatic execution did not generate expected state differences."
    echo "Output:"
    cat "$MOCK_OUTPUT_FILE"
    exit 1
fi

exit 0
