import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AsciiReveal from '../../components/AsciiReveal';
import AsciiRevealText from '../../components/AsciiRevealText';
import AsciiGlitchText from '../../components/AsciiGlitchText';
import CodeCopyBlock from '../../components/CodeCopyBlock';
import {
  BookOpenIcon,
  TerminalIcon,
  CheckIcon,
  SparklesIcon,
  SlidersIcon,
  ExternalLinkIcon
} from '../../components/Icons';

export const metadata = {
  title: 'How to Use DotUp - Declarative Workstation Engine',
  description: 'Complete workflow guide to provision, configure, and self-heal your Linux development environment.'
};

export default function HowToUsePage() {
  const quickStartSnippet = `curl -fsSL https://raw.githubusercontent.com/AdityaRaj-DE/DotUp/main/bootstrap.sh | bash -s -- --config examples/backend.yaml`;

  const yamlExample = `schema_version: 1
profile:
  name: dev-workstation
  description: "Standard full-stack engineering environment"
modules:
  system: {}     # Installs build-essential, curl, git, procps
  zsh: {}        # Configures Zsh shell + Oh My Zsh framework
  git: {}        # Version control with sensible global defaults
  node:
    version: "20" # Node.js 20 LTS runtime and global npm tooling
  python:
    version: "3.11" # Python 3.11 standard toolchain with pip and venv
  docker: {}     # Docker Engine daemon, buildx, and compose plugin
  vscode: {}     # Visual Studio Code with desktop launcher
  chrome: {}     # Google Chrome stable browser`;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <div className="page-content-flow">
          {/* Hero Section with Corner Crosshairs */}
          <div className="hero-ascii-frame">
            <span className="crosshair crosshair-tl" />
            <span className="crosshair crosshair-tr" />
            <span className="crosshair crosshair-bl" />
            <span className="crosshair crosshair-br" />

            <div className="hero-top-row">
              <div className="hero-pill-badge">
                <span className="badge-new">v3.0</span>
                <span>Workstation Workflow &amp; Execution Guide</span>
              </div>

              <div className="hero-actions-right">
                <Link href="/" className="btn-hero-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}>
                  <AsciiGlitchText text="Open Configurator" />
                  <span>→</span>
                </Link>
              </div>
            </div>

            <h1 className="hero-headline">
              <AsciiRevealText text="How to Use DotUp" preset="decode" speed={16} />
            </h1>
            <p className="hero-lead">
              From zero to a fully provisioned developer machine in one command. DotUp turns hours of manual repository setup, GPG keys, and terminal tuning into a clean, spec-driven specification.
            </p>
          </div>

          {/* Quick Start Section */}
          <AsciiReveal preset="blueprint" duration={520}>
            <section className="page-section-card" data-ascii="surface">
              <div className="page-section-header">
                <span className="page-section-tagline">
                  <AsciiRevealText text="Immediate Execution" preset="blueprint" />
                </span>
                <h2 className="page-section-title">One-Line Quick Bootstrap</h2>
                <p className="page-section-desc">
                  Open your terminal and paste this command to safely download the verified DotUp orchestrator, check preconditions, and provision your workstation:
                </p>
              </div>

              <CodeCopyBlock
                code={quickStartSnippet}
                language="bash"
                caption="One-liner bootstrap (Runs in user-space, checksum verified)"
              />

              <div className="guide-steps-grid feature-cards-grid">
                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">01</span>
                    <span className="guide-step-category">Security</span>
                  </div>
                  <h3 className="guide-step-headline">Zero Blind Root</h3>
                  <p className="guide-step-text">
                    The bootstrap script runs strictly in user-space. Sudo escalation is isolated exclusively to package installations when apt, dnf, or pacman require it.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">02</span>
                    <span className="guide-step-category">Verification</span>
                  </div>
                  <h3 className="guide-step-headline">SHA256 Checksums</h3>
                  <p className="guide-step-text">
                    Every release archive is verified against cryptographically signed hashes before extraction into an isolated temporary workspace.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">03</span>
                    <span className="guide-step-category">Clean State</span>
                  </div>
                  <h3 className="guide-step-headline">Automatic Cleanup</h3>
                  <p className="guide-step-text">
                    Temporary files and installer scripts self-destruct via shell trap handlers upon script completion, error, or cancellation.
                  </p>
                </div>
              </div>
            </section>
          </AsciiReveal>

          {/* Workflow Steps Section */}
          <AsciiReveal preset="decode" duration={550}>
            <section className="page-section-card" data-ascii="surface">
              <div className="page-section-header">
                <span className="page-section-tagline">
                  <AsciiRevealText text="Step-by-Step Workflow" preset="blueprint" />
                </span>
                <h2 className="page-section-title">The Complete DotUp Lifecycle</h2>
                <p className="page-section-desc">
                  Whether using the interactive web GUI or the terminal CLI, here is how DotUp manages workstation state:
                </p>
              </div>

              <div className="feature-cards-grid">
                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">STEP 1</span>
                    <span className="guide-step-category">Specification</span>
                  </div>
                  <h3 className="guide-step-headline">Select or Customise Your Stack</h3>
                  <p className="guide-step-text">
                    Use our presets (Minimal Base, Frontend Web, Backend Dev, DevOps &amp; Cloud, Full Suite) or switch to <strong>Custom Stack</strong> to toggle languages, cloud SDKs, container engines, and editors.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">STEP 2</span>
                    <span className="guide-step-category">Resolution</span>
                  </div>
                  <h3 className="guide-step-headline">Pin Exact Tool Versions</h3>
                  <p className="guide-step-text">
                    Select target language runtimes like Node.js 18/20/22 LTS, Python 3.10/3.11/3.12, or OpenJDK 17/21. DotUp records these directly into your declarative manifest.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">STEP 3</span>
                    <span className="guide-step-category">Deployment</span>
                  </div>
                  <h3 className="guide-step-headline">Bootstrap Immediately or Save YAML</h3>
                  <p className="guide-step-text">
                    Copy the dynamic bootstrap command from the bottom dock to run immediately, or click <strong>Download YAML</strong> to commit <code className="code-pill">setup.yaml</code> to your dotfiles Git repo.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">STEP 4</span>
                    <span className="guide-step-category">Safety</span>
                  </div>
                  <h3 className="guide-step-headline">Test Run with --plan</h3>
                  <p className="guide-step-text">
                    Before altering any system files, execute <code className="code-pill">dotup install --plan</code> to preview what will be installed, upgraded, or skipped.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">STEP 5</span>
                    <span className="guide-step-category">Maintenance</span>
                  </div>
                  <h3 className="guide-step-headline">Self-Healing with dotup repair</h3>
                  <p className="guide-step-text">
                    If an environment dependency breaks or a package is inadvertently removed, run <code className="code-pill">dotup repair</code> to restore your environment back to desired state.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">STEP 6</span>
                    <span className="guide-step-category">Team Sync</span>
                  </div>
                  <h3 className="guide-step-headline">Zero Machine Drift</h3>
                  <p className="guide-step-text">
                    Share identical <code className="code-pill">setup.yaml</code> files across team members or CI nodes to ensure 100% reproducible development workstations without friction.
                  </p>
                </div>
              </div>
            </section>
          </AsciiReveal>

          {/* Declarative YAML Manifest Reference */}
          <AsciiReveal preset="terminal" duration={520}>
            <section className="page-section-card" data-ascii="surface">
              <div className="page-section-header">
                <span className="page-section-tagline">
                  <AsciiRevealText text="Declarative Spec" preset="terminal" />
                </span>
                <h2 className="page-section-title">Declarative YAML Specification (`dotup.yaml`)</h2>
                <p className="page-section-desc">
                  DotUp uses an intuitive, version-controlled YAML manifest. Here is what a complete workstation profile looks like:
                </p>
              </div>

              <CodeCopyBlock
                code={yamlExample}
                language="yaml"
                caption="Canonical dotup.yaml specification format"
              />

              <div className="feature-cards-grid" style={{ marginTop: '0.5rem' }}>
                <div className="guide-step-box">
                  <h3 className="guide-step-headline">Idempotent by Design</h3>
                  <p className="guide-step-text">
                    Running DotUp ten times produces the exact same clean outcome as running it once. Existing tools are detected and skipped rather than redundantly reinstalled.
                  </p>
                </div>

                <div className="guide-step-box">
                  <h3 className="guide-step-headline">Custom AWK-Powered Parser</h3>
                  <p className="guide-step-text">
                    DotUp parses YAML manifests using an internal posix-compliant AWK parser—meaning you don't even need <code className="code-pill">yq</code> or Python installed beforehand.
                  </p>
                </div>
              </div>
            </section>
          </AsciiReveal>

          {/* OS Compatibility Matrix */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="Operating Systems" preset="blueprint" />
              </span>
              <h2 className="page-section-title">Supported Platform Matrix</h2>
              <p className="page-section-desc">
                DotUp's Platform Context abstraction dynamically adapts package manager operations to your active Linux distribution:
              </p>
            </div>

            <div className="os-matrix-grid">
              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Ubuntu Linux</span>
                  <span className="os-status-pill os-status-tier1">Tier 1 · Native</span>
                </div>
                <p className="os-notes">Ubuntu 20.04 LTS, 22.04 LTS, and 24.04 LTS with full APT repository, PPA, and deb package integration.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Debian GNU/Linux</span>
                  <span className="os-status-pill os-status-tier1">Tier 1 · Native</span>
                </div>
                <p className="os-notes">Debian 11 (Bullseye) and Debian 12 (Bookworm) with native APT backend and automated keyrings.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Pop!_OS &amp; Mint</span>
                  <span className="os-status-pill os-status-tier1">Tier 1 · Native</span>
                </div>
                <p className="os-notes">Fully supported via the Debian/Ubuntu platform context with desktop integration.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Fedora Linux</span>
                  <span className="os-status-pill os-status-tier2">Tier 2 · DNF</span>
                </div>
                <p className="os-notes">Core packages, git, zsh, compilers, and runtimes routed natively through DNF.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Arch Linux</span>
                  <span className="os-status-pill os-status-tier2">Tier 2 · Pacman</span>
                </div>
                <p className="os-notes">System utilities, shells, and runtimes routed natively through Pacman.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">macOS / Windows</span>
                  <span className="os-status-pill os-status-unsupported">Roadmap</span>
                </div>
                <p className="os-notes">Currently not supported. Homebrew orchestrator planned for future v3.x releases.</p>
              </div>
            </div>
          </section>

          {/* Bottom Call to Action */}
          <div className="hero-ascii-frame" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <h2 className="hero-headline" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              <AsciiRevealText text="Ready to Configure Your Workstation?" preset="decode" />
            </h2>
            <p className="hero-lead" style={{ margin: '0 auto 1.5rem auto' }}>
              Jump into the visual configurator, pick your tools, and generate your custom workstation manifest in seconds.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/" className="btn-hero-primary">
                <AsciiGlitchText text="Launch Configurator" />
                <span>→</span>
              </Link>
              <a
                href="https://github.com/itsadityaraj/DotUp"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-secondary"
              >
                <AsciiGlitchText text="Star on GitHub" />
                <ExternalLinkIcon size={12} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

