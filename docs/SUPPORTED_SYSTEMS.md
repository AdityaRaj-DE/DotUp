# Supported Systems

## V1 Scope
DotUp V1 is explicitly designed for the **Debian/Ubuntu family**.

### Primary Supported Distributions
- **Ubuntu** (Latest LTS and previous LTS)
- **Debian** (Stable)
- **Linux Mint**
- **Pop!_OS**
- Compatible Ubuntu derivatives

### Package Manager
- `apt`

## Unsupported in V1 (V2 Candidates)
- Fedora / CentOS / RHEL (`dnf` / `yum`)
- Arch Linux (`pacman`)
- openSUSE (`zypper`)
- macOS (`brew`)
- Windows

The architecture should leave room to add OS-specific modules in the future, but V1 implementation must remain focused on Debian/Ubuntu and `apt`.
