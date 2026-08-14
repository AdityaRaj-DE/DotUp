# Autonomous Agent Roadmap (AGENT_TODO.md)

## Project State
**Current Version**: V2 Branch Baseline
**Current Phase**: Phase 4 (Arch Support)
**Current Task**: Completed Phase 4 by implementing Pacman backend and routing Arch support.

## Completed Work (V2 Phase 0, 1, 2, 3, 4)
- [x] Confirmed V2 branch and preserved Git state.
- [x] Audited V1 baseline and version inconsistencies (updated `dotup` script to `v2.0.0-dev`).
- [x] Corrected `STATE_MODEL.md` (no persistent state file exists yet).
- [x] Created `docs/V2_ARCHITECTURE.md`, `docs/V2_IMPLEMENTATION_PLAN.md`, `docs/V2_MIGRATION_PLAN.md` and `docs/V2_VERIFICATION_LOG.md`.
- [x] Reconciled documentation and `AGENT_TODO.md` to reflect V2.
- [x] Introduce a `Platform Context` to reliably detect OS details.
- [x] Centralize OS detection logic in `lib/os.sh` (`platform_distribution`, `platform_architecture`, etc.).
- [x] Migrated independent OS/architecture detection in modules (e.g., `docker.sh`) to the new API.
- [x] Abstract package management behind a unified interface (`pkg_install`, `pkg_update`, `pkg_is_installed`, `pkg_is_available`).
- [x] Removed hardcoded `dpkg-query` and `apt-cache` calls from `modules/system/packages.sh`.
- [x] Implemented DNF backend for Fedora.
- [x] Implemented Pacman backend for Arch Linux.
- [x] Modified `Platform Context` support policy to allow APT, DNF, and Pacman installation.
- [x] Verified unit behavior via tests.
- [x] Documented limitations involving Fedora/Arch support across third-party vendor installers (Docker, Chrome, VS Code, gcloud).

## Incomplete Work (Next Phases)

### Phase 5: Vendor Package Repositories
- [ ] Abstract PPA and third-party `.deb` / `.rpm` repository configuration for Docker, VS Code, Chrome.
- [ ] Make all vendor installers fully cross-platform.

## Known Problems
- Local Docker tests cannot be verified on the current host due to environment limitations (WSL missing `bash` or Docker Engine errors). Tests must rely on GitHub Actions CI.
- GUI applications (Chrome/VS Code/Antigravity) can only be partially validated in headless Docker matrices.

## Definition of Done (V2 Phase 4)
- The Pacman backend is implemented in `lib/package-manager.sh`.
- The `Platform Context` successfully routes `Arch` to `pacman`.
- Generic package operations run native Pacman commands (`pacman -Sy`, `pacman -S --noconfirm --needed`, etc).
- APT and DNF regressions are ruled out by explicit branching.
- Pacman mocked unit tests pass.
- Limitations for third-party vendor tools are explicitly documented.

## Agent Rules
1. Read this `AGENT_TODO.md` at the start of every session.
2. Identify the first incomplete task in the current phase.
3. Implement, test, and document.
4. Update `AGENT_TODO.md` upon completion of tasks.
5. Proceed autonomously until the phase is complete or user input is blocked.

## Next Action
Begin **Phase 5: Vendor Package Repositories**.
