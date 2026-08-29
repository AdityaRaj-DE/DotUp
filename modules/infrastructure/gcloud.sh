#!/usr/bin/env bash

gcloud_detect() {
    log_debug "Detecting Google Cloud CLI..."
    if command -v gcloud >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        echo "NOT_INSTALLED"
    fi
}

gcloud_detect_state() {
    if command -v gcloud >/dev/null 2>&1; then
        echo "status=INSTALLED"
    else
        echo "status=NOT_INSTALLED"
    fi
}

gcloud_install() {
    log_info "Installing Google Cloud CLI..."

    if [[ "$PKG_MANAGER" == "apt" ]]; then
        pkg_install apt-transport-https ca-certificates gnupg curl
        ${SUDO_CMD:-} curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | ${SUDO_CMD:-} gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg --yes
        echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | ${SUDO_CMD:-} tee /etc/apt/sources.list.d/google-cloud-sdk.list
        pkg_update
        pkg_install google-cloud-cli
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        echo -e "[google-cloud-cli]\nname=Google Cloud CLI\nbaseurl=https://packages.cloud.google.com/yum/repos/cloud-sdk-el9-x86_64\nenabled=1\ngpgcheck=1\nrepo_gpgcheck=0\ngpgkey=https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg" | ${SUDO_CMD:-} tee /etc/yum.repos.d/google-cloud-sdk.repo >/dev/null
        pkg_update
        pkg_install google-cloud-cli
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        fail_critical "Google Cloud CLI installation via script is unsupported on Arch. Use an AUR helper like yay to install google-cloud-cli."
    else
        fail_critical "Unsupported package manager for Google Cloud CLI installation."
    fi
}

gcloud_repair() {
    log_warn "Repairing Google Cloud CLI..."
    gcloud_install
}

gcloud_configure() {
    log_info "Configuring Google Cloud CLI..."
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q "@"; then
        log_warn "Authentication required for gcloud. Please run: gcloud auth login"
    fi
}

gcloud_validate() {
    log_debug "Validating Google Cloud CLI..."
    if ! command -v gcloud >/dev/null 2>&1; then
        fail_critical "Google Cloud CLI validation failed: gcloud command not found."
    fi
    log_success "Google Cloud CLI fully validated."
}

gcloud_validate_options() {
    local key="$1"
    local val="$2"
    return 1
}
