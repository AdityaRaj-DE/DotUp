# Autonomous Agent Roadmap (AGENT_TODO.md)

## Project State
**Current Version**: V2 Branch Baseline
**Current Phase**: Phase 0 (Foundation, Stabilization & V2 Baseline)
**Current Task**: Completed V1 audit, set regression baseline, and documented V2 architecture.

## Completed Work (V1)
- [x] Repository audit and status documentation
- [x] Core module framework, logging, and sudo handling
- [x] Implementation of System, Git, Terminal, Node, Python, Java, Docker, GCloud, VS Code, Chrome modules
- [x] Diagnostic and Repair scripts (`doctor.sh`, `repair.sh`)
- [x] Profile management system
- [x] Secure `bootstrap.sh` execution flow
- [x] Release packaging (`scripts/build-release.sh`)
- [x] GitHub Actions (`test.yml`, `release.yml`)
- [x] Local Docker test matrix
- [x] V1 Documentation

## Completed Work (V2 Phase 0)
- [x] Confirmed V2 branch and preserved Git state.
- [x] Audited V1 baseline and version inconsistencies (updated `dotup` script to `v2.0.0-dev`).
- [x] Corrected `STATE_MODEL.md` (no persistent state file exists yet).
- [x] Created `docs/V2_ARCHITECTURE.md`, `docs/V2_IMPLEMENTATION_PLAN.md`, and `docs/V2_MIGRATION_PLAN.md`.
- [x] Reconciled documentation and `AGENT_TODO.md` to reflect V2.

## Incomplete Work (Next Phases)
### Phase 1: Platform Model / Platform Context
- [ ] Introduce a `Platform Context` to reliably detect OS details.
- [ ] Centralize OS detection logic in `lib/os.sh`.

### Phase 2: Package Abstraction
- [ ] Abstract package management behind a unified interface (`pkg_install`, `pkg_remove`).
- [ ] Remove hardcoded `apt-get` calls from modules.

### Phase 3: Fedora Support
- [ ] Implement DNF backend.
- [ ] Verify module compatibility and add Fedora Docker tests.

## Known Problems
- Local Docker tests cannot be verified on the current host due to environment limitations (WSL missing `bash` or Docker Engine errors). Tests must rely on GitHub Actions CI.
- GUI applications (Chrome/VS Code/Antigravity) can only be partially validated in headless Docker matrices.

## Definition of Done (V2 Baseline)
- The V2 branch is clean, documented, and ready for platform abstraction work.
- Existing V1 behavior remains unchanged.
- The roadmap clearly dictates the next step: Platform Model.

## Agent Rules
1. Read this `AGENT_TODO.md` at the start of every session.
2. Identify the first incomplete task in the current phase.
3. Implement, test, and document.
4. Update `AGENT_TODO.md` upon completion of tasks.
5. Proceed autonomously until the phase is complete or user input is blocked.

## Next Action
Begin **Phase 1: Platform Model**. Update `lib/os.sh` to expose detailed platform context (OS family, version) without modifying the module contract yet.
