'use client';

import React, { useState } from 'react';
import { BookOpenIcon, HeartIcon, ExternalLinkIcon, CheckIcon, XIcon } from './Icons';

interface NavbarProps {
  backendStatus: string;
  databaseStatus: string;
}

export default function Navbar({ backendStatus, databaseStatus }: NavbarProps) {
  const [activeModal, setActiveModal] = useState<'how-to-use' | 'about' | 'developer' | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <header className="ascii-navbar">
        {/* Left Side: Brand Logo with gradient border + horizontal links */}
        <div className="navbar-left">
          <a href="#" className="navbar-brand-link">
            {/* Prismatic square icon matching uploaded image 1 */}
            <div className="brand-prismatic-box" aria-hidden="true">
              <span className="brand-inner-glow" />
            </div>
            <span className="brand-title">dotup</span>
            <span className="brand-version-tag">v3.0 · open source</span>
          </a>

          <nav className="navbar-nav-links" aria-label="Main Navigation">
            <a href="#" className="nav-link nav-link-active">
              Home
            </a>
            <button
              type="button"
              onClick={() => setActiveModal('how-to-use')}
              className="nav-link"
            >
              How to Use
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="nav-link"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('developer')}
              className="nav-link"
            >
              Meet the Developer
            </button>
          </nav>
        </div>

        {/* Right Side: GitHub Pill & System Status */}
        <div className="navbar-right">
          <div className="navbar-status-group" aria-label="System status">
            <div className="status-pill-nav" title="Frontend UI">
              <span className="status-nav-dot status-nav-dot-green" />
              <span>UI: active</span>
            </div>

            <div className="status-pill-nav" title="Backend API">
              <span
                className={`status-nav-dot ${
                  backendStatus === 'ok' ? 'status-nav-dot-green' : 'status-nav-dot-amber'
                }`}
              />
              <span>API: {backendStatus}</span>
            </div>

            <div className="status-pill-nav" title="Database status">
              <span
                className={`status-nav-dot ${
                  databaseStatus === 'ok' ? 'status-nav-dot-green' : 'status-nav-dot-amber'
                }`}
              />
              <span>DB: {databaseStatus}</span>
            </div>
          </div>

          <a
            href="https://github.com/itsadityaraj/DotUp"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-github-pill"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Info Modals */}
      {activeModal && (
        <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                {activeModal === 'how-to-use' && (
                  <>
                    <div className="modal-icon-badge">
                      <BookOpenIcon size={18} />
                    </div>
                    <div>
                      <h2 className="modal-heading">How to Use DotUp</h2>
                      <p className="modal-subheading">From zero to fully configured workstation</p>
                    </div>
                  </>
                )}
                {activeModal === 'about' && (
                  <>
                    <div className="modal-icon-badge">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="modal-heading">About DotUp V3</h2>
                      <p className="modal-subheading">Next-generation declarative workstation configuration</p>
                    </div>
                  </>
                )}
                {activeModal === 'developer' && (
                  <>
                    <div className="modal-icon-badge">
                      <HeartIcon size={18} />
                    </div>
                    <div>
                      <h2 className="modal-heading">Meet the Developer</h2>
                      <p className="modal-subheading">Crafted with passion for developer experience</p>
                    </div>
                  </>
                )}
              </div>
              <button type="button" onClick={closeModal} className="modal-close-btn" aria-label="Close modal">
                <XIcon size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              {activeModal === 'how-to-use' && (
                <div className="how-to-use-guide">
                  <div className="guide-step-card">
                    <div className="guide-step-number">1</div>
                    <div className="guide-step-info">
                      <h4>Pick an Environment Preset or Custom</h4>
                      <p>
                        Choose from pre-tuned developer baselines like Minimal Base, Frontend Web, Backend Dev, DevOps, or click <strong>Custom Stack</strong> to pick individual runtimes and tools.
                      </p>
                    </div>
                  </div>

                  <div className="guide-step-card">
                    <div className="guide-step-number">2</div>
                    <div className="guide-step-info">
                      <h4>Configure Tool Versions</h4>
                      <p>
                        Select precise versions for languages and compilers (Node.js LTS, Python 3.11, OpenJDK 17/21).
                      </p>
                    </div>
                  </div>

                  <div className="guide-step-card">
                    <div className="guide-step-number">3</div>
                    <div className="guide-step-info">
                      <h4>Execute Command or Download YAML</h4>
                      <p>
                        Click <strong>Copy Command</strong> at the bottom of the screen to bootstrap immediately in your shell, or <strong>Download YAML</strong> to check <code className="code-pill">setup.yaml</code> into your repository.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'about' && (
                <div className="about-modal-content">
                  <p className="about-lead">
                    DotUp is an open-source, reproducible developer environment configuration engine designed to eliminate the &quot;works on my machine&quot; friction once and for all.
                  </p>
                  <div className="about-features-grid">
                    <div className="about-feat-item">
                      <h5>Idempotent Execution</h5>
                      <p>Runs cleanly without overriding existing configurations or breaking active installations.</p>
                    </div>
                    <div className="about-feat-item">
                      <h5>Declarative V3 YAML</h5>
                      <p>Spec-driven architecture versionable with Git for individuals and engineering teams.</p>
                    </div>
                    <div className="about-feat-item">
                      <h5>Cross-Platform Support</h5>
                      <p>Native installation paths across Ubuntu, Debian, Arch Linux, and macOS environments.</p>
                    </div>
                    <div className="about-feat-item">
                      <h5>Zero-Friction Bootstrap</h5>
                      <p>One terminal command checks preconditions, resolves dependencies, and boots your workstation.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'developer' && (
                <div className="developer-profile-card">
                  <div className="dev-avatar-row">
                    <div className="dev-avatar">
                      <span>AR</span>
                    </div>
                    <div className="dev-intro">
                      <h3 className="dev-name">Aditya Raj</h3>
                      <span className="dev-role">Full-Stack Engineer & Systems Architect</span>
                      <p className="dev-bio">
                        Building high-performance developer tooling, distributed engines, and intuitive user experiences.
                      </p>
                    </div>
                  </div>

                  <div className="dev-links-row">
                    <a
                      href="https://github.com/itsadityaraj"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dev-social-link"
                    >
                      <span>GitHub</span>
                      <ExternalLinkIcon size={12} />
                    </a>
                    <a
                      href="https://linkedin.com/in/aditya-raj-developer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dev-social-link"
                    >
                      <span>LinkedIn</span>
                      <ExternalLinkIcon size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={closeModal} className="btn-modal-done">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
