'use client';

import React, { useState } from 'react';
import { CheckIcon } from './Icons';

interface FloatingActionDockProps {
  onCopyCommand: () => Promise<boolean>;
  onDownloadYaml: () => void;
  isValid: boolean;
  selectedCount: number;
}

export default function FloatingActionDock({
  onCopyCommand,
  onDownloadYaml,
  isValid,
  selectedCount
}: FloatingActionDockProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = async () => {
    const success = await onCopyCommand();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownload = () => {
    onDownloadYaml();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="action-dock-container" role="toolbar" aria-label="Export actions">
      <div className="action-dock-glass">
        {/* Count pill badge */}
        <div className="dock-meta-indicator" aria-hidden="true">
          <span className="dock-status-dot" />
          <span className="dock-count-label">{selectedCount} tools</span>
        </div>

        <div className="dock-divider" aria-hidden="true" />

        {/* Primary Action: Copy Command */}
        <button
          type="button"
          onClick={handleCopy}
          className={`dock-btn-primary ${copied ? 'is-success' : ''}`}
          aria-live="polite"
          title="Copy self-bootstrapping terminal command"
        >
          {copied ? (
            <>
              <CheckIcon size={14} />
              <span>Command Copied</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Command</span>
            </>
          )}
        </button>

        {/* Secondary Action: Download YAML */}
        <button
          type="button"
          onClick={handleDownload}
          className={`dock-btn-secondary ${downloaded ? 'is-success' : ''}`}
          title="Download canonical setup.yaml file"
        >
          {downloaded ? (
            <>
              <CheckIcon size={14} />
              <span>Downloaded</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download YAML</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
