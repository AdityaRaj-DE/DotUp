#!/usr/bin/env bash

# Global configuration variables populated by parse_config
CONFIG_SCHEMA_VERSION=""
CONFIG_PROFILE_NAME=""
CONFIG_PROFILE_DESCRIPTION=""
CONFIG_SETUP_VERSION=""
# Dynamic variables will be created for options: CONFIG_MODULE_<name>_<option>

# Clears the current config state
config_reset() {
    CONFIG_SCHEMA_VERSION=""
    CONFIG_PROFILE_NAME=""
    CONFIG_PROFILE_DESCRIPTION=""
    CONFIG_SETUP_VERSION=""
    CONFIG_MODULES=()
    
    # Initialize the intermediate config file
    if [[ -z "${TMP_DIR:-}" ]]; then
        TMP_DIR=$(mktemp -d)
    fi
    export DOTUP_CONFIG_FILE="${TMP_DIR}/dotup-config.tmp"
    > "$DOTUP_CONFIG_FILE"
}

# Removes surrounding quotes and leading/trailing whitespace
trim_quotes() {
    local val="$1"
    # Remove leading spaces
    val="${val#"${val%%[![:space:]]*}"}"
    # Remove trailing spaces
    val="${val%"${val##*[![:space:]]}"}"
    # Remove surrounding double quotes
    val="${val#\"}"
    val="${val%\"}"
    echo "$val"
}

# Parses a dotup.yaml file and populates the global variables
parse_config() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        fail_critical "Configuration file not found: $file"
    fi

    config_reset

    local in_profile=0
    local in_modules=0
    local in_setup=0
    local in_components=0
    local in_options=0
    local current_module=""

    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip comments and empty lines
        if [[ -z "${line// /}" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi

        # Determine indentation level by counting leading spaces
        local indent
        indent=$(expr "$line" : '^\( *\)' || true)
        local indent_len=${#indent}

        local key
        key="${line%%:*}"
        key="${key#"${key%%[![:space:]]*}"}" # trim leading space

        local is_array_item=0
        if [[ "$key" == "-"* ]]; then
            key="${key#-[[:space:]]}"
            is_array_item=1
        fi

        local val
        val="${line#*:}"
        val=$(trim_quotes "$val")

        if [[ $indent_len -eq 0 ]]; then
            # Root level
            in_profile=0
            in_modules=0
            in_setup=0
            in_components=0
            in_options=0
            current_module=""

            if [[ "$key" == "schema_version" ]] || [[ "$key" == "schemaVersion" ]]; then
                # shellcheck disable=SC2034
                CONFIG_SCHEMA_VERSION="$val"
            elif [[ "$key" == "profile" ]]; then
                in_profile=1
            elif [[ "$key" == "modules" ]]; then
                in_modules=1
            elif [[ "$key" == "setup" ]]; then
                in_setup=1
            elif [[ "$key" == "components" ]]; then
                in_components=1
            else
                fail_critical "Configuration parse error: Unknown root field '${key}'"
            fi
        elif [[ $in_profile -eq 1 || $in_setup -eq 1 ]]; then
            if [[ "$key" == "name" || "$key" == "id" ]]; then
                # shellcheck disable=SC2034
                CONFIG_PROFILE_NAME="$val"
            elif [[ "$key" == "description" ]]; then
                # shellcheck disable=SC2034
                CONFIG_PROFILE_DESCRIPTION="$val"
            elif [[ "$key" == "version" ]]; then
                # shellcheck disable=SC2034
                CONFIG_SETUP_VERSION="$val"
            else
                fail_critical "Configuration parse error: Unknown profile/setup field '${key}'"
            fi
        elif [[ $in_modules -eq 1 ]]; then
            if [[ $indent_len -eq 2 ]]; then
                current_module="$key"
                CONFIG_MODULES+=("$current_module")
            elif [[ $indent_len -eq 4 ]]; then
                if [[ -n "$current_module" ]]; then
                    local safe_mod="${current_module//-/_}"
                    echo "${safe_mod}.${key}=${val}" >> "$DOTUP_CONFIG_FILE"
                else
                    fail_critical "Configuration parse error: Invalid 4-space indentation outside module definition."
                fi
            else
                fail_critical "Configuration parse error: Invalid indentation level (${indent_len} spaces) in modules."
            fi
        elif [[ $in_components -eq 1 ]]; then
            if [[ $is_array_item -eq 1 && "$key" == "id" ]]; then
                current_module="$val"
                CONFIG_MODULES+=("$current_module")
                in_options=0
            elif [[ "$key" == "options" ]]; then
                in_options=1
            elif [[ $in_options -eq 1 && -n "$current_module" ]]; then
                local safe_mod="${current_module//-/_}"
                echo "${safe_mod}.${key}=${val}" >> "$DOTUP_CONFIG_FILE"
            else
                fail_critical "Configuration parse error: Invalid field in components '${key}'"
            fi
        else
            fail_critical "Configuration parse error: Invalid indentation outside recognizable block."
        fi
    done <"$file"
}
