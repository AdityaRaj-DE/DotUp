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
  ExternalLinkIcon,
  LayersIcon,
  CodeIcon
} from '../../components/Icons';

export const metadata = {
  title: 'How to Use DotUp - Workstation Setup Guide',
  description: 'Step-by-step instructions for configuring and provisioning your developer environment using the Web Configurator and the CLI.'
};

export default function HowToUsePage() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <div className="page-content-flow">
          {/* Hero Section */}
          <div className="hero-ascii-frame">
            <span className="crosshair crosshair-tl" />
            <span className="crosshair crosshair-tr" />
            <span className="crosshair crosshair-bl" />
            <span className="crosshair crosshair-br" />

            <div className="hero-top-row">
              <div className="hero-pill-badge">
                <span className="badge-new">GUIDE</span>
                <span>Workstation Setup &amp; Execution</span>
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
              Two ways to provision your machine: configure visually in your browser with instant command generation, or write a YAML spec and run through the terminal CLI.
            </p>
          </div>

          {/* METHOD 1: Web Frontend Configurator */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="Method 1 · Recommended" preset="blueprint" />
              </span>
              <h2 className="page-section-title">
                <AsciiRevealText text="Using the Web Configurator (Visual UI)" preset="decode" speed={16} />
              </h2>
              <p className="page-section-desc">
                The fastest way to set up. Choose your tools in the browser, copy the generated command, and run it directly in your terminal.
              </p>
            </div>

            <div className="vertical-steps-list">
              <div className="vertical-step-row">
                <div className="vertical-step-badge-col">
                  <span className="guide-step-pill">STEP 1</span>
                  <span className="guide-step-category">Selection</span>
                </div>
                <div className="vertical-step-content">
                  <h3 className="guide-step-headline">Pick a Preset or Choose Custom</h3>
                  <p className="guide-step-text">
                    Go to the Home page. Click one of the curated presets (<strong>Minimal Base</strong>, <strong>Frontend Web</strong>, <strong>Backend Dev</strong>, <strong>DevOps &amp; Cloud</strong>, or <strong>Full Suite</strong>) to auto-fill common tools, or click <strong>Custom Stack</strong> to choose packages individually.
                  </p>
                </div>
              </div>

              <div className="vertical-step-row">
                <div className="vertical-step-badge-col">
                  <span className="guide-step-pill">STEP 2</span>
                  <span className="guide-step-category">Options</span>
                </div>
                <div className="vertical-step-content">
                  <h3 className="guide-step-headline">Toggle Modules &amp; Select Versions</h3>
                  <p className="guide-step-text">
                    In Custom mode, click any module card to enable or disable it. For tools with multiple versions (like Node.js, Python, or OpenJDK), use the dropdown to pin the exact version you want.
                  </p>
                </div>
              </div>

              <div className="vertical-step-row">
                <div className="vertical-step-badge-col">
                  <span className="guide-step-pill">STEP 3</span>
                  <span className="guide-step-category">Export</span>
                </div>
                <div className="vertical-step-content">
                  <h3 className="guide-step-headline">Copy Command or Download YAML</h3>
                  <p className="guide-step-text">
                    Look at the bottom floating dock bar:
                    <br />
                    • Click <strong>Copy Command</strong> to copy the ready-to-run terminal snippet.
                    <br />
                    • Or click <strong>Download YAML</strong> to save <code className="code-pill">setup.yaml</code> to your project or dotfiles repo.
                  </p>
                </div>
              </div>

              <div className="vertical-step-row">
                <div className="vertical-step-badge-col">
                  <span className="guide-step-pill">STEP 4</span>
                  <span className="guide-step-category">Terminal</span>
                </div>
                <div className="vertical-step-content">
                  <h3 className="guide-step-headline">Paste &amp; Run in Your Terminal</h3>
                  <p className="guide-step-text">
                    Open your Linux terminal, paste the copied command, and press Enter. The script writes your configuration and runs the setup automatically.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* METHOD 2: Terminal CLI Documentation Link */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="Method 2 · CLI &amp; Dotfiles" preset="blueprint" />
              </span>
              <h2 className="page-section-title">
                <AsciiRevealText text="Using the Command Line Interface (CLI)" preset="decode" speed={16} />
              </h2>
              <p className="page-section-desc">
                Prefer managing your workstation directly via terminal scripts, writing custom YAML manifests, or integrating with your dotfiles repo? All CLI commands, options (<code className="code-pill">--plan</code>, <code className="code-pill">doctor</code>, <code className="code-pill">repair</code>), and sample configurations are fully documented in our GitHub repository.
              </p>
            </div>

            <AsciiReveal preset="blueprint" duration={480}>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <a
                  href="https://github.com/AdityaRaj-DE/DotUp#how-to-use-it-dotupyaml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-primary"
                >
                  <AsciiGlitchText text="Read CLI Documentation on GitHub" />
                  <ExternalLinkIcon size={12} />
                </a>
                <a
                  href="https://github.com/AdityaRaj-DE/DotUp/tree/main/examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-secondary"
                >
                  <AsciiGlitchText text="View Example Configurations" />
                  <ExternalLinkIcon size={12} />
                </a>
              </div>
            </AsciiReveal>
          </section>

          {/* OS Support Matrix */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="Compatibility" preset="blueprint" />
              </span>
              <h2 className="page-section-title">Supported Operating Systems</h2>
              <p className="page-section-desc">
                DotUp works across popular Linux distributions:
              </p>
            </div>

            <div className="os-matrix-grid">
              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Ubuntu Linux</span>
                  <span className="os-status-pill os-status-tier1">Supported · APT</span>
                </div>
                <p className="os-notes">Ubuntu 20.04 LTS, 22.04 LTS, and 24.04 LTS.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Debian GNU/Linux</span>
                  <span className="os-status-pill os-status-tier1">Supported · APT</span>
                </div>
                <p className="os-notes">Debian 11 (Bullseye) and Debian 12 (Bookworm).</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Pop!_OS &amp; Linux Mint</span>
                  <span className="os-status-pill os-status-tier1">Supported · APT</span>
                </div>
                <p className="os-notes">Fully supported with desktop and shell tools.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Fedora Linux</span>
                  <span className="os-status-pill os-status-tier2">Supported · DNF</span>
                </div>
                <p className="os-notes">Core developer packages, git, zsh, compilers, and runtimes via DNF.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">Arch Linux</span>
                  <span className="os-status-pill os-status-tier2">Supported · Pacman</span>
                </div>
                <p className="os-notes">System utilities, shells, and runtimes via Pacman.</p>
              </div>

              <div className="os-matrix-card">
                <div className="os-matrix-header">
                  <span className="os-name">macOS / Windows</span>
                  <span className="os-status-pill os-status-unsupported">Roadmap</span>
                </div>
                <p className="os-notes">Currently not supported. Homebrew integration planned for future releases.</p>
              </div>
            </div>
          </section>

          {/* Bottom Call to Action */}
          <div className="hero-ascii-frame" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <h2 className="hero-headline" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              <AsciiRevealText text="Ready to Configure Your Workstation?" preset="decode" />
            </h2>
            <p className="hero-lead" style={{ margin: '0 auto 1.5rem auto' }}>
              Jump into the visual configurator, pick your tools, and generate your setup command in seconds.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/" className="btn-hero-primary">
                <AsciiGlitchText text="Launch Configurator" />
                <span>→</span>
              </Link>
              <a
                href="https://github.com/AdityaRaj-DE/DotUp"
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
