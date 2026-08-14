# DotUp V2 Migration Plan

## Migration Strategy
Moving from V1 to V2 will follow an incremental, backward-compatible strategy. We will not do a full rewrite. The core lifecycle hooks (`_detect`, `_install`, `_configure`, `_validate`) remain unchanged but their internal implementation will shift to use new platform abstractions.

### 1. V1 Implementation
Existing modules directly call `apt` and assume Debian/Ubuntu.

### 2. Compatibility Boundary
A new Platform Abstraction layer is introduced in parallel with existing code. Old modules are unchanged initially and will continue to work on Ubuntu.

### 3. New Abstraction
The `lib/package-manager.sh` is expanded to provide generic functions like `pkg_install` instead of directly wrapping `apt`.

### 4. Module Migration
Modules are updated one-by-one to use `pkg_install` instead of `apt-get install`. This allows a phased transition.

### 5. Old Implementation Removal
Once all modules are migrated and tested across platforms, the old raw `apt` calls are deprecated and removed.

## What Changes
- **Modules**: Will use abstraction functions.
- **Package Manager**: Will route commands to `apt`, `dnf`, or `pacman`.
- **Profiles**: Will eventually migrate to YAML, but `.conf` will remain supported temporarily.

## What Remains Unchanged
- The CLI entrypoint (`dotup`).
- The `bootstrap.sh` download verification process.
- The `doctor.sh` and `repair.sh` lifecycle commands.
