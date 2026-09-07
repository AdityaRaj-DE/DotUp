#!/usr/bin/env bash

# module_adapter.sh
# Provides a compatibility layer bridging legacy V1/V2 modules with the V3 execution model.

execute_module_action() {
    local module="$1"
    local action="$2"
    local safe_mod="${module//-/_}"

    local mod_path=""
    # Temporary fallback to find the module path until the registry is implemented (Plan 3)
    if declare -F "registry_resolve_module" >/dev/null; then
        mod_path=$(registry_resolve_module "$module")
    else
        for f in "${SCRIPT_DIR}/modules"/*/"${module}.sh"; do
            if [[ -f "$f" ]]; then
                mod_path="$f"
                break
            fi
        done
    fi

    if [[ -z "$mod_path" ]]; then
        fail_critical "Module adapter failed: Unknown module '${module}'."
    fi

    # Check if this is a V3 standalone module (executable and handles its own args)
    # For now, we assume V1/V2 legacy if it's just a .sh file we used to source.
    # In V3, modules will have +x bit and act as independent processes.
    if [[ -x "$mod_path" && "$(head -n 1 "$mod_path")" == *"bash"* && "$mod_path" == *"v3_modules"* ]]; then
        # Future V3 execution path
        "$mod_path" "$action"
        return $?
    fi

    # Legacy V1/V2 execution path
    # We source the module in the CURRENT shell to preserve legacy behavior (e.g. exporting PATH)
    # shellcheck source=/dev/null
    source "$mod_path"

    local fn_name="${safe_mod}_${action}"
    if declare -F "$fn_name" >/dev/null; then
        "$fn_name"
    elif [[ "$action" == "validate" || "$action" == "configure" ]]; then
        # Some modules might not implement validate or configure, which is okay in legacy
        log_debug "Module '${module}' does not implement optional action '${action}'."
    else
        fail_critical "Module '${module}' does not implement required action '${action}'."
    fi
}
