'use client';

import React, { useState } from 'react';
import {
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  LightningIcon,
  FileTextIcon,
  AlertCircleIcon,
  XIcon
} from './Icons';
import { ValidationError } from '../lib/generator';

interface BottomActionBarProps {
  command: string;
  yaml: string;
  setupId: string;
  selectedCount: number;
  isValid: boolean;
  errors: ValidationError[];
}

export default function BottomActionBar({
  command,
  yaml,
  setupId,
  selectedCount,
  isValid,
  errors
}: BottomActionBarProps) {
  const [copiedType, setCopiedType] = useState<'command' | 'yaml' | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [modalTab, setModalTab] = useState<'command' | 'yaml'>('command');

  const handleCopy = async (type: 'command' | 'yaml') => {
    const text = type === 'command' ? command : yaml;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadYaml = () => {
    try {
      const cleanId = (setupId || 'setup').trim().replace(/[^a-zA-Z0-9_-]/g, '-');
      const filename = `${cleanId}.yaml`;
      const blob = new Blob([yaml], { type: 'application/x-yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download YAML', err);
    }
  };

  return (
    <>
      {/* Sticky Bottom Actions Bar */}
      <section className="bottom-action-dock" aria-label="Configuration actions">
        <div className="bottom-action-container">
          {/* Left summary meta */}
          <div className="bottom-meta">
            <div className="bottom-status-indicator">
              <span className={`status-nav-dot ${isValid ? 'status-nav-dot-green' : 'status-nav-dot-amber'}`} />
              <span className="bottom-setup-id">
                {setupId || 'custom-setup'}
              </span>
            </div>
            <div className="bottom-count-tag">
              <strong>{selectedCount}</strong> modules ready
            </div>
            {!isValid && (
              <span className="bottom-warning-text">
                <AlertCircleIcon size={13} /> {errors[0]?.message || 'Please review your selections'}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="bottom-actions-group">
            {/* View Code / Preview Modal Button */}
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="btn-dock-secondary"
              title="View generated install command and YAML specification"
            >
              <EyeIcon size={15} />
              <span>View Code</span>
            </button>

            {/* Download YAML */}
            <button
              type="button"
              onClick={handleDownloadYaml}
              disabled={!isValid}
              className="btn-dock-secondary"
              title="Download dotup setup.yaml specification"
            >
              <DownloadIcon size={15} />
              <span>Download YAML</span>
            </button>

            {/* Quick Copy Command */}
            <button
              type="button"
              onClick={() => handleCopy('command')}
              disabled={!isValid}
              className={`btn-dock-primary ${copiedType === 'command' ? 'btn-copied' : ''}`}
              title="Copy terminal bootstrap command"
            >
              {copiedType === 'command' ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
              <span>{copiedType === 'command' ? 'Command Copied!' : 'Copy Command'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Code Modal Dialog */}
      {showCodeModal && (
        <div className="code-modal-backdrop" onClick={() => setShowCodeModal(false)} role="dialog" aria-modal="true">
          <div className="code-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="code-modal-header">
              <div className="code-modal-tabs">
                <button
                  type="button"
                  onClick={() => setModalTab('command')}
                  className={`modal-tab ${modalTab === 'command' ? 'modal-tab-active' : ''}`}
                >
                  <LightningIcon size={14} />
                  <span>Terminal Bootstrap Command</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('yaml')}
                  className={`modal-tab ${modalTab === 'yaml' ? 'modal-tab-active' : ''}`}
                >
                  <FileTextIcon size={14} />
                  <span>setup.yaml Specification</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="code-modal-close"
                aria-label="Close code preview modal"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="code-modal-body">
              <div className="code-modal-bar">
                <span className="code-modal-caption">
                  {modalTab === 'command'
                    ? 'Execute this command directly in your terminal to bootstrap this setup'
                    : 'Canonical declarative YAML specification ready to be saved as setup.yaml'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(modalTab)}
                  className="btn-modal-copy"
                >
                  {copiedType === modalTab ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                  <span>{copiedType === modalTab ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <pre className="code-modal-pre">
                <code>{modalTab === 'command' ? command : yaml}</code>
              </pre>
            </div>

            <div className="code-modal-footer">
              <span className="modal-info-note">
                Idempotent & reproducible across Ubuntu, Debian, macOS, and Arch Linux.
              </span>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="btn-modal-done"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

