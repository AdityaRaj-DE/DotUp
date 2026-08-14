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

### Phase Mapping
- **Phase 1-2:** Platform Context & Package Abstraction
- **Phase 3-4:** Cross-platform implementations (Fedora, Arch)
- **Future Phases:** Declarative state engine, plan/apply capabilities, advanced configuration.
