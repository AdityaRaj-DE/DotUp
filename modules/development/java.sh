#!/usr/bin/env bash

java_detect() {
    log_debug "Detecting Java JDK..."
    if command -v java >/dev/null 2>&1 && command -v javac >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        echo "NOT_INSTALLED"
    fi
}

java_detect_state() {
    if command -v java >/dev/null 2>&1 && command -v javac >/dev/null 2>&1; then
        echo "status=INSTALLED"
        local v
        v=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
        if [[ -n "$v" ]]; then
            echo "version=$v"
        fi
    else
        echo "status=NOT_INSTALLED"
    fi
}

java_install() {
    log_info "Installing Default JDK..."
    pkg_install default-jdk
}

java_repair() {
    log_warn "Repairing Java JDK..."
    java_install
}

java_configure() {
    log_debug "Configuring Java..."
}

java_validate() {
    log_debug "Validating Java..."
    if ! command -v java >/dev/null 2>&1 || ! command -v javac >/dev/null 2>&1; then
        fail_critical "Java validation failed: java or javac not found."
    fi
    log_success "Java fully validated."
}

java_validate_options() {
    local key="$1"
    # shellcheck disable=SC2034
    local val="$2"
    if [[ "$key" == "version" ]]; then
        return 0
    fi
    return 1
}
