# Autonomous Agent Roadmap (AGENT_TODO.md)

## Project State
**Current Version**: V2 Branch Baseline
**Current Phase**: Phase 1 (Platform Model & Platform Context)
**Current Task**: Completed Phase 1 by implementing centralized Platform Context.

## Completed Work (V2 Phase 0 & 1)
- [x] Confirmed V2 branch and preserved Git state.
- [x] Audited V1 baseline and version inconsistencies (updated `dotup` script to `v2.0.0-dev`).
- [x] Corrected `STATE_MODEL.md` (no persistent state file exists yet).
- [x] Created `docs/V2_ARCHITECTURE.md`, `docs/V2_IMPLEMENTATION_PLAN.md`, and `docs/V2_MIGRATION_PLAN.md`.
- [x] Reconciled documentation and `AGENT_TODO.md` to reflect V2.
- [x] Introduce a `Platform Context` to reliably detect OS details.
- [x] Centralize OS detection logic in `lib/os.sh` (`platform_distribution`, `platform_architecture`, etc.).
- [x] Migrated independent OS/architecture detection in modules (e.g., `docker.sh`) to the new API.

## Incomplete Work (Next Phases)
### Phase 2: Package Abstraction
- [ ] Abstract package management behind a unified interface (`pkg_install`, `pkg_remove`).
- [ ] Remove hardcoded `apt-get` calls from modules.

### Phase 3: Fedora Support
- [ ] Implement DNF backend.
- [ ] Verify module compatibility and add Fedora Docker tests.

## Known Problems
- Local Docker tests cannot be verified on the current host due to environment limitations (WSL missing `bash` or Docker Engine errors). Tests must rely on GitHub Actions CI.
- GUI applications (Chrome/VS Code/Antigravity) can only be partially validated in headless Docker matrices.

## Definition of Done (V2 Phase 1)
- The Platform Context is implemented in `lib/os.sh`.
- Modules use the API instead of parsing `/etc/os-release` independently.
- The roadmap clearly dictates the next step: Package Abstraction.

## Agent Rules
1. Read this `AGENT_TODO.md` at the start of every session.
2. Identify the first incomplete task in the current phase.
3. Implement, test, and document.
4. Update `AGENT_TODO.md` upon completion of tasks.
5. Proceed autonomously until the phase is complete or user input is blocked.

## Next Action
Begin **Phase 2: Package Abstraction**. Implement generic functions (`pkg_install`, `pkg_remove`) and route them to `apt` internally, while migrating modules to use the abstraction.
