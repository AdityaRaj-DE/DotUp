'use client';

import React, { useState } from 'react';

interface ActionDocksProps {
  activeToolCount: number;
  onCopyCommand: () => void;
  onDownloadYaml: () => void;
  onOpenCodeView: () => void;
  onResetView: () => void;
  onResetAll: () => void;
}

export default function ActionDocks({
  activeToolCount,
  onCopyCommand,
  onDownloadYaml,
  onOpenCodeView,
  onResetView,
  onResetAll
}: ActionDocksProps) {
  const [isResetAllAnimating, setIsResetAllAnimating] = useState(false);
  const [isResetViewAnimating, setIsResetViewAnimating] = useState(false);

  const handleResetAllClick = () => {
    setIsResetAllAnimating(true);
    onResetAll();
    setTimeout(() => {
      setIsResetAllAnimating(false);
    }, 950);
  };

  const handleResetViewClick = () => {
    setIsResetViewAnimating(true);
    onResetView();
    setTimeout(() => {
      setIsResetViewAnimating(false);
    }, 950);
  };

  return (
    <>
      {/* BOTTOM-LEFT: Copy Command / Download YAML / Code View */}
      <footer className="bottom-left-dock lush-glass">
        <div className="dock-counter">
          <span className="status-dot" />
          <span>
            <strong id="dock-tool-count">{activeToolCount}</strong> tools
          </span>
        </div>
        <button id="btn-copy-cmd" className="btn btn-primary" onClick={onCopyCommand}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy Command</span>
        </button>
        <button id="btn-download-yaml" className="btn" onClick={onDownloadYaml}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download YAML</span>
        </button>
        <button id="btn-code-view" className="btn" onClick={onOpenCodeView}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Code View</span>
        </button>
      </footer>

      {/* BOTTOM-RIGHT: Reset View & Reset All with Tactile Shrink & Rotation Animation */}
      <div className="bottom-right-dock lush-glass">
        <button
          id="btn-reset-view"
          className={`btn btn-reset ${isResetViewAnimating ? 'animating-reset' : ''}`}
          title="Reset 3D Camera Angle & Turntable Rotation"
          onClick={handleResetViewClick}
        >
          <svg
            className={`reset-icon ${isResetViewAnimating ? 'spinning' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Reset View</span>
        </button>

        <button
          id="btn-reset-all"
          className={`btn btn-reset ${isResetAllAnimating ? 'animating-reset' : ''}`}
          title="Restore Full Suite Preset, Shrink Pulse, and Turntable Orbit"
          onClick={handleResetAllClick}
        >
          <svg
            className={`reset-icon ${isResetAllAnimating ? 'spinning' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span>Reset</span>
        </button>
      </div>
    </>
  );
}
