'use client';

import React, { useState } from 'react';
import { RotateCcwIcon, CheckIcon, AlertCircleIcon } from './Icons';

interface TopNavbarProps {
  setupId: string;
  setupVersion: string;
  isValid: boolean;
  issueCount: number;
  onOpenCodeView: () => void;
  onResetSetup: () => void;
  backendStatus?: string;
  databaseStatus?: string;
}

export default function TopNavbar({
  setupId,
  setupVersion,
  isValid,
  issueCount,
  onOpenCodeView,
  onResetSetup,
  backendStatus = 'ok',
  databaseStatus = 'ok'
}: TopNavbarProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    onResetSetup();
    setShowResetConfirm(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          {/* Brand Identity */}
          <div className="navbar-brand">
            <div className="brand-logo" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="brand-text-block">
              <span className="brand-title">DotUp</span>
              <span className="brand-badge-v3">V3</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="navbar-links" aria-label="Main navigation">
            <button
              type="button"
              className={`nav-link-btn ${activeModal === 'about' ? 'active' : ''}`}
              onClick={() => setActiveModal(activeModal === 'about' ? null : 'about')}
            >
              About
            </button>
            <button
              type="button"
              className={`nav-link-btn ${activeModal === 'how' ? 'active' : ''}`}
              onClick={() => setActiveModal(activeModal === 'how' ? null : 'how')}
            >
              How to Use
            </button>
            <button
              type="button"
              className={`nav-link-btn ${activeModal === 'policy' ? 'active' : ''}`}
              onClick={() => setActiveModal(activeModal === 'policy' ? null : 'policy')}
            >
              Policy
            </button>
            <button
              type="button"
              className={`nav-link-btn ${activeModal === 'developer' ? 'active' : ''}`}
              onClick={() => setActiveModal(activeModal === 'developer' ? null : 'developer')}
            >
              Meet Developer
            </button>
          </nav>
        </div>

        <div className="navbar-right">
          {/* Status Badge */}
          <div className="navbar-status-badge">
            {isValid ? (
              <span className="status-pill status-pill-success">
                <CheckIcon size={12} /> Valid Spec
              </span>
            ) : (
              <span className="status-pill status-pill-warning">
                <AlertCircleIcon size={12} /> {issueCount} issue{issueCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Reset Setup Button / Confirm */}
          {showResetConfirm ? (
            <div className="reset-confirm-inline" role="alert">
              <span>Reset?</span>
              <button type="button" onClick={handleReset} className="btn-danger-xs">
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="btn-ghost-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="btn-ghost-nav"
              title="Reset configuration to default preset"
            >
              <RotateCcwIcon size={13} />
              <span>Reset</span>
            </button>
          )}

          {/* Code View Action Button */}
          <button
            type="button"
            onClick={onOpenCodeView}
            className="btn-code-view"
            title="Inspect generated Canonical YAML & CLI Command"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Code View</span>
          </button>
        </div>
      </header>

      {/* Info Modals / Popups */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {activeModal === 'about' && 'About DotUp V3'}
                {activeModal === 'how' && 'How to Use DotUp'}
                {activeModal === 'policy' && 'Policy & Standards'}
                {activeModal === 'developer' && 'Meet the Developer'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {activeModal === 'about' && (
                <div className="modal-prose">
                  <p>
                    <strong>DotUp V3</strong> is a declarative, reproducible development environment engine for Linux and macOS.
                  </p>
                  <p>
                    It unifies system packages, runtimes, container engines, editors, and terminal productivity into an idempotent, self-contained installation specification.
                  </p>
                  <p>
                    The 3D voxel tree visualizer provides an immersive representation of your configured environment, growing foliage across spatial category regions as you curate your stack.
                  </p>
                </div>
              )}

              {activeModal === 'how' && (
                <div className="modal-prose">
                  <ol>
                    <li><strong>Choose a Preset or Custom Modules:</strong> Use the left sidebar to toggle tools, specify runtime versions, and name your setup profile.</li>
                    <li><strong>Inspect the 3D Tree:</strong> Drag horizontally to rotate the tree. Watch foliage appear in the designated category canopies.</li>
                    <li><strong>Export Your Specification:</strong> Click <em>Copy Command</em> for a self-bootstrapping one-liner, or <em>Download YAML</em> for git-tracked dotfile automation.</li>
                    <li><strong>Run on Your System:</strong> Execute the generated script in your terminal to bootstrap your environment idempotently.</li>
                  </ol>
                </div>
              )}

              {activeModal === 'policy' && (
                <div className="modal-prose">
                  <p><strong>Idempotency & Safety:</strong> DotUp installation scripts adhere to strict POSIX safety guidelines. Scripts never overwrite existing SSH keys, shell profiles, or user data without explicit non-destructive guards.</p>
                  <p><strong>Privacy:</strong> Configuration generation happens 100% locally in your browser. No private environment tokens or secrets are transmitted or stored remotely.</p>
                </div>
              )}

              {activeModal === 'developer' && (
                <div className="modal-prose">
                  <p><strong>Lead Architect:</strong> Aditya Raj</p>
                  <p>
                    DotUp was designed to eliminate hours of fragile manual machine setup and replace it with a reliable, declarative, and delightful developer experience.
                  </p>
                  <div className="modal-badge-group">
                    <span className="badge-pill">Open Source</span>
                    <span className="badge-pill">TypeScript</span>
                    <span className="badge-pill">Three.js</span>
                    <span className="badge-pill">FastAPI</span>
                    <span className="badge-pill">Bash Engine</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setActiveModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
