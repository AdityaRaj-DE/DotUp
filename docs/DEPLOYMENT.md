# Deployment

DotUp is distributed purely via GitHub Releases. The project packages all necessary runtime scripts, modules, and configurations into a compressed archive (`tar.gz`). 

This architecture allows for deterministic, reproducible installations, ensuring users run fully tested and version-locked installer code rather than pulling volatile code directly from the `main` branch.

## Artifact Integrity
Every DotUp release includes a `SHA256SUMS` file containing the cryptographic hashes of the release archives. 

When a user executes the bootstrap script (`bootstrap.sh`), it:
1. Resolves the target release version (`v1.1.0` or latest).
2. Downloads the target release archive.
3. Downloads the associated checksum file.
4. Automatically validates the archive against the checksum before any extraction or execution occurs.

This fail-closed deployment methodology guarantees that tampered or corrupted downloads will halt the installation immediately.
