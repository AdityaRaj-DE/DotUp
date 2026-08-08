#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
    echo "Usage: $0 <version>"
    exit 1
fi

DIST_DIR="${REPO_ROOT}/dist"
STAGE_DIR="${DIST_DIR}/dotup-${VERSION}"

echo "Building release $VERSION..."

# Clean previous build
rm -rf "${DIST_DIR}"
mkdir -p "${STAGE_DIR}"

# Copy required runtime files
cp "${REPO_ROOT}/install.sh" "${STAGE_DIR}/"
cp "${REPO_ROOT}/doctor.sh" "${STAGE_DIR}/"
cp "${REPO_ROOT}/repair.sh" "${STAGE_DIR}/"
cp "${REPO_ROOT}/bootstrap.sh" "${STAGE_DIR}/"
cp -r "${REPO_ROOT}/modules" "${STAGE_DIR}/"
cp -r "${REPO_ROOT}/lib" "${STAGE_DIR}/"
cp -r "${REPO_ROOT}/config" "${STAGE_DIR}/"
cp -r "${REPO_ROOT}/docs" "${STAGE_DIR}/"
cp "${REPO_ROOT}/README.md" "${STAGE_DIR}/"

# Build tarball
cd "${DIST_DIR}"
tar -czf "dotup-${VERSION}.tar.gz" "dotup-${VERSION}"

# Generate SHA256SUMS
sha256sum "dotup-${VERSION}.tar.gz" > SHA256SUMS

echo "Release artifacts generated in ${DIST_DIR}:"
ls -la "${DIST_DIR}"
