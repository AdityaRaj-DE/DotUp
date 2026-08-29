#!/usr/bin/env bash

# Global configuration variables populated by parse_config
CONFIG_SCHEMA_VERSION=""
CONFIG_PROFILE_NAME=""
CONFIG_PROFILE_DESCRIPTION=""
CONFIG_MODULES=()
# Dynamic variables will be created for options: CONFIG_MODULE_<name>_<option>

# Clears the current config state
config_reset() {
    CONFIG_SCHEMA_VERSION=""
    CONFIG_PROFILE_NAME=""
    CONFIG_PROFILE_DESCRIPTION=""
    CONFIG_MODULES=()
    # Unset any dynamic module options
    for var in ${!CONFIG_MODULE_*}; do
        if [[ "$var" != "CONFIG_MODULES" ]]; then
            unset "$var"
        fi
    done
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
    local current_module=""

    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip comments and empty lines
        if [[ -z "${line// /}" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi

        # Determine indentation level by counting leading spaces
        local indent
        indent=$(expr "$line" : '^\( *\)')
        local indent_len=${#indent}

        local key
        key="${line%%:*}"
        key="${key#"${key%%[![:space:]]*}"}" # trim leading space
        
        local val
        val="${line#*:}"
        val=$(trim_quotes "$val")

        if [[ $indent_len -eq 0 ]]; then
            # Root level
            in_profile=0
            in_modules=0
            current_module=""
            
            if [[ "$key" == "schema_version" ]]; then
                # shellcheck disable=SC2034
                CONFIG_SCHEMA_VERSION="$val"
            elif [[ "$key" == "profile" ]]; then
                in_profile=1
            elif [[ "$key" == "modules" ]]; then
                in_modules=1
            else
                fail_critical "Configuration parse error: Unknown root field '${key}'"
            fi
        elif [[ $indent_len -eq 2 ]]; then
            # Second level
            if [[ $in_profile -eq 1 ]]; then
                if [[ "$key" == "name" ]]; then
                    # shellcheck disable=SC2034
                    CONFIG_PROFILE_NAME="$val"
                elif [[ "$key" == "description" ]]; then
                    # shellcheck disable=SC2034
                    CONFIG_PROFILE_DESCRIPTION="$val"
                else
                    fail_critical "Configuration parse error: Unknown profile field '${key}'"
                fi
            elif [[ $in_modules -eq 1 ]]; then
                # Support: `module: {}` or `module:`
                current_module="$key"
                CONFIG_MODULES+=("$current_module")
            else
                fail_critical "Configuration parse error: Invalid 2-space indentation outside profile or modules."
            fi
        elif [[ $indent_len -eq 4 ]]; then
            # Third level (Module Options)
            if [[ $in_modules -eq 1 && -n "$current_module" ]]; then
                local safe_mod="${current_module//-/_}"
                export "CONFIG_MODULE_${safe_mod}_${key}=${val}"
            else
                fail_critical "Configuration parse error: Invalid 4-space indentation outside module definition."
            fi
        else
            fail_critical "Configuration parse error: Invalid indentation level (${indent_len} spaces)."
        fi
    done < "$file"
}
