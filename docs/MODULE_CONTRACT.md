# Module Contract

Every installer module in DevBootstrap must adhere to a consistent contract to allow the orchestrator to manage them seamlessly.

## Lifecycle Methods

1. `detect()`: 
   - Checks the current installation state of the component.
   - Must return one of: `NOT_INSTALLED`, `INSTALLED`, `BROKEN`.
   - Cannot rely solely on binary existence (e.g., must test if docker is reachable).

2. `install()`: 
   - Performs the installation if the component is `NOT_INSTALLED`.
   - Should use defined fallback strategies if primary sources fail.

3. `repair()`: 
   - Attempts to fix the component if `detect()` returned `BROKEN`.

4. `configure()`: 
   - Sets up configurations idempotently. 
   - Must not endlessly append lines to configuration files.

5. `validate()`: 
   - Confirms that the component is fully functional.
