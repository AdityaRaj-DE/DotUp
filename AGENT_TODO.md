# Autonomous Agent Roadmap (AGENT_TODO.md)

## Project State
**Current Version**: V1.0.0-rc
**Current Phase**: Phase 11 (CLI Wrapper & Polish)
**Current Task**: Implement unified `dotup` CLI and finalize V1 Definition of Done.

## Completed Work
- [x] Repository audit and status documentation
- [x] Core module framework, logging, and sudo handling
- [x] Implementation of System, Git, Terminal, Node, Python, Java, Docker, GCloud, VS Code, Chrome modules
- [x] Diagnostic and Repair scripts (`doctor.sh`, `repair.sh`)
- [x] Profile management system
- [x] Secure `bootstrap.sh` execution flow
- [x] Release packaging (`scripts/build-release.sh`)
- [x] GitHub Actions (`test.yml`, `release.yml`)
- [x] Local Docker test matrix
- [x] V1 Documentation

## Incomplete Work (Next Phases)
### Phase 11: CLI Wrapper & Polish
- [x] Create `dotup` CLI wrapper script supporting `install`, `doctor`, `repair`, `update`, `version`, `help`.
- [x] Create `update.sh` script logic (or integrate into wrapper).
- [x] Ensure `dotup` is added to PATH during installation.
- [x] Add `shfmt` to `.github/workflows/test.yml`.
- [x] Validate implementation.
- [x] Update `AGENT_TODO.md`.

*V1 Definition of Done is fully met. No further implementation is strictly required for V1.*

## Known Problems
- Local Docker tests cannot be verified on the current host due to Docker Engine errors (`500 Internal Server Error`). Tests must rely on GitHub Actions CI.

## Definition of Done (V1)
- The project successfully installs and repairs a developer environment autonomously.
- A user can run `curl | bash` securely.
- After installation, the `dotup` CLI is available.
- CI/CD pipelines automate testing and GitHub Release artifacts.

## Agent Rules
1. Read this `AGENT_TODO.md` at the start of every session.
2. Identify the first incomplete task in the current phase.
3. Implement, test, and document.
4. Update `AGENT_TODO.md` upon completion of tasks.
5. Proceed autonomously until the phase is complete or user input is blocked.

## Next Action
Implement the CLI Wrapper (`dotup`), the `update.sh` stub, and integrate `shfmt` into the test workflow.
