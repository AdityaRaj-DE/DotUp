# Bootstrap Flow

The `bootstrap.sh` script is the primary entry point for users installing dotup via the `curl | bash` methodology. It is specifically engineered to be small, single-responsibility, and highly secure.

## Responsibilities

`bootstrap.sh` must strictly adhere to the following sequence:

1. **Prerequisite Check**: Verify that `curl`, `tar`, and `sha256sum` are available.
2. **Version Resolution**: Query the GitHub API to discover the latest stable tag (unless an explicit version is provided via `$DOTUP_VERSION`).
3. **Secure Temporary Environment**: Create a temporary directory using `mktemp -d` and register a `trap` to ensure it is destroyed upon script completion, interruption, or failure.
4. **Artifact Download**: Fetch the `tar.gz` and `SHA256SUMS` files for the targeted release.
5. **Validation**: Execute `sha256sum -c` to verify the downloaded archive identically matches the published hash.
6. **Extraction & Execution**: Extract the archive into the temporary directory, and execute the underlying `install.sh` orchestrator with any provided user arguments (e.g., `--profile minimal`).

## Security Guarantees
- The bootstrap script runs entirely in user-space and never demands `sudo` execution itself. Sudo privilege escalation is delegated to the specific dotup modules that explicitly require it.
- In the event of a checksum mismatch, a failed download, or an extraction fault, the script exits immediately with a non-zero status, leaving the system in a clean state.
