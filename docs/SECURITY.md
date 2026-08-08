# Security Model

Because DevBootstrap executes installation code on a user's machine, security is a primary concern.

## Minimum V1 Security Requirements
- **HTTPS Only**: All downloads and web requests must use HTTPS.
- **Checksum Verification**: Release artifacts downloaded via the bootstrap script must be verified via checksums before extraction.
- **Official Repositories**: Use official package repositories wherever possible. Avoid untrusted PPAs.
- **No Hardcoded Secrets**: Do not store passwords, API keys, or tokens in the codebase.
- **No Credential Logging**: Never log passwords, tokens, private SSH keys, or other credentials.
- **No Blind Execution**: Never execute arbitrary remote scripts downloaded on the fly without validating their source and intent.
- **Secure Temporary Directories**: Use `mktemp -d` to create secure temp directories and ensure they are cleaned up (`trap cleanup EXIT`).
- **Safe Shell Practices**: Use `set -Eeuo pipefail` where compatible. Quote shell variables properly.
- **Minimal Sudo**: Avoid running the entire installer as root. Only request `sudo` when strictly necessary.
