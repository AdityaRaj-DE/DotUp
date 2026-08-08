#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT="${SCRIPT_DIR}/../.."

echo "Building test image..."
docker build -t devbootstrap-test -f "${SCRIPT_DIR}/ubuntu.Dockerfile" "${REPO_ROOT}"

echo "Running idempotency test..."
docker run --rm devbootstrap-test bash -c "./install.sh && echo '--- SECOND RUN ---' && ./install.sh"
