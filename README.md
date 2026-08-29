# DotUp 🚀

**The easiest way to set up your Linux development machine.**

Got a brand new laptop? Wiped your computer? Tired of spending hours manually downloading apps, adding repositories, fixing GPG keys, and configuring your terminal? 

**DotUp** solves all of that. It turns hours of manual computer setup into a single, simple command. 

## What does it do?
You give DotUp a simple list of the tools you want (like Node.js, Python, VS Code, Google Chrome, Docker, etc.), and DotUp automatically figures out how to install and configure them perfectly for your specific Linux operating system.

## Quick Start
You can install DotUp and run your setup in one command. Open your terminal and paste this:

```bash
curl -fsSL https://raw.githubusercontent.com/AdityaRaj-DE/DotUp/main/bootstrap.sh | bash -s -- --config examples/backend.yaml
```

*(This command safely downloads DotUp, verifies it, and runs it using our example backend configuration.)*

## How to use it (`dotup.yaml`)
DotUp uses a simple file called `dotup.yaml` where you list what you want installed. It looks like this:

```yaml
schema_version: 1
profile:
  name: my-computer
modules:
  system: {}     # Installs basic system utilities
  git: {}        # Installs Git
  zsh: {}        # Installs the Zsh terminal with a beautiful theme
  node:          
    version: "20" # Installs Node.js version 20
  docker: {}     # Installs Docker
```

Once you have your file, you just tell DotUp to make it happen:
```bash
dotup install --config my-setup.yaml
```

## Key Features

- **Safe to Run Multiple Times (Idempotent)**: You can run DotUp as many times as you want! It's smart enough to check what's already installed. If you already have Git, it will simply skip it. It never breaks your existing setup.
- **Test Run before installing (`--plan`)**: If you want to see exactly what DotUp is going to do *before* it makes any changes to your computer, just add `--plan`. It will print a clear summary of what will be installed, updated, or skipped.
  ```bash
  dotup install --config my-setup.yaml --plan
  ```
- **Self-Healing (`repair`)**: Did an app break or stop working? Just run `dotup repair` and DotUp will figure out what went wrong and fix it for you.
- **Secure**: DotUp never runs random internet scripts blindly. It verifies checksums, runs securely, and only asks for your password (`sudo`) when it absolutely has to (like when installing system packages).

## Supported Operating Systems
DotUp works seamlessly across multiple Linux families:
- **Perfect Support**: Ubuntu (20.04+), Debian (11+), Pop!_OS, Linux Mint
- **Good Support**: Fedora and Arch Linux *(Note: A few specific apps like Chrome or VS Code might require manual installation on Fedora/Arch, but everything else works perfectly!)*
- **Not Supported**: macOS, Windows

## For Developers & Advanced Users
Are you a developer interested in how DotUp works under the hood? DotUp V2 is powered by a custom **Declarative State Difference Engine** that abstracts package managers (`apt`, `dnf`, `pacman`) entirely!

Check out our technical documentation:
- **[Architecture & Design](docs/V2_ARCHITECTURE.md)** (Highly Recommended)
- **[State Difference Model](docs/V2_STATE_MODEL.md)**
- **[Module Contract](docs/MODULE_CONTRACT.md)**
- **[Installation Flow](docs/INSTALLATION_FLOW.md)**
- **[Error Handling](docs/ERROR_HANDLING.md)**
- **[Security Practices](docs/SECURITY.md)**
