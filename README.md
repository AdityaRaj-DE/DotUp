# DotUp

DotUp is an autonomous, idempotent Linux developer-environment bootstrap tool. It instantly prepares a fresh or partially configured Ubuntu/Debian machine with standard development tools, infrastructure dependencies, and applications securely and consistently.

## Why does it exist?
Setting up a new development machine is historically a manual, error-prone process. DotUp solves this by providing a unified, declarative bootstrapping mechanism. It completely abstracts away the complexity of configuring repositories, verifying GPG keys, modifying shell paths, and resolving dependencies—turning hours of setup into a single command.

## Supported Systems
DotUp V1 is strictly built and tested for the **Debian/Ubuntu family**.
- **Supported**: Ubuntu (20.04+), Debian (11+), Pop!_OS, Linux Mint
- **Partially Supported**: Other Debian derivatives (some proprietary tools may require manual steps)
- **Not Supported**: Fedora, Arch, Alpine, macOS, Windows

## Quick Start
You can securely install DotUp and bootstrap your machine using the curl-to-bash flow. The bootstrapper handles downloading the latest release artifact, verifying its SHA256 checksum, and executing the payload in isolation.

```bash
curl -fsSL https://raw.githubusercontent.com/AdityaRaj-DE/DotUp/main/bootstrap.sh | bash -s -- --profile minimal
```

*(Note: If you want to install everything, use `--profile full` instead).*

## Configuration Profiles
DotUp uses declarative profiles to dictate which modules are installed to your system:

| Profile | Description | Included Modules |
|---------|-------------|------------------|
| `minimal` | Core system utilities. | System packages, Git, Zsh |
| `backend` | Backend infrastructure. | Node.js, Python, Java, Docker, gcloud |
| `frontend`| Frontend environment. | Node.js, VS Code, Chrome |
| `devops` | DevOps engineering. | Docker, gcloud, Zsh |
| `full` | Everything. | All supported modules |

## CLI Commands
After installation, the `dotup` CLI is automatically added to your path (`~/.local/bin/dotup`).

- `dotup install [--profile <name>]`: Idempotently installs or ensures the health of components defined in the specified profile.
- `dotup doctor`: Performs a read-only health check across all installed modules and reports broken or missing dependencies.
- `dotup repair`: Interactively or automatically repairs components that have degraded or broken since installation, without unnecessarily reinstalling healthy ones.
- `dotup update`: Safely downloads the newest `bootstrap.sh` and re-runs the bootstrapper to overlay the latest version of DotUp onto your system.
- `dotup version`: Displays the installed DotUp version.

## Idempotency and State
DotUp is fundamentally **idempotent**. 
You can run `dotup install` 100 times, and it will only install components that are missing. It actively inspects the live host (using `command -v` and directory checks) rather than trusting a local cache. It will never duplicate configuration lines in your `.bashrc` or blindly run `apt-get` if the system is already healthy.

## Security
Security is a first-class citizen in DotUp:
- **Checksum Verification**: The `bootstrap.sh` script downloads both the `.tar.gz` artifact and the `SHA256SUMS` file from GitHub Releases. If the hash does not match identically, DotUp fails closed and aborts execution immediately.
- **Isolation**: Installation scripts are extracted to a secure `mktemp -d` directory, preventing arbitrary execution from your downloads folder.
- **Cleanup**: Whether the installation succeeds or panics, the temporary environment is ruthlessly purged.
- **Least Privilege**: DotUp runs as your standard user, explicitly elevating via `sudo` only when strictly required (e.g., `apt-get` or adding package repositories).

## Testing and Development
DotUp relies on a strict dual-testing strategy:
1. **Linting**: All scripts must pass strict `shellcheck` and 4-space `shfmt` linting in CI.
2. **Docker Matrices**: The core installation, doctor, and repair pipelines are validated headlessly against clean Ubuntu and Debian Docker containers via GitHub Actions.
*(Note: Because CI environments are headless, GUI applications like Chrome or VS Code are only validated for package presence, not visual execution).*

## Release Process
DotUp utilizes fully automated semantic releases. When a developer tags a commit (e.g., `v1.1.0`), GitHub Actions automatically lints the codebase, executes the Docker tests, builds the `dotup-v1.1.0.tar.gz` distribution archive alongside its SHA256 checksum, and publishes it to GitHub Releases. The bootstrapper securely consumes these finalized artifacts.

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [Module Contract](docs/MODULE_CONTRACT.md)
- [Installation Flow](docs/INSTALLATION_FLOW.md)
- [State Model](docs/STATE_MODEL.md)
- [Error Handling](docs/ERROR_HANDLING.md)
- [Security](docs/SECURITY.md)
- [Supported Systems](docs/SUPPORTED_SYSTEMS.md)
- [Testing Strategy](docs/TESTING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Release Process](docs/RELEASE_PROCESS.md)
- [Changelog](docs/CHANGELOG.md)
