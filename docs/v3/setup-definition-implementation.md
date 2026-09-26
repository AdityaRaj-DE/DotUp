# V3 Setup Definition Implementation

## 1. Current Architecture

The existing DotUp architecture uses a Bash-based execution model. The CLI entrypoint (`dotup`) delegates commands to specific scripts like `install.sh`, `doctor.sh`, etc.

The configuration parsing logic (`lib/config_parser.sh`) handles V2 `dotup.yaml` formats and legacy V1 `.conf` profiles. It parses the YAML into a flat structure, populating global state variables:
- `CONFIG_SCHEMA_VERSION`
- `CONFIG_PROFILE_NAME`
- `CONFIG_PROFILE_DESCRIPTION`
- `CONFIG_MODULES` (Array of module names)
- Module options are written to an intermediate file (`$DOTUP_CONFIG_FILE`) in the format `<module>.<key>=<value>`.

This parsed configuration is then passed into the state engine (`lib/state_engine.sh`), planner (`lib/plan.sh` or within `install.sh`), and eventually executed via module adapters (`lib/module_adapter.sh`). Module registration and resolution are managed by `lib/registry.sh`.

## 2. Current Configuration Flow

```text
input (dotup.yaml or .conf)
 ↓
parser (lib/config_parser.sh)
 ↓
configuration representation (Global vars + $DOTUP_CONFIG_FILE)
 ↓
state engine (collect_desired_state, collect_actual_state)
 ↓
planner (compare_state, print_plan)
 ↓
executor (execute_components_v2 / execute_module)
```

## 3. Current Module Interface

Modules are Bash scripts that export specific functions:
- `<module_name>_installed` (Check if installed)
- `<module_name>_install` (Perform installation)
- `<module_name>_validate_options` (Optional, validates provided options)
Options are passed to the module implicitly by resolving the key-value pairs stored in `$DOTUP_CONFIG_FILE`. The `execute_module` function coordinates this using the `module_adapter.sh` and `state_engine.sh`.

## 4. Current Test Coverage

Existing tests (e.g., `tests/test_config.sh`, `tests/test_state.sh`, `tests/test_plan.sh`, `tests/test_cli_integration.sh`) cover:
- Valid and invalid V2 configuration parsing.
- Schema, module, and option validation.
- Security boundaries (e.g., preventing arbitrary eval in configuration).
- State collection and component execution.

## 5. Gaps Required for V3 Setup Definition

1. The current parser (`lib/config_parser.sh`) strictly enforces the `schema_version`, `profile`, and `modules` root keys. It does not support `schemaVersion`, `setup`, and `components` keys.
2. The current parser expects modules to be defined as mapping keys under `modules:`, whereas V3 defines `components` as a YAML sequence (list of objects with `- id:`).
3. The current structure expects module options directly under the module key, while V3 scopes them under `options:`.
4. There is no routing logic to identify a config as V3 vs. V2 and dispatch to the correct parser, nor a mechanism to convert the V3 structure into the expected canonical internal state (`CONFIG_MODULES` and `$DOTUP_CONFIG_FILE`).

---

# Implementation Roadmap

## V3-SETUP-01: Introduce V3 Setup Parser
**Objective**: Create a parser capable of reading the V3 YAML sequence-based format and mapping it to the internal configuration format.
**Files expected to change**: `lib/config_parser.sh`, `tests/test_config.sh`.
**Implementation approach**: Update `lib/config_parser.sh` (or extract to a dedicated parser) to detect `schemaVersion: "1"`. If detected, read `setup.id`, `setup.version`, and parse the `components` list. For each component, add its `id` to `CONFIG_MODULES` and translate its `options` into the `<id>.<key>=<val>` format in `$DOTUP_CONFIG_FILE`.
**Tests**: Add tests in `test_config.sh` for a valid V3 config, missing component ID, and correct option parsing.
**Acceptance criteria**: A valid V3 config successfully populates the existing Bash global variables and config file without errors.

