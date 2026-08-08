# DevBootstrap Architecture

## Core Design
DevBootstrap is a CLI/bootstrap tool designed to automatically prepare a development environment on a fresh or partially configured Linux machine.

## Components
- **Orchestrator**: Manages execution flow, profile selection, and module invocation.
- **Modules**: Standalone units of functionality that detect, install, configure, and validate specific software (e.g., Git, Docker, Node).
- **Core Library**: Shared bash utilities (logging, OS detection, package manager, state management, etc.).
- **Profiles**: Configuration files that dictate which modules to run.

## Flow
1. Preflight checks (internet, OS, architecture, package manager)
2. Sudo setup and privileges
3. Profile parsing and component selection
4. Module execution (dependency ordered)
5. Component configuration
6. Validation and repair
7. Final reporting

## Principles
- **Detectable**: Components must have robust state detection (NOT_INSTALLED, INSTALLED, BROKEN).
- **Idempotent**: Safe to run repeatedly without duplicating configuration or redundant installs.
- **Validated**: Functionality must be confirmed by tests, not just command exit codes.
- **Recoverable**: Failures should be repaired if possible, with clear fallbacks and logs.
