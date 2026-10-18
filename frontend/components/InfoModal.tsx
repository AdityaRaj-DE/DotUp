'use client';

import React from 'react';

export type InfoSectionType = 'about' | 'howto' | 'policy' | 'developer';

interface InfoModalProps {
  isOpen: boolean;
  section: InfoSectionType;
  onClose: () => void;
  onSelectSection: (sec: InfoSectionType) => void;
}

const SECTION_TITLES: Record<InfoSectionType, { title: string; subtitle: string; icon: string }> = {
  about: {
    title: 'About DotUp',
    subtitle: 'The Interactive Botanical Developer Workstation Sanctuary',
    icon: '🌿'
  },
  howto: {
    title: 'How to Use DotUp',
    subtitle: 'Quick visual guide to configuring your developer setup',
    icon: '🧭'
  },
  policy: {
    title: 'Policy & Security',
    subtitle: 'Client-side zero-telemetry guarantee and execution security',
    icon: '🛡️'
  },
  developer: {
    title: 'Meet the Developer',
    subtitle: 'Architectural vision and engineering credits',
    icon: '👨‍💻'
  }
};

export default function InfoModal({
  isOpen,
  section,
  onClose,
  onSelectSection
}: InfoModalProps) {
  if (!isOpen) return null;

  const currentMeta = SECTION_TITLES[section] || SECTION_TITLES.about;

  return (
    <div
      id="info-modal"
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modal-card info-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Clean Info Header (NO code tabs, NO copy-code button) */}
        <div className="info-modal-header">
          <div className="info-header-meta">
            <span className="info-header-icon">{currentMeta.icon}</span>
            <div>
              <h2 className="info-modal-title">{currentMeta.title}</h2>
              <p className="info-modal-subtitle">{currentMeta.subtitle}</p>
            </div>
          </div>
          <button
            id="btn-info-modal-close"
            className="btn btn-close-modal"
            onClick={onClose}
            aria-label="Close Information Modal"
          >
            <span>Close (Esc)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Info Navigation Sub-tabs */}
        <div className="info-section-nav">
          {(['about', 'howto', 'policy', 'developer'] as InfoSectionType[]).map((sec) => (
            <button
              key={sec}
              className={`info-nav-tab ${section === sec ? 'active' : ''}`}
              onClick={() => onSelectSection(sec)}
            >
              <span>{SECTION_TITLES[sec].icon}</span>
              <span>{SECTION_TITLES[sec].title.replace('DotUp', '').replace('the', '').trim()}</span>
            </button>
          ))}
        </div>

        {/* Clean Reading Content (Informative prose, clean cards, NO copy-code button) */}
        <div className="info-modal-body">
          {section === 'about' && (
            <div className="info-prose">
              <div className="info-hero-card">
                <h3>A Fresh Vision for Developer Environments</h3>
                <p>
                  DotUp reimagines workstation provisioning through the metaphor of a thriving, sunlit voxel sanctuary tree.
                  Rather than parsing dry configuration files or running opaque shell scripts, developers can cultivate their
                  ideal toolchain visually.
                </p>
              </div>

              <div className="info-grid-2col">
                <div className="info-card">
                  <div className="info-card-header">
                    <span className="info-badge green">Canopy & Trunk</span>
                    <h4>Core Tools & Interfaces</h4>
                  </div>
                  <p>
                    System base packages, Zsh shell customizations, VS Code, Git, and Chrome form the sturdy trunk and
                    canopy boughs of your system.
                  </p>
                </div>

                <div className="info-card">
                  <div className="info-card-header">
                    <span className="info-badge amber">Land & Roots</span>
                    <h4>Runtimes & Cloud Infrastructure</h4>
                  </div>
                  <p>
                    Node.js, Python, Java JDK, Docker Engine, and Google Cloud SDK anchor deeply into the soil and meadow substrate.
                  </p>
                </div>
              </div>

              <div className="info-card">
                <h4>Dynamic 3D Architecture</h4>
                <p>
                  Built with Three.js InstancedMesh for fluid 60fps performance, featuring dynamic celestial sunlight,
                  procedural wooden branches, and zero-latency client-side generation.
                </p>
              </div>
            </div>
          )}

          {section === 'howto' && (
            <div className="info-prose">
              <div className="howto-steps">
                <div className="howto-step-item">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <h4>Spin the 3D Preset Dial</h4>
                    <p>
                      Drag horizontally, scroll your mouse wheel, or use arrow keys on the top-center 3D dial to test
                      curated presets like Full Suite, Minimal, Web Stack, or Data Science.
                    </p>
                  </div>
                </div>

                <div className="howto-step-item">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <h4>Customize Your Modules</h4>
                    <p>
                      Click <strong>Customize Stack</strong> or select <strong>CUSTOM</strong> on the dial. The dial will
                      smoothly rotate to CUSTOM, unfolding the interactive Canopy and Root feature columns.
                    </p>
                  </div>
                </div>

                <div className="howto-step-item">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <h4>Interact Directly with the Tree</h4>
                    <p>
                      Hover over any foliage cluster or branch on the 3D sanctuary tree to see its active version.
                      Click on any foliage voxel directly to toggle that module on or off in real-time.
                    </p>
                  </div>
                </div>

                <div className="howto-step-item">
                  <div className="step-num">4</div>
                  <div className="step-content">
                    <h4>Export & Run Anywhere</h4>
                    <p>
                      Use the bottom-left dock to copy your one-line bootstrap command or download your canonical
                      <code>dotup.yaml</code> specification file.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'policy' && (
            <div className="info-prose">
              <div className="info-hero-card">
                <h3>Security & Privacy First</h3>
                <p>
                  DotUp operates on a strict zero-telemetry, zero-backend execution guarantee.
                  All YAML specifications and shell scripts are synthesized locally inside your browser.
                </p>
              </div>

              <div className="info-grid-2col">
                <div className="info-card">
                  <h4>Client-Side Generation</h4>
                  <p>
                    No credentials, workspace details, or environment configurations are ever transmitted to an external server.
                    Everything runs securely in your client sandbox.
                  </p>
                </div>

                <div className="info-card">
                  <h4>Idempotent Scripts</h4>
                  <p>
                    All generated bootstrap commands are strictly idempotent: re-running them will safely update or verify
                    existing installations without breaking existing packages.
                  </p>
                </div>
              </div>

              <div className="info-card">
                <h4>Open Source & Transparent</h4>
                <p>
                  You can inspect the entire generated shell script or YAML structure at any time via the Code View button
                  prior to running on any workstation.
                </p>
              </div>
            </div>
          )}

          {section === 'developer' && (
            <div className="info-prose">
              <div className="info-hero-card">
                <h3>Lead Architect: Aditya Raj</h3>
                <p>
                  Designed and engineered with passion for developer ergonomics, spatial web aesthetics,
                  and tactile user interfaces.
                </p>
              </div>

              <div className="info-grid-2col">
                <div className="info-card">
                  <h4>Core Technologies</h4>
                  <ul className="info-bullet-list">
                    <li>Next.js 14 App Router & React 18</li>
                    <li>Three.js 0.186 with InstancedMesh rendering</li>
                    <li>Procedural 3D voxel tree generation with wooden branches</li>
                    <li>Dynamic celestial lighting and real sunlight bloom</li>
                  </ul>
                </div>

                <div className="info-card">
                  <h4>Design Philosophy</h4>
                  <p>
                    Merging game-inspired voxel art with sunlit minimalist glassmorphism to transform setup configuration
                    from an administrative chore into a delightful aesthetic experience.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clean Info Footer */}
        <div className="info-modal-footer">
          <span className="info-footer-brand">DotUp Sanctuary Edition • Visual Workstation Architect</span>
          <button className="btn btn-primary" onClick={onClose} style={{ height: 34, fontSize: 13 }}>
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
