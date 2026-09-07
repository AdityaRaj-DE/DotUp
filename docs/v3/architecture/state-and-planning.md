# V3 State and Planning

## Overview
The V3 Architecture enforces a strict separation between state evaluation (side-effect free) and planning/execution. The state engine operates independently of module implementation details.

## State Detection
The state engine is responsible for collecting the Actual State of the machine. It achieves this by invoking the Module Adapter (`execute_module_action "<module>" "detect"`).

Because modules are isolated via the adapter:
1. The state engine does not source or evaluate arbitrary module Bash code into its own environment.
2. The adapter normalizes both V1 outputs (`INSTALLED`) and V2 outputs (`status=INSTALLED`) into strict `key=value` records.
3. The state engine safely parses these `key=value` outputs using string manipulation, completely avoiding dangerous shell `eval`s.

## Planning
The `compare_state` logic analyzes the difference between the Desired State (populated from configuration) and the Actual State (from the adapter). It generates a Diff Action (e.g., `INSTALL_REQUIRED`, `VERSION_CHANGE_REQUIRED`).

The generated plan is then executed by the Orchestrator routing actions back through the Module Adapter, completely decoupling the engine's planning logic from the execution mechanics of individual tools.

## Parameterized Execution
The State Engine operates purely on programmatic array inputs (e.g., `collect_actual_state "git" "node"`). It no longer relies on the globally parsed `$CONFIG_MODULES` array. This parameterization is the final component enabling DotUp to accept arbitrary `Setup Definition` objects or remote component lists in Phase 2 without writing temporary YAML configurations to disk.
