# V3 Module Contract and Compatibility Adapter

## Overview
As part of the V3 architecture transition, modules are moving away from being sourced Bash scripts into standalone executables. This ensures that modules are fully sandboxed, cannot pollute the orchestrator's environment, and can be developed in any language (though Bash remains the default).

## The Module Adapter (`lib/module_adapter.sh`)
Because migrating all existing V1 and V2 modules simultaneously is risky, DotUp uses a compatibility layer: the `execute_module_action` function.

### How it works
When the orchestrator needs to run a module (e.g., `execute_module_action "node" "install"`):
1. The adapter locates the module script.
2. It checks if the script is a native V3 module (executable, handles its own CLI arguments).
3. **If V3:** It executes the script as a subprocess: `./node.sh install`.
4. **If V1/V2 (Legacy):** It falls back to sourcing the script in the current shell and invoking the corresponding `<module>_<action>` function (e.g., `node_install`).

### V3 Module Requirements (Target)
When writing or migrating a module to V3, it MUST adhere to the following contract:
- Be marked as executable (`chmod +x`).
- Accept the action as the first CLI argument (`$1`).
- Supported actions: `detect`, `install`, `repair`, `configure`, `validate`.
- **Detection:** The `detect` action MUST output standard `key=value` strings (e.g., `status=INSTALLED`) to `stdout`.
- **Exit Codes:** Must exit `0` on success and `>0` on failure.
- **Environment:** Configuration is passed via environment variables (e.g., `DOTUP_MOD_VERSION`) rather than relying on global script state.

### Legacy Support
The orchestrator currently defaults to legacy mode for all existing modules. Once all modules are migrated to the V3 contract, the legacy fallback in the adapter will be removed.
