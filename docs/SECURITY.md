# Security Model

Because DotUp executes installation code on a user's machine, security is a primary concern.

## Minimum Security Requirements
- **HTTPS Only**: All downloads and web requests must use HTTPS.
- **Checksum Verification**: Release artifacts downloaded via the bootstrap script are verified via `SHA256SUMS` before extraction. If the checksum fails, the bootstrapper fails closed.
- **Checksum Limitations**: Note that standard SHA256 checksums protect against corrupted downloads and MITM attacks assuming the GitHub API and release storage themselves are not compromised. They are *not* a substitute for cryptographic signing (GPG/Sigstore), which may be added in future architectures.
- **Official Repositories**: Use official package repositories wherever possible. Avoid untrusted PPAs.
- **No Hardcoded Secrets**: Do not store passwords, API keys, or tokens in the codebase.
- **No Credential Logging**: Never log passwords, tokens, private SSH keys, or other credentials.
- **Secure Temporary Directories**: Extraction uses `mktemp -d` to create secure temp directories and ensures they are aggressively cleaned up (`trap cleanup EXIT`) whether the installation succeeds or fails.
- **Minimal Sudo**: Avoid running the entire installer as root. Only request `sudo` when strictly necessary.
