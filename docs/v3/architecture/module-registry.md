# V3 Module Registry

## Overview
DotUp V3 abstracts module path resolution through a central registry. Previously, the core orchestrator and the configuration validator blindly scanned the `modules/` directory to locate Bash scripts.

## The Registry API (`lib/registry.sh`)

The module registry exposes the following core functions:

### `registry_resolve_module <name>`
Resolves a module's short name (e.g., `git`) to its absolute file path.
- **Returns:** `0` if found, `1` if not found.
- **Output:** The absolute path to the module executable.

### `registry_list_all_modules`
Returns a space-separated array of all available module names. This replaces the hardcoded `ALL_MODULES` array previously used by the `doctor.sh` and `repair.sh` fallback paths.

## Future V3 Capabilities
While the current implementation maps directly to the local filesystem (scanning `modules/*/*.sh`), the registry API serves as the boundary for future capabilities.

When DotUp introduces remote setup sharing or a community module marketplace, `registry_resolve_module` will be extended to:
1. Check the local cache.
2. Fetch remote modules matching the requested canonical name or URL.
3. Validate signatures before returning the executable path to the orchestrator.
