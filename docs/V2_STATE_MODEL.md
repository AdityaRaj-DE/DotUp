# V2 State Model

## 1. Overview
The V2 Architecture separates the declarative **Configuration Model** (`dotup.yaml`) from the actual installation execution through an intermediate **State Engine**.

The State Engine is read-only and side-effect free. It computes:
1. **Desired State**: What the user requested.
2. **Actual State**: What is currently installed on the machine.
3. **Difference (Plan)**: What actions are required to reconcile the two.

## 2. State Detection Contract
Modules must implement a `<module>_detect_state` function.
This function MUST:
- Return results in a simple `key=value` text format on standard output.
- Perform NO side effects (no network calls, no installation, no config file modification).
- Identify exactly whether the tool is installed and its version (if accessible).

Example Output from `node_detect_state`:
```text
status=INSTALLED
version=20.11.0
```

## 3. Allowed Statuses
- `NOT_INSTALLED`: The tool is missing entirely.
- `INSTALLED`: The tool is present and functional.
- `BROKEN`: The tool is partially present or corrupted.
- `UNSUPPORTED`: The module cannot run on the current platform/OS.
- `UNKNOWN`: The state cannot be determined safely.

## 4. Difference Actions (Plan)
The State Engine compares the desired and actual state to produce one of the following actions for a module:
- `SATISFIED`: No action needed.
- `INSTALL_REQUIRED`: Actual is `NOT_INSTALLED`.
- `VERSION_CHANGE_REQUIRED`: Actual is `INSTALLED`, but versions mismatch.
- `REPAIR_REQUIRED`: Actual is `BROKEN`.
- `UNSUPPORTED`: Module cannot be installed here.
- `UNKNOWN`: Cannot compute difference safely.

## 5. Security & Representation
The state is communicated between modules and the state engine via simple unquoted `key=value` strings over stdout. The engine parses these using bash string manipulation (e.g. `key=${line%%=*}; val=${line#*=}`) to prevent arbitrary shell code execution (`eval` is forbidden).
