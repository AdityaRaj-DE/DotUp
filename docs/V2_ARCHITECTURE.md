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

**Distinction:** The Platform Context distinguishes between *detected* platforms and *supported* platforms. While Fedora and Arch can be detected, they remain explicitly unsupported for installation until later phases.

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

### Phase 4: Arch / Pacman Backend (Next)
