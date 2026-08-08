# Testing Strategy

Testing is a mandatory component of DotUp development.

## Automated Test Environments (Docker & Linting)
DotUp relies on dual-strategy automated tests via GitHub Actions.
1. **Linting**: Every `.sh` file is statically analyzed by `shellcheck` and rigidly formatted by `shfmt -i 4`.
2. **Integration Matrices**: We use Docker to simulate fresh Linux environments across Ubuntu and Debian stable.

## Required Test Scenarios
1. **Clean Installation**: Run on a fresh container.
2. **Idempotency (Rerun)**: Run `install.sh` twice. The second run should detect existing components, skip redundant installs, and not duplicate configurations.
3. **Bootstrap Validation**: The full `curl | bash` simulation is executed inside Docker to verify release resolution, checksum handling, and proper tar extraction logic.

## Limitations
Because CI environments (like GitHub Actions runners) execute Docker headlessly, testing is technically limited:
- Headless execution is sufficient for OS detection, `apt` package resolution, and CLI configurations (like Zsh/Git).
- It is **not** sufficient for deep visual verification of GUI applications (like Chrome or VS Code). The tests can only prove that the package was successfully pulled via `apt` or `curl` and exists on the filesystem. Deep hardware/UI integration requires a true VM or host desktop.
