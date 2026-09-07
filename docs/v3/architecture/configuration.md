# V3 Configuration Boundary

## Overview
DotUp V3 decouples the configuration layer from the bash execution environment to guarantee memory safety and prevent shell injection attacks when parsing untrusted remote configurations.

## The Intermediate Format
Previously, `dotup.yaml` was parsed into dynamic Bash variables (e.g., `export CONFIG_MODULE_node_version=20`). This pattern is extremely dangerous.

In V3, the configuration parser instead generates a strict, line-oriented flat file at `$TMP_DIR/dotup-config.tmp` (defined by `$DOTUP_CONFIG_FILE`).

Format:
```text
module_name.option_key=value
node.version=20
```

## State Engine Consumption
The state engine reads directly from this flat file to build its internal `DESIRED_STATE_*` memory map, avoiding the global shell namespace pollution.

## Module Injection
When the Orchestrator executes a module via the Module Adapter (`lib/module_adapter.sh`), it extracts the options for that specific module from the intermediate file and injects them as explicit, standardized environment variables:

```bash
DOTUP_MOD_VERSION=20 ./node.sh install
```

This enforces the V3 Module Contract where modules read parameterized options via `DOTUP_MOD_<OPTION>` environment variables rather than expecting global orchestrator state.
