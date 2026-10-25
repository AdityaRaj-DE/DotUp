#!/usr/bin/env bash

# registry.sh
# Provides module discovery and resolution for DotUp.

if [[ -z "${ENGINE_DIR:-}" ]]; then
    ENGINE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
fi

# Resolves a module name to its absolute file path.
# Prints the path to stdout. Returns 0 if found, 1 if not found.
registry_resolve_module() {
    local module="$1"

    # In the future, this could consult a static JSON map or remote registry.
    # For now, it abstracts the filesystem structure.
    for f in "${ENGINE_DIR}/modules"/*/"${module}.sh"; do
        if [[ -f "$f" ]]; then
            echo "$f"
            return 0
        fi
    done

    return 1
}

# Lists all available modules by scanning the registry.
# Prints an array of module names separated by spaces.
registry_list_all_modules() {
    local modules=()
    # Find all .sh files in the modules directory, extract the basename without .sh
    while IFS= read -r -d '' file; do
        local filename
        filename=$(basename "$file")
        modules+=("${filename%.sh}")
    done < <(find "${ENGINE_DIR}/modules" -mindepth 2 -maxdepth 2 -name "*.sh" -print0 | sort -z)

    echo "${modules[@]}"
}
