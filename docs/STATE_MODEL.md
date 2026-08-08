# State Model

DotUp tracks the state of installed components, but the state file is **NOT** the single source of truth. Actual system inspection is authoritative.

## Valid States
- `NOT_INSTALLED`: The component is missing from the system.
- `INSTALLED`: The component is present and fully functional.
- `BROKEN`: The component is present but validation failed or it is partially installed.

## State File Location
Located at `~/.devbootstrap/state.json`.

## Purpose
- Reporting (used by `doctor` and summary reports).
- Diagnostics and debugging.
- Logging historical installations.

**Critical Rule:** A stale state file must never cause the installer to incorrectly skip a component. Always verify using `detect()` and `validate()`.
