#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT="${SCRIPT_DIR}/../.."

run_test() {
    local os_name="$1"
    local dockerfile="${SCRIPT_DIR}/${os_name}.Dockerfile"
    local image_name="dotup-test-${os_name}"

    echo "========================================"
    echo "Testing on ${os_name}"
    echo "========================================"

    echo "Building test image for ${os_name}..."
    docker build -t "$image_name" -f "$dockerfile" "${REPO_ROOT}"

    echo "Building release artifact for testing..."
    bash "${REPO_ROOT}/scripts/build-release.sh" test

    echo "Running bootstrap and idempotency test on ${os_name}..."
    docker run --rm -v "${REPO_ROOT}/dist:/dist" "$image_name" bash -c "DOTUP_LOCAL_TAR=/dist/dotup-test.tar.gz DOTUP_LOCAL_SHA=/dist/SHA256SUMS bash ./bootstrap.sh --config examples/minimal.yaml && echo '--- SECOND RUN ---' && cd /tmp/tmp.*/dotup-test && bash ./install.sh --config examples/minimal.yaml"

    echo "Test on ${os_name} PASSED!"
}

if [[ $# -gt 0 ]]; then
    run_test "$1"
else
    run_test "ubuntu"
    run_test "debian"
fi
