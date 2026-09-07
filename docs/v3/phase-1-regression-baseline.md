# Phase 1 Regression Baseline

This document defines the existing V2 behavior that MUST remain unbroken during Phase 1 refactoring toward DotUp V3. Any implementation plan must ensure tests and manual verification preserve these behaviors exactly.

## 1. CLI Commands

### `dotup install`
*   **Args:** `--config <path>`, `--profile <name>`, `--plan`
*   **Behavior:**
    *   Defaults to `--profile full` if no arguments provided.
    *   `--plan` only functions alongside `--config`; it prints a plan (e.g. `[INSTALL] node`) without executing.
    *   Creates a global wrapper at `~/.local/bin/dotup`.

### `dotup doctor`
*   **Args:** `--config <path>`, `--profile <name>`
*   **Behavior:**
    *   If `--config` is passed, evaluates state for the configured modules.
    *   If no config is passed, it ignores `--profile` (even if supplied) and hardcodes a check against ALL known modules (`system`, `git`, `zsh`, `node`, `python`, `java`, `docker`, `gcloud`, `chrome`, `vscode`, `antigravity`).
    *   Exits `0` if all healthy, `1` if any problems detected.

### `dotup repair`
*   **Args:** `--config <path>`, `--profile <name>`
*   **Behavior:**
    *   Same profile-ignoring hardcoded behavior as `doctor` in legacy mode.
    *   Executes `_repair`, `_configure`, `_validate` on any module identified as broken/needing repair.

### `dotup update`
*   **Behavior:** Downloads `bootstrap.sh` from GitHub `main` branch and executes it to install the latest stable version.

### `bootstrap.sh`
*   **Behavior:** Downloads a tarball release from GitHub, extracts it, and executes a target script (defaults to `install.sh`).
*   **Environment Variables Supported:** `DOTUP_GITHUB_OWNER`, `DOTUP_GITHUB_REPO`, `DOTUP_VERSION`, `DOTUP_LOCAL_TAR`, `DOTUP_LOCAL_SHA`, `DOTUP_SCRIPT`.
*   **Argument Forwarding:** Forwards all CLI arguments directly to the target script.

## 2. Configuration & Profiles

### Legacy V1 Profiles
*   Located in `config/profiles/*.conf`.
*   Newline-delimited module names, ignoring `#` comments and empty lines.

### Declarative V2 Configuration
*   Format: YAML (`dotup.yaml`).
*   Required fields: `schema_version: 1`, `profile.name`, `modules`.
*   `modules` section is a dictionary (e.g., `git: {}`, `node: { version: "20" }`).

## 3. Module Behavior Constraints

*   Modules may implement `_detect` (V1) or `_detect_state` (V2) or both.
*   Modules may ignore passed configurations (e.g., `node.sh` installs LTS regardless of config; `vscode.sh` does not support options). This limitation is currently *valid* behavior and breaking it (e.g., forcing a strict version fail) without explicit design is a regression.
*   Some modules (`docker.sh`) cleanly return `status=UNSUPPORTED` on invalid OSes. Others (`vscode.sh`) critically fail (`fail_critical`) the entire script during installation. While inconsistent, refactoring must not accidentally break installation on supported OSes while standardizing this.

## 4. Operating System Support

*   **Fully Supported:** Ubuntu (20.04+), Debian (11+), Pop!_OS, Linux Mint.
*   **Partially Supported:** Fedora (via `dnf`), Arch Linux (via `pacman`). Generic packages install correctly, but third-party installers (Chrome, VSCode) may fail.
*   **Abstraction Layer:** Modules must continue requesting packages via `pkg_install <name>` without hardcoding `apt-get` directly, preserving the `lib/package-manager.sh` abstraction.

## 5. Exit Codes

*   Standard successful execution must return `0`.
*   Failed validation or missing prerequisites must return `1` (via `fail_critical`).
*   `doctor.sh` and `repair.sh` exit `1` if issues are left unresolved.
