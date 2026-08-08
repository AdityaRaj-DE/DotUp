# Testing Strategy

Testing is a mandatory component of DevBootstrap development.

## Automated Test Environments (Docker)
We use Docker to simulate fresh Linux environments. 
- Located in `tests/docker/`
- Target minimums: Ubuntu (latest supported, previous LTS), Debian stable.

## Required Test Scenarios
1. **Clean Installation**: Run on a fresh container.
2. **Idempotency (Rerun)**: Run `install.sh` twice. The second run should detect existing components, skip redundant installs, and not duplicate configurations.
3. **Repair Test**: Install a component, intentionally break it, run `repair`, and verify it is fixed.
4. **Failure Injection**: Test behavior when internet is missing, apt is locked/broken, or dependencies are missing. Ensure graceful failure and logging.
5. **Bootstrap Flow**: Test the full `curl | bash` simulation to verify download, checksum, and extraction logic.

## Docker Limitations
Docker is suitable for OS detection, apt installs, idempotency, and basic tools. It is NOT sufficient for GUI applications, systemd, complex font rendering, or deep hardware integration. These require host-level integration testing or clear documentation of limitations.
