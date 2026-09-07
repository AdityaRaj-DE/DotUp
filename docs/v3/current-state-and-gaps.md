# DotUp V3 Preparation: Current State and Gaps

## A. Current Architecture
DotUp currently operates as a bash-based CLI application with two distinct execution pathways coexisting:
- **Legacy V1**: Profile-driven (`.conf` files), imperative execution.
- **Declarative V2**: YAML-driven (`dotup.yaml`), state-reconciliation execution.

The core engine is comprised of a CLI entry point, a configuration parser written in bash/awk, a platform context API (`lib/os.sh`), a package manager abstraction (`lib/package-manager.sh`), a state engine (`lib/state_engine.sh`), and standalone module scripts.

## B. Execution Flows

### Installation
CLI (`dotup`) → `install.sh`
1. Validates prerequisites (network, OS, package manager, sudo).
2. Parses configuration (`--config` YAML).
3. **State Engine**:
   - `collect_desired_state()`: Populates memory with requested modules.
   - `collect_actual_state()`: Calls `<module>_detect_state` to populate current system state.
   - `compare_state()`: Computes difference actions (`SATISFIED`, `INSTALL_REQUIRED`, `VERSION_CHANGE_REQUIRED`, `REPAIR_REQUIRED`, `UNSUPPORTED`).
4. Iterates through modules mapped in the execution plan and calls `<module>_install`, `<module>_configure`, and `<module>_validate` as appropriate.

### Bootstrap
`bootstrap.sh`
1. Determines the latest stable release via GitHub API or uses environment variables.
2. Downloads the `.tar.gz` artifact and `SHA256SUMS` to a temporary directory.
3. Verifies checksum.
4. Extracts the tarball.
5. Executes the target script (`install.sh` by default) directly from the extracted temporary directory.

### Doctor
`doctor.sh`
1. Parses configuration and invokes the state engine.
2. Iterates over modules and interprets the `DIFF_STATE_*_action` (or V1 `_detect` state).
3. Reports status to stdout and exits with `1` if any problems exist.

### Repair
`repair.sh`
1. Similar to Doctor, but acts on the identified broken states.
2. If `REPAIR_REQUIRED` (or V1 `BROKEN`), invokes `<module>_repair`, `<module>_configure`, and `<module>_validate`.

### Update
`update.sh`
1. Downloads the latest `bootstrap.sh` directly from the main branch.
2. Executes the downloaded bootstrap script, which fetches and extracts the latest release, effectively updating the installation.

## C. Current Domain Model

- **Configuration**: V2 uses `dotup.yaml` (structural format defined in `config/schema/dotup.schema.yaml`). Parsed into bash variables.
- **Profiles**: V1 legacy profiles are plain text lists of module names in `config/profiles/*.conf`.
- **Modules**: Standalone bash scripts providing lifecycle hooks.
- **State Model**: Strictly in-memory and evaluated dynamically at runtime. There is no persistent state file tracking installation metadata or desired state across executions.

## D. Current Module Contract

Modules expose two parallel contracts (V1 and V2):
- **Detection**:
  - V1: `<module>_detect()` returning `INSTALLED`, `NOT_INSTALLED`, or `BROKEN`.
  - V2: `<module>_detect_state()` printing strict `key=value` strings (e.g., `status=INSTALLED`).
- **Configuration Validation**: `<module>_validate_options(key, value)`.
- **Actions**: `<module>_install()`, `<module>_repair()`, `<module>_configure()`, `<module>_validate()`.

**Contract Violations Detected**:
- Not all modules respect configuration options. For example, `node.sh` always installs the LTS version regardless of the `version` configuration passed in YAML.
- Unsupported platform handling is inconsistent. While Docker correctly returns `status=UNSUPPORTED`, `vscode.sh` critically fails the entire script during `_install()` on Arch Linux instead of gracefully returning `UNSUPPORTED` during detection.

## E. Current Limitations

### Single Component Setup
- **Can users install only one component?** Yes, by passing a V2 YAML configuration that only declares a single module.

### Custom Setup
- **Can users create a custom combination?** Yes, via the `modules:` mapping in a custom `dotup.yaml`.

### Multiple Setup Composition
- **Can profiles be combined?** No. `install.sh` accepts only a single `--config` argument. There is no mechanism to include or extend other profiles.

### Remote Setup
- **Can DotUp consume a remotely defined setup?** No. The configuration parser requires a local file path.

### Configuration vs. Implementation
- Modules frequently ignore passed configuration options (e.g., hardcoded versions).

## F. V3 Architectural Implications

The current bash-based architecture has reached its natural limits for safe complexity:
- **Bash Dynamic Variable State**: Populating `CONFIG_MODULE_name_option` and `ACTUAL_STATE_name_status` dynamically via string evaluation is brittle and limits nested configuration structures.
- **Testing Constraints**: Unit testing bash requires extensive mocking of core utilities, reducing confidence in edge cases.
- **Security**: Parsing remote, untrusted YAML securely in bash is extremely dangerous. Moving to remote setups (V3) requires a robust, memory-safe parser.
- **Concurrency**: Modules currently execute sequentially. Bash lacks safe concurrency primitives for parallel module execution without complex IPC.

## G. Migration Candidates

| Subsystem | Recommendation | Reason |
| :--- | :--- | :--- |
| Core Engine / CLI | **REPLACE** | Bash is insufficient for safe remote parsing, state persistence, and complex composition. Move to Go/Rust. |
| State Engine | **REPLACE** | Move from dynamic bash variables to a strongly typed, persistent backend/database model. |
| Modules (Install Logic) | **KEEP / REFACTOR** | The underlying shell commands for installation are largely correct but must be decoupled from the orchestrator into a strict runner contract. |
| Config Parser | **REPLACE** | Replace the bash `awk`-based parser with a standard YAML parsing library. |
| Platform/Package APIs | **REFACTOR** | Abstract to standard API contracts. |

## H. Open Architectural Questions for V3

1. **State Persistence**: Where will the persistent state be stored, and how do we handle divergence when users manually mutate the system?
2. **Setup Composition**: What is the schema for one profile extending another?
3. **Module Sandboxing**: If we allow community/remote modules, how do we sandbox arbitrary bash execution?
4. **Offline Support**: How will curl-to-bash remote installation handle airgapped environments?
5. **Idempotency Guarantees**: Will V3 enforce idempotency at the module output level, or trust the module script logic?