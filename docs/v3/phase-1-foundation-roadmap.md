# Phase 1 Foundation Roadmap

This roadmap defines the incremental steps to prepare the DotUp V2 codebase for the V3 architecture (independent component execution, potential rewrite of the core engine, and remote setup fetching).

**Core Principle:** Every plan must be independently testable, reversible, and leave all existing CLI commands, configurations, and profiles fully operational.

---

## The V3 Canonical Module Contract

Before proceeding with migration, we must define what a V3 module is. Currently, modules are Bash scripts that are `source`d into the main orchestrator, polluting the global scope and forcing the orchestrator to dynamically call `<module>_detect` or `<module>_detect_state`.

**The Target V3 Contract:**
*   A module is a standalone executable (e.g., `git.sh`).
*   The orchestrator invokes it as a subprocess: `./git.sh <action>`.
*   Supported actions: `detect`, `install`, `repair`, `configure`, `validate`.
*   Configuration is passed via environment variables (e.g., `DOTUP_MOD_VERSION="20"`) or a serialized JSON payload, rather than dynamic `CONFIG_MODULE_node_version` globals.
*   **Idempotency:** Modules are expected to be idempotent natively.
*   **Detection Output:** `detect` must output standard `key=value` (or JSON) to stdout (e.g., `status=INSTALLED`, `version=1.0`). Valid statuses: `INSTALLED`, `NOT_INSTALLED`, `BROKEN`, `UNSUPPORTED`.
*   **Error Handling:** Modules exit `0` on success, `1` (or >0) on failure. Critical OS mismatches inside `install` should gracefully exit rather than calling a global `fail_critical` function that kills the orchestrator.

---

Integration tests currently mock almost everything (including `os-release` and `apt`). There are no tests verifying end-to-end `dotup` CLI behavior, `bootstrap.sh` extraction, or error exit codes.

### Objective
Ensure we have a safety net before refactoring core shell logic.

### Current Problem
Integration tests currently mock almost everything (including `os-release` and `apt`). There are no tests verifying end-to-end `dotup` CLI behavior, `bootstrap.sh` extraction, or error exit codes. (COMPLETED)

### Scope
Add integration tests for the CLI entrypoints (`install`, `doctor`, `repair`, `bootstrap`).

### Out of Scope
Refactoring any CLI or module code.

### Files/Areas Expected to Change
*   `tests/test_cli_integration.sh` (New)
*   `tests/test_bootstrap.sh` (New)

### Implementation Steps
1. Create a test script that runs `dotup doctor` with no config and asserts exit behavior.
2. Create a test script that runs `dotup install --plan --config examples/minimal.yaml` and asserts standard output.
3. Create a test script that mocks `curl` and `tar` to simulate `bootstrap.sh` downloading and extracting a dummy release, verifying it calls `install.sh`.
4. Add these to the CI/test runner scripts.

### Compatibility Requirements
All existing commands must remain untouched.

### Migration Strategy
N/A (additive).

### Tests to Add/Update
*   CLI flag validation.
*   Exit code assertions.

### Manual Verification
Run the new test scripts locally and ensure they pass against the unmodified `main` branch.

### Documentation Updates
Update `docs/TESTING.md` (if it exists) or README to document the new integration tests.

### Acceptance Criteria
The CI/test matrix covers the CLI entry points and the `bootstrap.sh` flow without relying solely on mocked unit functions.

### Rollback / Failure Boundary
Revert the added test files.

### Dependencies
None.

---

## Plan 2 — Introduce Compatibility Layer for Existing Modules (COMPLETED)

### Objective
Allow the orchestrator to call modules as standalone processes without rewriting all existing modules immediately.

### Current Problem
`install.sh` sources all requested modules dynamically and uses `declare -F` to find functions.

### Scope
Create a Module Adapter API in the core that wraps legacy modules into the V3 Executable Contract.

### Out of Scope
Migrating the modules themselves.

### Files/Areas Expected to Change
*   `lib/module_adapter.sh` (New)
*   `install.sh`

### Implementation Steps
1. Create `lib/module_adapter.sh`.
2. Implement a function `execute_module_action(module_name, action)` that:
   * Checks if the module is native V3 (has executable permissions and handles args).
   * If not, sources the module in a subshell, translates the configuration variables, and calls the legacy `<module>_<action>` function.
3. Refactor `execute_module_v2` in `install.sh` to use `execute_module_action` instead of sourcing and calling directly.

### Compatibility Requirements
V1 profiles and V2 YAML configurations must execute exactly as before.

