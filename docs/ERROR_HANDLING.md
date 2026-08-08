# Error Handling and Fallbacks

## Fallback Design
Fallbacks must be explicit, deterministic, and safe.

Example:
- Strategy 1: Official repository
- Strategy 2: Official installation mechanism (script/binary)
- Strategy 3: Supported distribution package (apt)

Each strategy must:
1. Have a valid technical reason for existing.
2. Produce clear logs.
3. Stop when unsafe.
4. Never silently downgrade to an unknown or untrusted source.

## Error Reporting
- Critical failures (e.g., broken package manager, no internet) should halt execution of dependent modules.
- Optional modules failing should not stop the entire bootstrap process.
- All errors must be logged in `~/.devbootstrap/logs/` with sufficient technical detail for debugging.
- The terminal output should remain clean, displaying clear warning or failure icons without dumping massive tracebacks to the user, unless requested.
