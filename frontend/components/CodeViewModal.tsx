'use client';

import React, { useState } from 'react';
import { CheckIcon, AlertCircleIcon } from './Icons';

interface CodeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  yaml: string;
  command: string;
  setupId: string;
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
  onCopyCommand: () => Promise<boolean>;
  onDownloadYaml: () => void;
}

export default function CodeViewModal({
  isOpen,
  onClose,
  yaml,
  command,
  setupId,
  isValid,
  errors,
  onCopyCommand,
  onDownloadYaml
}: CodeViewModalProps) {
  const [activeTab, setActiveTab] = useState<'yaml' | 'command'>('yaml');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const textToCopy = activeTab === 'yaml' ? yaml : command;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="code-view-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="code-view-header">
          <div className="code-view-header-left">
            <div className="code-view-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'yaml'}
                className={`code-tab-btn ${activeTab === 'yaml' ? 'active' : ''}`}
                onClick={() => setActiveTab('yaml')}
              >
                Canonical YAML (setup.yaml)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'command'}
                className={`code-tab-btn ${activeTab === 'command' ? 'active' : ''}`}
                onClick={() => setActiveTab('command')}
              >
                Bootstrap Command
              </button>
            </div>
          </div>

          <div className="code-view-header-right">
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close Code View"
            >
              ✕
            </button>
          </div>
        </div>

        {!isValid && (
          <div className="code-view-validation-warning" role="alert">
            <AlertCircleIcon size={14} />
            <span>
              <strong>Configuration Warning:</strong> {errors.map((e) => e.message).join('; ')}
            </span>
          </div>
        )}

        <div className="code-view-body">
          <pre className="code-view-pre">
            <code>{activeTab === 'yaml' ? yaml : command}</code>
          </pre>
        </div>

        <div className="code-view-footer">
          <div className="code-view-footer-left">
            <span className="code-view-info">
              {activeTab === 'yaml'
                ? 'Matches canonical DotUp V3 Schema specification.'
                : 'Pipes self-contained heredoc directly into DotUp bootstrap.'}
            </span>
          </div>

          <div className="code-view-footer-right">
            <button
              type="button"
              className="btn-secondary-action"
              onClick={onDownloadYaml}
              title="Download canonical setup.yaml"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download YAML</span>
            </button>

            <button
              type="button"
              className="btn-primary-action"
              onClick={handleCopy}
              aria-live="polite"
            >
              {copied ? (
                <>
                  <CheckIcon size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy {activeTab === 'yaml' ? 'YAML' : 'Command'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