### Migration Strategy
All modules temporarily run through the legacy branch of the adapter.

### Tests to Add/Update
Unit test `module_adapter.sh` with a dummy legacy module.

### Manual Verification
Run `dotup install --config examples/backend.yaml` and ensure Node/Docker install correctly via the adapter.

### Documentation Updates
Create `docs/v3/architecture/module-contract.md` explaining the adapter.

### Acceptance Criteria
The orchestrator no longer sources modules into the main execution environment (subshells are acceptable for the adapter).

### Rollback / Failure Boundary
Revert `install.sh` changes and delete `module_adapter.sh`.

### Dependencies
Plan 1.

---

## Plan 3 — Establish Module Registry

### Objective
Abstract module resolution so the core doesn't blindly search `modules/*/*.sh`.

### Current Problem
Modules are resolved by iterating over `modules/*/${mod}.sh`. The system has no central registry mapping module names to paths or metadata.

### Scope
Create a local registry lookup mechanism.

### Out of Scope
Remote marketplaces or dynamic module downloading.

### Files/Areas Expected to Change
*   `lib/registry.sh` (New)
*   `install.sh`, `doctor.sh`, `repair.sh`
*   `lib/config_validator.sh`

### Implementation Steps
1. Create `lib/registry.sh` with a function `registry_resolve_module(name)` that returns the absolute path to the module.
2. Replace directory scanning in `config_validator.sh` and `install.sh` with calls to the registry.
3. Refactor `doctor.sh` and `repair.sh` to use the registry to list available modules instead of the hardcoded `ALL_MODULES` array.

### Compatibility Requirements
`doctor.sh` without a config must still check all modules, but dynamically derived from the registry.

### Migration Strategy
The registry function can scan the `modules/` directory internally for now, abstracting the filesystem layout from the orchestrator.

### Tests to Add/Update
Unit tests for `registry_resolve_module`.

### Manual Verification
Run `dotup doctor` (no args) and verify all modules are still checked.

### Documentation Updates
Create `docs/v3/architecture/module-registry.md`.

### Acceptance Criteria
No code outside `lib/registry.sh` searches the `modules/` directory directly. `doctor.sh` dynamically discovers modules.

### Rollback / Failure Boundary
Revert to hardcoded paths and loops.

### Dependencies
Plan 2.

---

## Plan 4 — Separate State Detection from Planning

### Objective
Isolate the Side-Effect-Free detection phase from the orchestrator's state evaluation.

### Current Problem
`lib/state_engine.sh` mixes variable parsing, actual state collection, and difference logic. It relies on the sourced modules to exist in memory.

### Scope
Refactor `state_engine.sh` to use the Module Adapter for detection.

### Out of Scope
Removing the bash global state variables (`ACTUAL_STATE_*`) entirely (saved for Plan 5).

### Files/Areas Expected to Change
*   `lib/state_engine.sh`

### Implementation Steps
1. Update `collect_actual_state` in `state_engine.sh` to call `execute_module_action(mod, "detect")` via the adapter, parsing the standard stdout instead of calling `<module>_detect_state` directly.
2. Ensure it gracefully handles both V1 outputs (`INSTALLED`) and V2 outputs (`status=INSTALLED`).

### Compatibility Requirements
The output of `--plan` must not change.

### Migration Strategy
The adapter handles the difference between V1 and V2 outputs seamlessly, feeding normalized key-value pairs back to the state engine.

### Tests to Add/Update
Update `test_state.sh` to mock the adapter instead of the module functions.

### Manual Verification
Run `dotup install --plan --config examples/minimal.yaml`.

### Documentation Updates
Update `docs/v3/architecture/state-and-planning.md`.

### Acceptance Criteria
State detection uses the standalone adapter boundary exclusively.

### Rollback / Failure Boundary
Revert `state_engine.sh`.

### Dependencies
Plan 2, Plan 3.

---

## Plan 5 — Decouple Configuration from Bash Environment Variables

### Objective
Prepare for a memory-safe configuration parser (like a compiled binary) by shifting away from dynamic bash variables.

### Current Problem
`dotup.yaml` is parsed into globals like `CONFIG_MODULE_node_version`.

### Scope
Change how the orchestrator stores requested configuration.

### Out of Scope
Replacing the YAML parser implementation (the `awk` script stays for now).

### Files/Areas Expected to Change
*   `lib/config_parser.sh`
*   `lib/state_engine.sh`
*   `lib/module_adapter.sh`

