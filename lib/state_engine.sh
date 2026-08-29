#!/usr/bin/env bash

# Global state dictionaries
# populated by state engine functions
# Format: DESIRED_STATE_<safe_module>_<key>="value"
# Format: ACTUAL_STATE_<safe_module>_<key>="value"
# Format: DIFF_STATE_<safe_module>_action="ACTION"

state_engine_reset() {
    for var in ${!DESIRED_STATE_*}; do unset "$var"; done
    for var in ${!ACTUAL_STATE_*}; do unset "$var"; done
    for var in ${!DIFF_STATE_*}; do unset "$var"; done
}

collect_desired_state() {
    log_debug "Collecting desired state from configuration..."
    
    # Iterate over parsed configuration
    for mod in "${CONFIG_MODULES[@]}"; do
        local safe_mod="${mod//-/_}"
        
        # Every module explicitly listed in the config is desired to be INSTALLED
        export "DESIRED_STATE_${safe_mod}_status=INSTALLED"
        
        # Copy configuration options (like version) into desired state
        local prefix="CONFIG_MODULE_${safe_mod}_"
        for var in ${!CONFIG_MODULE_*}; do
            if [[ "$var" == "$prefix"* ]]; then
                local opt_key="${var#"$prefix"}"
                local opt_val="${!var}"
                export "DESIRED_STATE_${safe_mod}_${opt_key}=${opt_val}"
            fi
        done
    done
}

collect_actual_state() {
    log_debug "Collecting actual state from machine..."
    
    for mod in "${CONFIG_MODULES[@]}"; do
        local safe_mod="${mod//-/_}"
        local detect_fn="${safe_mod}_detect_state"
        
        # Fallback to NOT_INSTALLED if the module doesn't implement detect_state yet
        if ! declare -F "$detect_fn" >/dev/null; then
            export "ACTUAL_STATE_${safe_mod}_status=UNKNOWN"
            continue
        fi
        
        # Read the strict key=value format safely
        while IFS="=" read -r key val || [[ -n "$key" ]]; do
            # Skip empty lines
            [[ -z "$key" ]] && continue
            
            # Trim whitespace (safe, no shell evaluation)
            key="${key#"${key%%[![:space:]]*}"}"
            key="${key%"${key##*[![:space:]]}"}"
            val="${val#"${val%%[![:space:]]*}"}"
            val="${val%"${val##*[![:space:]]}"}"
            
            # Only export if key is valid identifier format
            if [[ "$key" =~ ^[a-zA-Z0-9_]+$ ]]; then
                export "ACTUAL_STATE_${safe_mod}_${key}=${val}"
            fi
        done < <("$detect_fn")
        
        # Ensure status is at least populated if module output was empty
        local current_status_var="ACTUAL_STATE_${safe_mod}_status"
        if [[ -z "${!current_status_var:-}" ]]; then
            export "ACTUAL_STATE_${safe_mod}_status=UNKNOWN"
        fi
    done
}

compare_state() {
    log_debug "Comparing desired and actual state..."
    
    for mod in "${CONFIG_MODULES[@]}"; do
        local safe_mod="${mod//-/_}"
        
        local desired_status_var="DESIRED_STATE_${safe_mod}_status"
        local actual_status_var="ACTUAL_STATE_${safe_mod}_status"
        
        local desired_status="${!desired_status_var:-}"
        local actual_status="${!actual_status_var:-}"
        
        local action="UNKNOWN"
        
        if [[ "$actual_status" == "UNSUPPORTED" ]]; then
            action="UNSUPPORTED"
        elif [[ "$actual_status" == "UNKNOWN" ]]; then
            # If a module is entirely missing state detection logic (Phase 7A transition),
            # we consider it UNKNOWN.
            action="UNKNOWN"
        elif [[ "$actual_status" == "BROKEN" ]]; then
            action="REPAIR_REQUIRED"
        elif [[ "$desired_status" == "INSTALLED" && "$actual_status" == "NOT_INSTALLED" ]]; then
            action="INSTALL_REQUIRED"
        elif [[ "$desired_status" == "INSTALLED" && "$actual_status" == "INSTALLED" ]]; then
            # Check version match if desired version is specified
            local desired_version_var="DESIRED_STATE_${safe_mod}_version"
            local actual_version_var="ACTUAL_STATE_${safe_mod}_version"
            
            local desired_version="${!desired_version_var:-}"
            local actual_version="${!actual_version_var:-}"
            
            if [[ -n "$desired_version" && "$actual_version" != "$desired_version" && "$actual_version" != "$desired_version."* && "$actual_version" != "$desired_version-"* ]]; then
                action="VERSION_CHANGE_REQUIRED"
            else
                action="SATISFIED"
            fi
        fi
        
        export "DIFF_STATE_${safe_mod}_action=${action}"
    done
}
