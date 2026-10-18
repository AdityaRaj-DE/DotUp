'use client';

import React, { useState } from 'react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  yamlCode: string;
  bashCode: string;
  setupId: string;
  onCopyText: (text: string) => void;
}

export default function CodeExportModal({
  isOpen,
  onClose,
  yamlCode,
  bashCode,
  setupId,
  onCopyText
}: CodeExportModalProps) {
  const [tab, setTab] = useState<'yaml' | 'bash'>('yaml');

  if (!isOpen) return null;

  const currentContent = tab === 'yaml' ? yamlCode : bashCode;

  return (
    <div
      id="code-modal"
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-tabs" id="modal-tabs">
            <button
              type="button"
              className={`modal-tab ${tab === 'yaml' ? 'active' : ''}`}
              onClick={() => setTab('yaml')}
            >
              dotup.yaml
            </button>
            <button
              type="button"
              className={`modal-tab ${tab === 'bash' ? 'active' : ''}`}
              onClick={() => setTab('bash')}
            >
              bootstrap.sh
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              id="btn-modal-copy"
              className="btn btn-primary"
              style={{ height: 34, fontSize: 12 }}
              onClick={() => onCopyText(currentContent)}
            >
              Copy Code
            </button>
            <button
              id="btn-modal-close"
              className="btn"
              style={{ height: 34, fontSize: 12 }}
              onClick={onClose}
            >
              Close (Esc)
            </button>
          </div>
        </div>

        <div id="modal-code-content" className="modal-body">
          {currentContent}
        </div>

        <div className="modal-footer">
          <span id="modal-curl-preview">curl -sSL https://dotup.dev/setup/{setupId} | bash</span>
          <span>DotUp Sanctuary Engine</span>
        </div>
      </div>
    </div>
  );
}
