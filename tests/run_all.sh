#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

echo "Running Unit Tests..."
"${SCRIPT_DIR}/test_os.sh"
"${SCRIPT_DIR}/test_package_manager.sh"
"${SCRIPT_DIR}/test_config.sh"
"${SCRIPT_DIR}/test_state.sh"
"${SCRIPT_DIR}/test_plan.sh"
"${SCRIPT_DIR}/test_programmatic.sh"

echo ""
echo "Running Integration Tests..."
"${SCRIPT_DIR}/test_cli_integration.sh"
"${SCRIPT_DIR}/test_bootstrap.sh"

echo ""
echo "All tests passed successfully."
