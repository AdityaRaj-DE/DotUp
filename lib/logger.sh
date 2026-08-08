#!/usr/bin/env bash

# Setup logging
DEVBOOTSTRAP_DIR="${HOME}/.devbootstrap"
LOG_DIR="${DEVBOOTSTRAP_DIR}/logs"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
LOG_FILE="${LOG_DIR}/${TIMESTAMP}.log"
LATEST_LOG="${LOG_DIR}/latest.log"

setup_logging() {
    mkdir -p "${LOG_DIR}"
    touch "${LOG_FILE}"
    ln -sf "${LOG_FILE}" "${LATEST_LOG}"
}

log_info() {
    local msg="$1"
    echo -e "${BLUE}ℹ${NC} ${msg}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO] ${msg}" >> "${LOG_FILE}"
}

log_success() {
    local msg="$1"
    echo -e "${GREEN}✓${NC} ${msg}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [SUCCESS] ${msg}" >> "${LOG_FILE}"
}

log_warn() {
    local msg="$1"
    echo -e "${YELLOW}⚠${NC} ${msg}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN] ${msg}" >> "${LOG_FILE}"
}

log_error() {
    local msg="$1"
    echo -e "${RED}✗${NC} ${msg}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] ${msg}" >> "${LOG_FILE}"
}

log_debug() {
    local msg="$1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [DEBUG] ${msg}" >> "${LOG_FILE}"
}
