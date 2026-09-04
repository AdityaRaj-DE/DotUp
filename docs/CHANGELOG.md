# Changelog

## [V2.0.2] - 2026-09-04

### Changed
- **Git Module**: Replaced non-interactive git configuration warnings with interactive prompts for `user.name`, `user.email`, and SSH key generation, complete with existing config detection and automated safe backups. Added CI-detection to seamlessly skip prompts during non-interactive runs.
- **Terminal Module**: Completely automated the Zsh/Powerlevel10k setup. Added JetBrains Mono Nerd Font download and system-wide installation. Replaced the generic `.zshrc` with parameterized custom dotfiles and added the `zsh-syntax-highlighting` plugin. Added `.bak` rotation for existing user configurations.

## [V1.0.0] - 2026-08-08
### Added
- **Core Framework**: Idempotent execution, structured logging, safe temporary directory management, and sudo privilege escalation.
- **Profiles**: `minimal`, `full`, `backend`, `frontend`, `devops`.
- **System Module**: Installs `curl`, `wget`, `git`, `unzip`, `jq`, `tmux`, `ripgrep`, etc.
- **Git Module**: Git configuration and safe SSH key generation.
- **Terminal Module**: `zsh`, Oh My Zsh, and Powerlevel10k theme integration.
- **Development Tools**: Node.js (via `fnm`), Python (`pipx`, `venv`), Java (`default-jdk`).
- **Infrastructure**: Docker (Engine, CLI, Compose) and Google Cloud CLI.
- **Applications**: Google Chrome, VS Code, and Antigravity stub (with headless protection).
- **Diagnostics**: `doctor.sh` for system health checks and `repair.sh` for targeted fixes.
- **Automated Tests**: Docker-based idempotency testing matrix for Ubuntu and Debian.
- **Bootstrap Flow**: `bootstrap.sh` script to execute direct installation securely from source tarballs.
