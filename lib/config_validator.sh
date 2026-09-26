#!/usr/bin/env bash

# Validates the structural integrity of the parsed configuration
validate_config_structure() {
    log_debug "Validating configuration structure..."

    if [[ -z "$CONFIG_SCHEMA_VERSION" ]]; then
        fail_critical "Validation failed: 'schema_version' is missing."
    fi

    if [[ "$CONFIG_SCHEMA_VERSION" != "1" ]]; then
        fail_critical "Validation failed: Unsupported schema_version '${CONFIG_SCHEMA_VERSION}'. Expected '1'."
    fi

    if [[ ${CONFIG_IS_V3:-0} -eq 1 ]]; then
        if [[ -z "$CONFIG_PROFILE_NAME" ]]; then
            fail_critical "Validation failed: 'setup.id' is missing."
        fi
        if [[ -z "$CONFIG_SETUP_VERSION" ]]; then
            fail_critical "Validation failed: 'setup.version' is missing."
        fi
    else
        if [[ -z "$CONFIG_PROFILE_NAME" ]]; then
            fail_critical "Validation failed: 'profile.name' is missing."
        fi
    fi

    if [[ ${#CONFIG_MODULES[@]} -eq 0 ]]; then
        fail_critical "Validation failed: 'modules' is empty or missing."
    fi

    log_debug "Structure validation passed."
}

# Validates the semantic meaning (e.g. do the modules exist and do they support options?)
validate_config_semantics() {
    log_debug "Validating configuration semantics..."
    source "${SCRIPT_DIR}/lib/registry.sh"

    for mod in "${CONFIG_MODULES[@]}"; do
        local mod_path
        if ! mod_path=$(registry_resolve_module "$mod"); then
            fail_critical "Validation failed: Unknown module '${mod}'."
        fi

        # Source the module to load its validation function
        # shellcheck source=/dev/null
        source "$mod_path"

        # Check all provided options for this module
        local safe_mod="${mod//-/_}"

        if [[ -f "${DOTUP_CONFIG_FILE:-}" ]]; then
            while IFS="=" read -r key val || [[ -n "$key" ]]; do
                [[ -z "$key" ]] && continue
                if [[ "$key" == "${safe_mod}."* ]]; then
                    local opt_key="${key#*.}"
                    local opt_val="$val"

                    local mod_validate_fn="${safe_mod}_validate_options"

                    if declare -F "$mod_validate_fn" >/dev/null; then
                        if ! "$mod_validate_fn" "$opt_key" "$opt_val"; then
                            fail_critical "Validation failed: Invalid option '${opt_key}'='${opt_val}' for module '${mod}'."
                        fi
                    else
                        fail_critical "Validation failed: Module '${mod}' does not support option '${opt_key}'."
                    fi
                fi
            done < "$DOTUP_CONFIG_FILE"
        fi
    done

    log_debug "Semantic validation passed."
}

validate_config() {
    validate_config_structure
    validate_config_semantics
    log_success "Configuration '$CONFIG_PROFILE_NAME' (v$CONFIG_SCHEMA_VERSION) is valid."
}
