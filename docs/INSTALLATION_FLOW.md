# Installation Flow

1. **Bootstrap (`curl | bash`)**: 
   - Downloads a specific DevBootstrap release.
   - Verifies checksum.
   - Extracts into a temporary directory.
   - Executes the main `install.sh`.

2. **Preflight**:
   - Verify network connectivity.
   - Detect OS architecture (amd64, etc.).
   - Detect OS distribution (Ubuntu/Debian).

3. **Privilege Escalation (`sudo`)**:
   - Establish sudo access for package management.
   - Avoid running the entire installer as root.

4. **Profile Selection**:
   - Determine target modules based on user profile (minimal, full, backend, frontend, devops).

5. **Module Execution**:
   - System/base packages
   - Git & SSH
   - Terminal (zsh, oh-my-zsh)
   - Development (Node, Python, Java)
   - Infrastructure (Docker, gcloud)
   - Applications (VS Code, Chrome)

6. **Validation & Repair**:
   - Validate each component.
   - If broken, execute module repair.
   - Re-validate.

7. **Finalization**:
   - Write state.
   - Output summary report.
   - Cleanup temporary files.
