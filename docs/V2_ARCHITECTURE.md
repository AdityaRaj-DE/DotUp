# DotUp V2 Architecture Plan

## Current V1 Architecture

The V1 architecture is functional but tightly coupled to Debian/Ubuntu and specific package managers:

```text
CLI
 ↓
Orchestrator
 ↓
Modules
 ↓
Package/platform-specific implementation (apt, .deb)
```

## Problems Identified

- **Debian/Ubuntu Coupling:** Direct use of `apt`, `dpkg`, and Debian-specific repositories in core scripts and modules.
- **Package-Manager Coupling:** Modules lack a package abstraction layer; they call `apt-get` directly.
- **Vendor Installation Coupling:** Third-party tools often hardcode `.deb` paths and extraction logic.
- **Configuration Limitations:** Configuration and profiling are basic and lack a robust schema.
- **State-Model Limitations:** The `STATE_MODEL.md` claimed there was a persistent state, but it only existed dynamically in memory via `_detect()`.
- **Testing Limitations:** Testing relies heavily on Docker on GitHub Actions, which doesn't accurately test GUI apps.

## Target V2 Architecture

The target is to introduce a clear abstraction layer so modules do not care about the underlying OS.

```text
CLI
 ↓
Orchestrator
 ├── Configuration
 ├── Platform Context
 ├── Module System
 └── State / Detection
          ↓
   Platform abstraction
          ↓
   apt / dnf / pacman
```

### Phase 1: Platform Context (Implemented)

A centralized Platform Context now exists in `lib/os.sh` providing a clear API for querying OS capabilities. Modules no longer parse `/etc/os-release` independently.

API:

- `platform_distribution()`: e.g., Ubuntu, Fedora, Arch
- `platform_version()`: e.g., 24.04, 40
- `platform_dist_id()`: e.g., ubuntu, fedora, arch
- `platform_architecture()`: normalized to amd64, arm64, armhf, unknown
- `platform_package_manager()`: e.g., apt, dnf, pacman
- `platform_init_system()`: e.g., systemd

**Distinction:** The Platform Context distinguishes between _detected_ platforms and _supported_ platforms. While Fedora and Arch can be detected, they remain explicitly unsupported for installation until later phases.

### Phase 2: Package Abstraction (Implemented)

A Package API exists in `lib/package-manager.sh` defining generic functions:

- `pkg_install`
- `pkg_update`
- `pkg_is_installed`
- `pkg_is_available`

The API consumes the `Platform Context` to route operations. Currently, an APT backend is fully implemented for Ubuntu/Debian. Modules request packages generically (e.g., `pkg_install curl`), removing direct OS assumptions.

**Note:** Vendor-specific installations (e.g. adding PPA keys, `.deb` installations for Chrome) purposefully remain separated from standard package operations.

### Phase 3: Fedora Support (Implemented)

The Package API now explicitly routes identical module requests (`pkg_install curl`) to native `dnf` execution under Fedora. The platform detection logic allows Fedora as a supported installation platform for generic package modules.

**Current Support Horizon**: While DNF is fully implemented, modules deploying third-party repositories (e.g. VS Code, Chrome, Docker) are intentionally incompatible with Fedora because they still encode Debian `.deb` constraints. These modules are deferred to future package-source adaptation phases.

### Phase 4: Arch Support (Implemented)

The Package API now supports Pacman. `Platform Context` successfully identifies Arch and directs generic operations (e.g. `pkg_install`) to `pacman` internally without affecting modules.

**Current Support Horizon**: Similar to Fedora, third-party vendor modules remain incompatible with Arch until future package-source adaptation phases resolve their Debian/APT repository limitations.

### Phase 5: Installation Capability Model (Implemented)

Vendor packages and third-party repositories have been refactored. Rather than a complex generic repository API, vendor installers use `$PKG_MANAGER` branching to implement native APT `sources.list`, DNF `.repo` files, or Pacman configurations directly.
Additionally, a `pkg_install_local` API handles generic execution for directly downloaded packages (`.deb`, `.rpm`).

### Phase 6: Configuration Model and dotup.yaml (Implemented)

V2 introduces `dotup.yaml`, a declarative manifest describing the desired environment configuration.

- It is structurally parsed by an internal `awk`-based parser `config_parser.sh` (to avoid external dependencies like `yq`).
- Validated structurally (checking for `schema_version`, missing fields) and semantically (ensuring module scripts exist).
- The internal representation uses bash indexed arrays (`CONFIG_MODULES`) and dynamic variables (`CONFIG_MODULE_node_version`) to provide bash 3.2 compatibility.
- V1 `.conf` files are still supported via the legacy fallback.

### Phase 7A: Desired State / Actual State Model (Implemented)

V2 introduces a robust declarative `State Engine` (`lib/state_engine.sh`) that evaluates the difference between desired and actual system states without modifying the machine.

- **Desired State**: Constructed deterministically from the parsed configuration model.
- **Actual State**: Detected side-effect free via the new module contract `<module>_detect_state`. Outputs are strictly line-oriented `key=value` formats for maximum security and portability.
- **Difference Engine**: A central state comparator identifies required actions (`SATISFIED`, `INSTALL_REQUIRED`, `VERSION_CHANGE_REQUIRED`, `REPAIR_REQUIRED`).
- **Separation of Concerns**: The detection process remains fully decoupled from the execution logic and the package manager backend.

### Phase 7B: State Difference and Plan Engine (Implemented)

Phase 7B connects the Phase 7A state differences into the active V2 loop in `install.sh`.

- **Dry-Run Mode**: Introduced a `--plan` CLI flag that explicitly prints the differences without applying them.
- **Execution Routing**: `execute_module_v2` is now enabled (Phase 7C), actively mapping `DIFF_STATE_*_action` to installation functions (`_install`, `_configure`, `_validate`, `_repair`). Running `--config` will execute the installation steps unless `--plan` is provided.
- **V1 Legacy Isolation**: V1 `.conf` profile usage continues to route through the original legacy `execute_module` loop, providing a completely safe isolation of V2 logic from V1 workloads.

### Phase 8: Shell Configuration & User Space (Implemented)

The `zsh` terminal module has been refactored to eliminate insecure remote execution (`curl | sh`).
- Oh My Zsh is deterministically installed via direct `git clone`.
- The `.zshrc` is safely scaffolded from standard Oh My Zsh templates rather than hardcoded bash strings.
- Shell handoff (`chsh`) safely validates environment constraints.
- Avoids root (`sudo`) escalation unnecessarily during user-space plugin operations.