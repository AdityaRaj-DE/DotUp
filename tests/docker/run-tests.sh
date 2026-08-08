#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT="${SCRIPT_DIR}/../.."

run_test() {
    local os_name="$1"
    local dockerfile="${SCRIPT_DIR}/${os_name}.Dockerfile"
    local image_name="devbootstrap-test-${os_name}"
    
    echo "========================================"
    echo "Testing on ${os_name}"
    echo "========================================"
    
    echo "Building test image for ${os_name}..."
    docker build -t "$image_name" -f "$dockerfile" "${REPO_ROOT}"

    echo "Running bootstrap and idempotency test on ${os_name}..."
    # Execute bootstrap.sh first, then for idempotency run install.sh again from the extracted dir
    # Since bootstrap.sh extracts to /tmp, we just run install.sh from there for the second run
    docker run --rm "$image_name" bash -c "./bootstrap.sh --profile minimal && echo '--- SECOND RUN ---' && cd /tmp/devbootstrap* && ./install.sh --profile minimal"
    
    echo "Test on ${os_name} PASSED!"
}

run_test "ubuntu"
run_test "debian"
