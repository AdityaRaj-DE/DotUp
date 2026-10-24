import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AsciiRevealText from '../../components/AsciiRevealText';
import AsciiGlitchText from '../../components/AsciiGlitchText';
import {
  HeartIcon,
  ExternalLinkIcon,
  CodeIcon,
  TerminalIcon,
  LayersIcon,
  SparklesIcon
} from '../../components/Icons';

export const metadata = {
  title: 'Meet the Developer - Aditya Raj | DotUp',
  description: 'Meet Aditya Raj, creator and lead maintainer of DotUp, building high-performance developer tooling and declarative systems.'
};

export default function MeetTheDeveloperPage() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <div className="page-content-flow">
          {/* Hero Section with Corner Crosshairs & Developer Avatar */}
          <div className="hero-ascii-frame">
            <span className="crosshair crosshair-tl" />
            <span className="crosshair crosshair-tr" />
            <span className="crosshair crosshair-bl" />
            <span className="crosshair crosshair-br" />

            <div className="hero-top-row">
              <div className="hero-pill-badge">
                <span className="badge-new">Creator</span>
                <span>Crafted with passion for developer experience</span>
              </div>

              <div className="hero-actions-right">
                <Link href="/" className="btn-hero-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}>
                  <AsciiGlitchText text="Configure Stack" />
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="dev-hero-container">
              <div className="dev-avatar-giant" aria-label="Aditya Raj profile monogram">
                <span>AR</span>
              </div>

              <div className="dev-hero-meta">
                <span className="dev-hero-title">Full-Stack Engineer &amp; Systems Architect</span>
                <h1 className="dev-hero-name">
                  <AsciiRevealText text="Aditya Raj" preset="decode" speed={16} />
                </h1>
                <p className="dev-hero-lead">
                  Building high-performance developer tooling, distributed engines, and intuitive user experiences. Passionate about Linux internals, declarative infrastructure, and elegant terminal ergonomics.
                </p>

                <div className="dev-hero-buttons">
                  <a
                    href="https://github.com/AdityaRaj-DE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hero-primary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <AsciiGlitchText text="GitHub (@AdityaRaj-DE)" />
                    <ExternalLinkIcon size={12} />
                  </a>

                  <a
                    href="https://linkedin.com/in/aditya-raj-developer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hero-secondary"
                  >
                    <AsciiGlitchText text="LinkedIn" />
                    <ExternalLinkIcon size={12} />
                  </a>

                  <a
                    href="https://github.com/AdityaRaj-DE/DotUp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hero-secondary"
                  >
                    <AsciiGlitchText text="Star DotUp" />
                    <span>★</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Motivation & Why DotUp Was Built */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="The Origin Story" preset="blueprint" />
              </span>
              <h2 className="page-section-title">Why I Built DotUp</h2>
              <p className="page-section-desc">
                Developer setup shouldn&apos;t feel like repetitive manual labor.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.65' }}>
              <p>
                As a systems engineer who frequently provisions fresh Linux machines across laptops, workstations, and remote nodes, I found myself repeatedly spending 3 to 4 hours per machine doing the exact same chores:
              </p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#94a3b8' }}>
                <li>Manually downloading tarballs and adding Debian/Ubuntu PPAs.</li>
                <li>Troubleshooting broken GPG keyrings and package manager errors.</li>
                <li>Configuring Zsh frameworks, fonts, and Git credentials from memory.</li>
                <li>Verifying Node.js, Python, and Docker versions across mismatched team environments.</li>
              </ul>
              <p>
                Existing tools either required heavyweight runtimes (Ansible requiring Python before you even have Python installed), or they were brittle shell scripts that crashed halfway through and polluted the system with broken half-installed dependencies.
              </p>
              <p>
                <strong>DotUp</strong> was designed to be the tool I always wanted: zero dependencies outside standard POSIX utilities, pure idempotency so you can run it ten times safely, a clear dry-run preview via <code className="code-pill">--plan</code>, and an intuitive web UI with monospaced precision.
              </p>
            </div>
          </section>

          {/* Technical Specialization & Engineering Principles */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="Craftsmanship &amp; Engineering Focus" preset="blueprint" />
              </span>
              <h2 className="page-section-title">Core Engineering Principles</h2>
              <p className="page-section-desc">
                The technical pillars behind every tool, script, and component in the DotUp ecosystem:
              </p>
            </div>

            <div className="feature-cards-grid">
              <div className="guide-step-box" style={{ userSelect: 'none', cursor: 'default' }}>
                <div className="guide-step-badge-row">
                  <span className="guide-step-pill">SYSTEMS</span>
                  <span className="guide-step-category">Architecture</span>
                </div>
                <h3 className="guide-step-headline">Linux Internals &amp; Automation</h3>
                <p className="guide-step-text">
                  Deep expertise in POSIX shell scripting, package managers (APT, DNF, Pacman), process isolation, systemd, and Linux workstation ergonomics.
                </p>
              </div>

              <div className="guide-step-box" style={{ userSelect: 'none', cursor: 'default' }}>
                <div className="guide-step-badge-row">
                  <span className="guide-step-pill">FRONTEND</span>
                  <span className="guide-step-category">Design</span>
                </div>
                <h3 className="guide-step-headline">High-Fidelity Interface Engineering</h3>
                <p className="guide-step-text">
                  Obsessed with design details: terminal aesthetics, Canvas-driven ASCII wave reveals, glassmorphism, responsive monospaced typography, and zero-jank microinteractions.
                </p>
              </div>

              <div className="guide-step-box" style={{ userSelect: 'none', cursor: 'default' }}>
                <div className="guide-step-badge-row">
                  <span className="guide-step-pill">SECURITY</span>
                  <span className="guide-step-category">Guarantees</span>
                </div>
                <h3 className="guide-step-headline">Pragmatic &amp; Safe Execution</h3>
                <p className="guide-step-text">
                  Refusing to blindly run unknown shell scripts as root. Enforcing cryptographic verification, trap cleanups, and strict principle-of-least-privilege delegation.
                </p>
              </div>
            </div>
          </section>

          {/* Connect & Collaboration */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="Get in Touch" preset="blueprint" />
              </span>
              <h2 className="page-section-title">Connect &amp; Collaborate</h2>
              <p className="page-section-desc">
                Have feedback, ideas for new modules, or interested in collaborating on open-source systems engineering? Let&apos;s build something great together.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="https://github.com/AdityaRaj-DE"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-primary"
              >
                <AsciiGlitchText text="Follow on GitHub" />
                <ExternalLinkIcon size={12} />
              </a>

              <a
                href="https://linkedin.com/in/aditya-raj-developer"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-secondary"
              >
                <AsciiGlitchText text="Connect on LinkedIn" />
                <ExternalLinkIcon size={12} />
              </a>

              <Link href="/" className="btn-hero-secondary">
                <AsciiGlitchText text="Try the Configurator" />
                <span>→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

