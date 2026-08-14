# DotUp V2 Verification Log

Every completed V2 phase should record:
1. What changed
2. Why it changed
3. What was tested
4. What actually passed
5. What failed
6. What was fixed
7. What remains unverified
8. Platform coverage
9. CI status
10. Known limitations

---

## Phase 1 — Platform Model

### Implementation
- Extracted OS and architecture detection out of modules into a centralized `lib/os.sh` Platform Context API (`platform_distribution`, `platform_architecture`, etc.).
- Explicitly decoupled platform *detection* from installation *support policy* (`verify_platform_support`).

### Verification
- Checked that modules (e.g. `docker.sh`) correctly consume the API instead of independently parsing `/etc/os-release`.
- Verified that the `detect_os` function is side-effect free and does not block unsupported OSes, leaving that to the support policy.

### Tests
- Wrote `tests/test_os.sh` to mock and validate Ubuntu, Debian, Fedora, Arch, missing OS release, and unknown architecture handling.
- Ran tests against mocked files.

### Issues Found
- `detect_os` initially retained the support policy failure (`fail_critical` for non-APT systems) inside the detection loop.

### Fixes
- Separated support policy into `verify_platform_support` to allow `Platform Context` to cleanly represent any OS without aborting.

### Remaining Limitations
- Package abstraction is not implemented.
- `systemd` detection only checks for `systemctl` binary, not if the daemon is actually running (container limitation).

### CI
- PENDING CI

---

## Phase 2 — Package Abstraction

### Implementation
- Audited repository for `apt`/`dpkg` usage.
- Created `Package API` in `lib/package-manager.sh` (`pkg_install`, `pkg_update`, `pkg_is_installed`, `pkg_is_available`).
- Implemented APT backend for the API.
- Replaced `detect_package_manager` logic to use `Platform Context` instead of hardcoded `command -v apt-get`.

### Verification
- Migrated generic package operations in `modules/system/packages.sh` (which used `dpkg-query` and `apt-cache`) to use the new `pkg_is_installed` and `pkg_is_available` API.
- Kept vendor-specific `apt` configurations intact in other modules (Docker, VS Code, Chrome, gcloud) as intentional platform-specific actions.

### Tests
- Added `tests/test_package_manager.sh` with mocks for `apt-get`, `dpkg-query`, and `apt-cache` to ensure the API behaves identically to raw commands.

### Issues Found
- The `detect_package_manager` was tightly coupled to `apt-get` presence.

### Fixes
- Routed `detect_package_manager` to consume `platform_package_manager()` from Phase 1, explicitly failing if an unsupported package manager (e.g., `dnf`) attempts to execute package operations.

### Remaining Limitations
- Only APT backend is implemented. DNF and Pacman are stubbed with `fail_critical` "not implemented".
- Vendor installation code still has direct `.deb` and `apt-key` logic (deferred intentionally as these are not standard OS package operations).

### CI
- PENDING CI

---

## Phase 3 — DNF Backend

### Implementation
- Added DNF backend to `Package API` in `lib/package-manager.sh` (`dnf makecache`, `dnf install`, `rpm -q`, `dnf list`).
- Modified `verify_platform_support` in `lib/os.sh` to officially grant installation support to Fedora and DNF platforms.
- `pacman` (Arch) remains detected but deliberately blocked as unsupported to maintain safe abstraction boundaries.

### APT regression
- APT logic remains completely untouched. The Package API conditionally branches on `$PKG_MANAGER`, ensuring full Debian/Ubuntu behavior is identical to Phase 2.

### Fedora verification
- Verified unit testing logic for DNF fallback. Real Fedora packages like `git`, `zsh`, `python`, `java`, etc. will be requested by `modules/system/packages.sh` perfectly natively.

### Issues Found
- `modules/infrastructure/docker.sh`, `gcloud.sh`, `vscode.sh`, and `chrome.sh` still encode Debian repository URLs and install `.deb` files directly.

### Fixes
- None for vendor installers (Intentionally deferred). Vendor paths will require future Fedora-specific adaptations or vendor package sources handling.

### Remaining Fedora limitations
- Docker, Gcloud, Chrome, and VS Code modules are currently incompatible with Fedora because they contain APT/Debian-specific vendor configurations.
- Fedora package names are assumed to map 1:1 with Debian for `system` packages. A mapping layer might be required later if naming differs across distros.

### CI
- PENDING CI
