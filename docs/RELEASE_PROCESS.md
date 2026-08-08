# Release Process

dotup employs an automated release pipeline utilizing GitHub Actions. Maintainers do not manually build or publish artifacts.

## How to Create a New Release

1. **Tag the Commit**: Locally, create a semantic version tag pointing to the commit you wish to release.
   ```bash
   git tag v1.0.0
   ```
2. **Push the Tag**: Push the new tag to the `origin` repository.
   ```bash
   git push origin v1.0.0
   ```
   
## CI/CD Pipeline

Once the tag is pushed to GitHub, the `.github/workflows/release.yml` pipeline is triggered:
1. **Testing**: The pipeline delegates to the test workflow (`test.yml`), which executes `shellcheck` and the Docker matrix testing across Ubuntu and Debian.
2. **Packaging**: If the tests succeed, the `scripts/build-release.sh` script generates the `dotup-<version>.tar.gz` and the `SHA256SUMS` file. Development-only scripts and source metadata (like `.git`) are intentionally excluded.
3. **Publishing**: The workflow leverages the GitHub API to create a formal GitHub Release under the corresponding tag, uploading the compiled archive and its checksum. 

Once published, the release is immediately resolvable by the `bootstrap.sh` script.
