#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT="${SCRIPT_DIR}/../.."

echo "Building test image..."
docker build -t devbootstrap-test -f "${SCRIPT_DIR}/ubuntu.Dockerfile" "${REPO_ROOT}"

echo "Running install.sh in test container..."
docker run --rm devbootstrap-test
