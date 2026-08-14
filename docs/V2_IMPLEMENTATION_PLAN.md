# DotUp V2 Implementation Plan

## Phase 0 — Foundation / Baseline
- **Objective:** Audit the V1 baseline, correct documentation, and ensure a clean V2 foundation without modifying behavior.
- **Completion Criteria:** Documentation reconciled, incorrect version markers removed, test regression suite verified.

## Phase 1 — Platform Model (Complete)
- **Objective:** Introduce a `Platform Context` to reliably detect and expose OS details (OS family, version, architecture).
- **Completion Criteria:** A central `lib/os.sh` abstraction providing clear facts for modules to branch on.

## Phase 2 — Package Abstraction (Complete)
- **Objective:** Abstract package management behind a unified interface (`pkg_install`, `pkg_remove`, `pkg_is_installed`).
- **Completion Criteria:** No module calls generic `apt-get` directly. Generic operations route through API.

## Phase 3 — Fedora Support (Complete)
- **Objective:** Implement the DNF backend for the package abstraction and verify module compatibility.
- **Completion Criteria:** DNF backend implemented. Fedora can execute basic `system` packages, though vendor-specific modules remain unsupported for Fedora. on Fedora Docker container.

## Phase 4 — Arch Support
- **Objective:** Implement the Pacman backend for the package abstraction.
- **Completion Criteria:** Tests pass on Arch Docker container.

## Phase 5 — Installation Capability Model
- **Objective:** Standardize how third-party tools (tarballs, binaries, AppImages) are installed regardless of platform.
- **Completion Criteria:** Abstraction for downloading and verifying binaries.

## Phase 6 — Configuration
- **Objective:** Move to a structured configuration model (e.g. `dotup.yaml`) with robust parsing.
- **Completion Criteria:** Profiles and module variables are parsed dynamically.

## Phase 7 — Desired / Actual State
- **Objective:** Implement the declarative state engine that `STATE_MODEL.md` originally intended.
- **Completion Criteria:** A real `state.json` tracks what was actually installed.

## Phase 8 — Plan / Apply
- **Objective:** Separate detection from modification, allowing users to see what *would* happen.
- **Completion Criteria:** `dotup plan` outputs a diff-like view.

## Phase 9 — Export / Import
- **Objective:** Allow users to export their current environment to a `dotup.yaml` and import it elsewhere.
- **Completion Criteria:** `dotup export` successfully reconstructs a profile.

## Phase 10 — Version Constraints
- **Objective:** Support pinning or resolving specific versions of software instead of just "latest".

## Phase 11 — Recovery / Rollback
- **Objective:** Enable rolling back failed installations or entire profiles.

## Phase 12 — Supply Chain Security
- **Objective:** Implement cryptographic signature verification beyond simple SHA checksums.
