import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AsciiReveal from '../../components/AsciiReveal';
import AsciiRevealText from '../../components/AsciiRevealText';
import {
  SparklesIcon,
  LayersIcon,
  GearIcon,
  TerminalIcon,
  CodeIcon,
  CloudIcon,
  ExternalLinkIcon
} from '../../components/Icons';

export const metadata = {
  title: 'About DotUp - Declarative Workstation Engine',
  description: 'Learn about the declarative state difference engine, package abstraction model, and security architecture powering DotUp.'
};

export default function AboutPage() {
  const asciiArch = `  +-------------------------------------------------------+
  |              DOTUP DECLARATIVE ARCHITECTURE           |
  +-------------------------------------------------------+
                            |
                     [ dotup.yaml ]
               (AWK-based schema-1 parser)
                            |
                            v
               +--------------------------+
               |   CLI / Bootstrap Flow   |
               | (curl | bash, user-space)|
               +--------------------------+
                            |
                            v
               +--------------------------+
               |       Orchestrator       |
               +--------------------------+
                /           |            \\
               v            v             v
       +-------------+ +-------------+ +-------------+
       |   Platform  | |   State     | |   Module    |
       |   Context   | |   Engine    | |  Registry   |
       | (lib/os.sh) | |(diff desired| |(system, git,|
       |             | |  vs actual) | | node, etc.) |
       +-------------+ +-------------+ +-------------+
               \\            |            /
                v           v           v
               +--------------------------+
               |    Package Abstraction   |
               | (pkg_install, pkg_update)|
               +--------------------------+
                /           |            \\
               v            v             v
          [ APT ]        [ DNF ]      [ Pacman ]
       (Ubuntu/Debian)  (Fedora)        (Arch)`;

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
                <span>Platform Architecture &amp; Engineering Mission</span>
              </div>

              <div className="hero-actions-right">
                <Link href="/" className="btn-hero-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}>
                  <span>Configure Stack</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <h1 className="hero-headline">
              <AsciiRevealText text="About DotUp V3" preset="decode" speed={16} />
            </h1>
            <p className="hero-lead">
              DotUp is an open-source, reproducible developer environment configuration engine designed to eliminate the &ldquo;works on my machine&rdquo; friction once and for all. It transforms hours of manual computer setup into a single, idempotent specification.
            </p>
          </div>

          {/* Architecture ASCII Blueprint */}
          <AsciiReveal preset="blueprint" duration={520}>
            <section className="page-section-card" data-ascii="surface">
              <div className="page-section-header">
                <span className="page-section-tagline">
                  <AsciiRevealText text="System Blueprint" preset="blueprint" />
                </span>
                <h2 className="page-section-title">Declarative State Difference Engine</h2>
                <p className="page-section-desc">
                  Unlike traditional shell setup scripts that blindly execute commands, DotUp treats your computer as a state machine. It queries your active platform context, diffs desired state against actual state, and executes only necessary mutations.
                </p>
              </div>

              <pre className="arch-diagram-block" aria-label="DotUp Architecture Diagram">
                {asciiArch}
              </pre>
            </section>
          </AsciiReveal>

          {/* Core Architectural Pillars */}
          <AsciiReveal preset="decode" duration={550}>
            <section className="page-section-card" data-ascii="surface">
              <div className="page-section-header">
                <span className="page-section-tagline">
                  <AsciiRevealText text="Core Engineering Pillars" preset="blueprint" />
                </span>
                <h2 className="page-section-title">Engineered for Reliability &amp; Speed</h2>
                <p className="page-section-desc">
                  Designed from the ground up for software developers, DevOps engineers, and Linux enthusiasts:
                </p>
              </div>

              <div className="feature-cards-grid">
                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">PILLAR 1</span>
                    <span className="guide-step-category">Idempotency</span>
                  </div>
                  <h3 className="guide-step-headline">Zero Drift, Pure Idempotency</h3>
                  <p className="guide-step-text">
                    Run DotUp as many times as you want. DotUp tests preconditions and inspects binaries before touching the filesystem. If Node.js 20 or Git is already configured, it cleanly skips them.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">PILLAR 2</span>
                    <span className="guide-step-category">Abstraction</span>
                  </div>
                  <h3 className="guide-step-headline">Package Manager Abstraction</h3>
                  <p className="guide-step-text">
                    Modules express requirements generically via <code className="code-pill">pkg_install curl</code>. The internal platform context handles mapping requests to <code className="code-pill">apt</code>, <code className="code-pill">dnf</code>, or <code className="code-pill">pacman</code> under the hood.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">PILLAR 3</span>
                    <span className="guide-step-category">Security</span>
                  </div>
                  <h3 className="guide-step-headline">Privilege Isolation &amp; Least Sudo</h3>
                  <p className="guide-step-text">
                    DotUp rejects running the main orchestrator as root. Sudo escalation is restricted exclusively to specific package installations, protecting user-space configs, shell profiles, and Git credentials.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">PILLAR 4</span>
                    <span className="guide-step-category">Self-Healing</span>
                  </div>
                  <h3 className="guide-step-headline">Self-Healing Capabilities</h3>
                  <p className="guide-step-text">
                    Accidentally delete a tool or break a symlink? Running <code className="code-pill">dotup repair</code> diagnoses environmental issues and restores your workstation to the declarative spec.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">PILLAR 5</span>
                    <span className="guide-step-category">Dry-Run</span>
                  </div>
                  <h3 className="guide-step-headline">Pre-Execution Planning</h3>
                  <p className="guide-step-text">
                    With the <code className="code-pill">--plan</code> flag, DotUp details every step it intends to take before executing, giving you total transparency over system modifications.
                  </p>
                </div>

                <div className="guide-step-box">
                  <div className="guide-step-badge-row">
                    <span className="guide-step-pill">PILLAR 6</span>
                    <span className="guide-step-category">Portability</span>
                  </div>
                  <h3 className="guide-step-headline">No External Dependencies</h3>
                  <p className="guide-step-text">
                    DotUp requires only POSIX-standard utilities (sh, awk, tar, curl). You don't need Python, Node, Ansible, or external package managers pre-installed just to set up your computer.
                  </p>
                </div>
              </div>
            </section>
          </AsciiReveal>

          {/* Open Source & Community */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="Community" preset="blueprint" />
              </span>
              <h2 className="page-section-title">Open Source Philosophy</h2>
              <p className="page-section-desc">
                DotUp is free, open source software under the MIT License. We believe that developer workstations should belong entirely to developers—reproducible, transparent, and devoid of proprietary lock-in.
              </p>
            </div>

            <div className="dev-stats-row">
              <div className="dev-stat-card">
                <span className="dev-stat-number">100%</span>
                <span className="dev-stat-label">Open Source (MIT)</span>
              </div>
              <div className="dev-stat-card">
                <span className="dev-stat-number">10+</span>
                <span className="dev-stat-label">Pre-configured Modules</span>
              </div>
              <div className="dev-stat-card">
                <span className="dev-stat-number">5</span>
                <span className="dev-stat-label">Supported Linux Distros</span>
              </div>
              <div className="dev-stat-card">
                <span className="dev-stat-number">0</span>
                <span className="dev-stat-label">External Dependencies</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href="https://github.com/itsadityaraj/DotUp"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-primary"
              >
                <span>View Source on GitHub</span>
                <ExternalLinkIcon size={12} />
              </a>
              <Link href="/how-to-use" className="btn-hero-secondary">
                <span>Read the Workflow Guide</span>
                <span>→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

