#!/usr/bin/env bash

check_network() {
    log_debug "Checking network connectivity..."
    if command -v curl >/dev/null 2>&1; then
        if ! curl -s -f --connect-timeout 5 https://8.8.8.8 >/dev/null; then
            if ! curl -s -f --connect-timeout 5 https://1.1.1.1 >/dev/null; then
                fail_critical "No internet connection detected."
            fi
        fi
    elif command -v ping >/dev/null 2>&1; then
        if ! ping -c 1 -W 5 8.8.8.8 >/dev/null 2>&1; then
            fail_critical "No internet connection detected."
        fi
    else
        log_warn "Neither curl nor ping found. Proceeding without network check."
    fi
    log_debug "Network connectivity OK."
}
