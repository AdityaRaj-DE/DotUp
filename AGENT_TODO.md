# Autonomous Agent Roadmap (AGENT_TODO.md)

## Project State
**Current Version**: V2 Branch Baseline
**Current Phase**: Phase 5 (Vendor Repositories)
**Current Task**: Completed Phase 5 by refactoring vendor installers across APT, DNF, and Pacman without introducing a bloated repository abstraction.

## Completed Work (V2 Phase 0, 1, 2, 3, 4, 5)
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
- [x] Abstract PPA and third-party `.repo` repository configuration for Docker, VS Code, Chrome, and Gcloud using direct OS-specific module branching.
- [x] Added `pkg_install_local` for direct `.deb` and `.rpm` deployments.
- [x] Added Fedora third-party compatibility for Docker, Gcloud, VS Code, Chrome.
- [x] Added Arch compatibility for Docker. 

## Incomplete Work (Next Phases)

### Phase 6: Shell Configuration & User Space
- [ ] Migrate `modules/system/zsh.sh` and shell plugin installations to a cleaner structure.
- [ ] Ensure non-root operations operate appropriately cross-platform.

## Known Problems
- Local Docker tests cannot be verified on the current host due to environment limitations (WSL missing `bash` or Docker Engine errors). Tests must rely on GitHub Actions CI.
- GUI applications (Chrome/VS Code/Antigravity) can only be partially validated in headless Docker matrices.

## Agent Rules
1. Read this `AGENT_TODO.md` at the start of every session.
2. Identify the first incomplete task in the current phase.
3. Implement, test, and document.
4. Update `AGENT_TODO.md` upon completion of tasks.
5. Proceed autonomously until the phase is complete or user input is blocked.

## Next Action
Wait for user input to verify CI/Docker integration testing or proceed to Phase 6.