## V3-SETUP-02: Update Configuration Validator
**Objective**: Ensure the existing validation steps (`validate_config_structure`) correctly assert the necessary fields based on whether a V2 or V3 config was loaded.

**Files expected to change**: `lib/config_validator.sh`, `tests/test_config.sh`.
**Implementation approach**: Modify structure validation to allow either `(schema_version, profile, modules)` or `(schemaVersion, setup, components)`. Semantic validation will largely remain untouched because the internal representation will be normalized.
**Tests**: Add tests for V3 validation failures (e.g., unsupported schema version "999", missing setup id).
**Acceptance criteria**: Valid V3 setups pass validation; invalid V3 setups fail clearly; V2 validations remain intact.

## V3-SETUP-03: Integrate V3 Configuration into Execution Paths
**Objective**: Allow `install.sh`, `doctor.sh`, and `repair.sh` to accept and process V3 setups seamlessly.
**Files expected to change**: `install.sh`, `doctor.sh`, `repair.sh`.
**Implementation approach**: Update these scripts to check for the presence of a V3 setup when `--config` is passed. Since V3 config parsing populates `CONFIG_MODULES` just like V2, the execution engines (`execute_components_v2`) should operate without modification.
**Tests**: Add end-to-end integration tests using a V3 configuration.
**Acceptance criteria**: The system can successfully run an install, doctor, and repair using a canonical V3 setup definition.

## V3-SETUP-04: Regression and Comprehensive E2E Verification
**Objective**: Ensure the new V3 implementation introduces zero regressions to V1 profiles and V2 configurations.
**Files expected to change**: `tests/*` (as needed).
**Implementation approach**: Run the full test suite. Expand E2E testing to explicitly verify backwards compatibility with V1 profiles and V2 dotup.yaml files alongside V3 setup definitions.
**Tests**: Execution of all existing test cases + specific cross-compatibility test scripts.
**Acceptance criteria**: All existing commands and behaviors remain fully functional with zero regressions.
## Step 1 — Introduce V3 Setup Parser

### Objective
Create a parser capable of reading the V3 YAML sequence-based format and mapping it to the internal configuration format.

### Current behavior
`parse_config` in `lib/config_parser.sh` tightly expects V2 structure (`schema_version`, `profile`, and `modules`). It errors out if it sees unknown root keys, such as `schemaVersion`, `setup`, and `components`.

### Required change
Modify `lib/config_parser.sh` to:
1. Detect whether it is parsing a V2 (`schema_version`) or V3 (`schemaVersion`) file.
2. In V3 mode, parse `schemaVersion: "1"`, `setup:` (`id`, `version`), and `components:`.
3. Handle the YAML sequence format `- id: <component-id>` and its optional `options:` block.
4. Normalize this to the existing internal state: `CONFIG_MODULES` array and `$DOTUP_CONFIG_FILE` (`<id>.<key>=<val>`).

### Files expected to change
- `lib/config_parser.sh`
- `tests/test_config.sh`

### Implementation approach
Refactor `parse_config` to track parsing state:
- Introduce tracking variables: `is_v3=0`, `in_setup=0`, `in_components=0`, `in_options=0`.
- At root level, allow `schemaVersion`, `setup`, `components`.
- If `setup`, process `id` and `version` at indent level 2 (mapping to `CONFIG_PROFILE_NAME` and a new `CONFIG_SETUP_VERSION` or `CONFIG_PROFILE_DESCRIPTION`).
- If `components`, process list items (`- id: ...`).
- If under `options:`, parse keys and write to `$DOTUP_CONFIG_FILE`.

### Tests
Add new YAML fixtures in `test_config.sh` for V3 valid configurations and verify the parser outputs the expected state.

### Acceptance criteria
A valid V3 config successfully populates the existing Bash global variables and config file without errors. V2 parsing remains entirely unaffected.

### Regression risks
Breaking V2 parsing if the line parser's state machine loses track. We will carefully scope V3-specific states.