### Implementation Steps
1. Modify `parse_config` to output a structured JSON-like text file (or a strict intermediate flat file format) in a secure temporary directory instead of exporting variables globally.
2. Refactor `collect_desired_state` to read this intermediate representation.
3. Pass configuration options directly to `execute_module_action` via explicit environment injection rather than relying on global scope inheritance.

### Compatibility Requirements
All existing YAML files must parse correctly and pass configurations to modules (e.g., node version).

### Migration Strategy
The awk parser writes to `/tmp/dotup-config.tmp`.

### Tests to Add/Update
Update `test_config.sh` to assert file output instead of variable states.

### Manual Verification
Run `dotup install --plan --config examples/backend.yaml`.

### Documentation Updates
Create `docs/v3/architecture/configuration.md`.

### Acceptance Criteria
No `export CONFIG_MODULE_*` calls exist in the codebase.

### Rollback / Failure Boundary
Revert config parser and state engine.

### Dependencies
Plan 4.

---

## Plan 6 — Enable Independent Component Execution

### Objective
Allow the orchestrator to operate on programmatic arrays of components rather than forcing everything through a file-based configuration.

### Current Problem
The orchestrator is tightly coupled to `PROFILE` and `CONFIG_FILE`. It cannot easily be told "just install git and node."

### Scope
Create a generic `run_setup(components_array)` function.

### Out of Scope
Adding new CLI flags for this feature (internal architecture only).

### Files/Areas Expected to Change
*   `install.sh`

### Implementation Steps
1. Extract the core execution loop (State Collection → Planning → Execution) from `main()` into a reusable `execute_components(modules_list)` function.
2. `install.sh` parses the config file, builds the array, and calls `execute_components`.
3. Ensure this works for both V1 and V2 pathways.

### Compatibility Requirements
The CLI contract remains unchanged.

### Migration Strategy
Internal refactor only.

### Tests to Add/Update
Unit test the new `execute_components` function directly.

### Manual Verification
Standard CLI tests.

### Documentation Updates
None.

### Acceptance Criteria
The core installation logic accepts a list of modules dynamically, completely decoupled from file reading.

### Rollback / Failure Boundary
Revert `install.sh`.

### Dependencies
Plan 5.

---

## Plan 7 — Migrate Modules Incrementally (Example: Git)

### Objective
Prove the V3 module contract by migrating a single module natively.

### Current Problem
All modules are V1/V2 legacy hybrids.

### Scope
Rewrite `git.sh` to the V3 Canonical Contract.

### Out of Scope
Migrating other modules.

### Files/Areas Expected to Change
*   `modules/development/git.sh`

### Implementation Steps
1. Update `git.sh` to parse `$1` (the action).
2. Remove the `git_` prefixes from function names inside the script, making them internal.
3. Ensure the script exits `0` on success and outputs strict `key=value` for detection.
4. Mark the script executable (`chmod +x`).

### Compatibility Requirements
The orchestrator must seamlessly run the new V3 `git.sh` while continuing to run V2 `node.sh` via the legacy adapter.

### Migration Strategy
The adapter natively supports executables; it will detect `git.sh` and invoke it directly.

### Tests to Add/Update
Integration test specifically targeting the updated Git module.

### Manual Verification
Run `dotup install --config examples/minimal.yaml` (which includes git).

### Documentation Updates
Update module authoring documentation to reflect the new contract.

### Acceptance Criteria
`git.sh` operates as a standalone script entirely decoupled from DotUp core functions.

### Rollback / Failure Boundary
Revert `git.sh`.

### Dependencies
Plan 2.

---

## Plan 8 — Phase 1 Architecture Review and Freeze

### Objective
Finalize Phase 1 and define "Done".

### Acceptance Criteria Checklist
- [ ] Existing CLI behavior remains compatible.
- [ ] Existing profiles continue working.
- [ ] Existing YAML configurations continue working.
- [ ] Doctor, Repair, Update, and Bootstrap continue working.
- [ ] V1/V2 contract confusion is isolated via the Module Adapter.
- [ ] There is one canonical module interface defined and proven (e.g., Git).
- [ ] Configuration no longer depends on dynamic Bash variable generation.
- [ ] Modules can be addressed independently by the core (`execute_components`).
- [ ] State detection and planning are cleanly separated via sub-processes.
- [ ] A local module registry exists.
- [ ] Real CLI integration tests exist and pass.
- [ ] Documentation accurately reflects Phase 1 state.
- [ ] No known critical regressions.
