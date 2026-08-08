#!/usr/bin/env bash
set -Eeuo pipefail

GITHUB_OWNER="${DOTUP_GITHUB_OWNER:-AdityaRaj-DE}"
GITHUB_REPO="${DOTUP_GITHUB_REPO:-DotUp}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

if ! command -v curl >/dev/null 2>&1 || ! command -v tar >/dev/null 2>&1 || ! command -v sha256sum >/dev/null 2>&1; then
    echo -e "${RED}Error: curl, tar, and sha256sum are required to bootstrap.${NC}"
    exit 1
fi

if [[ -z "${DOTUP_LOCAL_TAR:-}" ]]; then
    if [[ -n "${DOTUP_VERSION:-}" ]]; then
        VERSION="${DOTUP_VERSION}"
    else
        echo -e "${CYAN}Determining latest stable release...${NC}"
        LATEST_API_URL="https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest"
        LATEST_JSON=$(curl -fsSL "$LATEST_API_URL") || {
            echo -e "${RED}Failed to fetch latest release metadata.${NC}"
            exit 1
        }
        VERSION=$(echo "$LATEST_JSON" | grep -m1 '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || true)
        if [[ -z "$VERSION" ]]; then
            echo -e "${RED}Error: Could not determine latest release version.${NC}"
            exit 1
        fi
    fi
    echo -e "${CYAN}Resolved version: ${VERSION}${NC}"
else
    VERSION="test"
    echo -e "${CYAN}Using local test archive.${NC}"
fi

TAR_NAME="dotup-${VERSION}.tar.gz"

TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

TAR_FILE="${TMP_DIR}/${TAR_NAME}"
SHA_FILE="${TMP_DIR}/SHA256SUMS"

if [[ -n "${DOTUP_LOCAL_TAR:-}" && -n "${DOTUP_LOCAL_SHA:-}" ]]; then
    echo -e "${CYAN}Copying local artifacts...${NC}"
    cp "$DOTUP_LOCAL_TAR" "$TAR_FILE"
    cp "$DOTUP_LOCAL_SHA" "$SHA_FILE"
else
    BASE_RELEASE_URL="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${VERSION}"
    TAR_URL="${BASE_RELEASE_URL}/${TAR_NAME}"
    SHA_URL="${BASE_RELEASE_URL}/SHA256SUMS"

    echo -e "${CYAN}Downloading ${TAR_NAME}...${NC}"
    if ! curl -fsSL "$TAR_URL" -o "$TAR_FILE"; then
        echo -e "${RED}Error: Failed to download release artifact from ${TAR_URL}${NC}"
        exit 1
    fi

    echo -e "${CYAN}Downloading checksums...${NC}"
    if ! curl -fsSL "$SHA_URL" -o "$SHA_FILE"; then
        echo -e "${RED}Error: Failed to download checksum file.${NC}"
        exit 1
    fi
fi

echo -e "${CYAN}Verifying checksum...${NC}"
(
    cd "${TMP_DIR}"
    grep "${TAR_NAME}" "SHA256SUMS" | sha256sum -c -
) || {
    echo -e "${RED}Error: Checksum verification failed! Aborting.${NC}"
    exit 1
}

echo -e "${CYAN}Extracting dotup...${NC}"
if ! tar -xzf "$TAR_FILE" -C "${TMP_DIR}"; then
    echo -e "${RED}Error: Failed to extract release archive.${NC}"
    exit 1
fi

echo -e "${GREEN}Starting dotup installer...${NC}"
cd "${TMP_DIR}/dotup-${VERSION}"
chmod +x install.sh
exec ./install.sh "$@"
