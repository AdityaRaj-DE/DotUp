# State Model

DotUp tracks the state of installed components, but there is currently **NO** persistent state file or desired state engine. Actual system inspection is authoritative and state is evaluated dynamically at runtime.

## Valid States (Runtime Only)
- `NOT_INSTALLED`: The component is missing from the system.
- `INSTALLED`: The component is present and fully functional.
- `BROKEN`: The component is present but validation failed or it is partially installed.

## State File Location
**Not Implemented.** All state detection is performed dynamically by module `_detect()` functions. V2 plans to introduce a declarative state engine in later phases.

## Purpose
- Reporting (used by `doctor` and summary reports).
- Diagnostics and debugging.
- Conditional installation/repair flow.

**Critical Rule:** Always verify system state using `detect()` and `validate()`. Do not rely on external caching until the formal state engine is implemented in a future phase.
