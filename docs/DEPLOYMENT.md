# Deployment

dotup is distributed purely via GitHub Releases. The project packages all necessary runtime scripts, modules, and configurations into a compressed archive (`tar.gz`). 

This architecture allows for deterministic, reproducible installations, ensuring users run fully tested and version-locked installer code rather than pulling volatile code directly from the `main` branch.

## Artifact Integrity
Every dotup release includes a `SHA256SUMS` file containing the cryptographic hashes of the release archives. 

When a user executes the bootstrap script (`bootstrap.sh`), it:
1. Downloads the target release archive.
2. Downloads the associated checksum file.
3. Automatically validates the archive against the checksum before any extraction or execution occurs.

This fail-closed deployment methodology guarantees that tampered or corrupted downloads will halt the installation immediately.
