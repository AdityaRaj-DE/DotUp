'use client';

import React from 'react';
import { InfoSectionType } from './InfoModal';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInfoSection: (sec: InfoSectionType) => void;
  setupId: string;
  setSetupId: (id: string) => void;
  setupVersion: string;
  setSetupVersion: (ver: string) => void;
  reducedMotion: boolean;
  setReducedMotion: (rm: boolean) => void;
}

export default function NavigationDrawer({
  isOpen,
  onClose,
  onOpenInfoSection,
  setupId,
  setSetupId,
  setupVersion,
  setSetupVersion,
  reducedMotion,
  setReducedMotion
}: NavigationDrawerProps) {
  return (
    <>
      <div
        id="drawer-backdrop"
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside
        id="side-drawer"
        className={`side-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Site Navigation"
      >
        <div className="drawer-header-brand">
          <div className="brand-wordmark">
            <span className="brand-leaf" />
            <span>DotUp Sanctuary</span>
          </div>
          <span className="drawer-sub">Workstation Architect</span>
        </div>

        <nav className="drawer-nav">
          <button
            className="drawer-item"
            onClick={() => {
              onOpenInfoSection('about');
              onClose();
            }}
          >
            <div className="drawer-item-left">
              <span className="drawer-icon">🌿</span>
              <span>About DotUp</span>
            </div>
            <span className="drawer-arrow">→</span>
          </button>

          <button
            className="drawer-item"
            onClick={() => {
              onOpenInfoSection('howto');
              onClose();
            }}
          >
            <div className="drawer-item-left">
              <span className="drawer-icon">🧭</span>
              <span>How to Use</span>
            </div>
            <span className="drawer-arrow">→</span>
          </button>

          <button
            className="drawer-item"
            onClick={() => {
              onOpenInfoSection('policy');
              onClose();
            }}
          >
            <div className="drawer-item-left">
              <span className="drawer-icon">🛡️</span>
              <span>Policy & Security</span>
            </div>
            <span className="drawer-arrow">→</span>
          </button>

          <button
            className="drawer-item"
            onClick={() => {
              onOpenInfoSection('developer');
              onClose();
            }}
          >
            <div className="drawer-item-left">
              <span className="drawer-icon">👨‍💻</span>
              <span>Meet Developer</span>
            </div>
            <span className="drawer-arrow">→</span>
          </button>
        </nav>

        <div className="drawer-spec-box">
          <label htmlFor="spec-id-input">Workstation Metadata</label>
          <input
            id="spec-id-input"
            className="drawer-spec-input"
            type="text"
            value={setupId}
            onChange={(e) => setSetupId(e.target.value)}
            placeholder="Setup ID"
          />
          <input
            id="spec-ver-input"
            className="drawer-spec-input"
            type="text"
            value={setupVersion}
            onChange={(e) => setSetupVersion(e.target.value)}
            placeholder="Version"
          />
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 4,
              cursor: 'pointer'
            }}
          >
            <span>Reduced Motion</span>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              style={{ accentColor: 'var(--emerald-primary)', width: 16, height: 16 }}
            />
          </label>
        </div>
      </aside>
    </>
  );
}
