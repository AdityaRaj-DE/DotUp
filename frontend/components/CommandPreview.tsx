'use client';

import React, { useState } from 'react';
import {
  LightningIcon,
  FileTextIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  AlertCircleIcon
} from './Icons';
import { ValidationError } from '../lib/generator';

interface CommandPreviewProps {
  command: string;
  yaml: string;
  setupId: string;
  selectedCount: number;
  isValid: boolean;
  errors: ValidationError[];
}

export default function CommandPreview({
  command,
  yaml,
  setupId,
  selectedCount,
  isValid,
  errors
}: CommandPreviewProps) {
  const [activeTab, setActiveTab] = useState<'command' | 'yaml'>('command');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const textToCopy = activeTab === 'command' ? command : yaml;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) throw new Error('execCommand copy failed');
      }
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
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
    <div className="command-output-panel" aria-labelledby="output-heading">
      {/* Clean Modern Display Card */}
      <div className="output-card">
        {/* Header Bar with Segmented Control */}
        <div className="output-header">
          <div className="output-header-left">
            <span className="output-badge">Ready to run</span>
            <div className="output-meta-pill">
              <span className="status-dot-green" />
              <span>{selectedCount} components</span>
            </div>
          </div>

          <div className="segmented-switch" role="tablist" aria-label="Output format selection">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'command'}
              onClick={() => setActiveTab('command')}
              className={`segmented-tab ${activeTab === 'command' ? 'segmented-tab-active' : ''}`}
            >
              <LightningIcon size={13} />
              <span>Install Command</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'yaml'}
              onClick={() => setActiveTab('yaml')}
              className={`segmented-tab ${activeTab === 'yaml' ? 'segmented-tab-active' : ''}`}
            >
              <FileTextIcon size={13} />
              <span>setup.yaml</span>
            </button>
          </div>
        </div>

        {/* Validation alert banner if invalid */}
        {!isValid && (
          <div className="output-warning-bar" role="alert">
            <AlertCircleIcon size={14} />
            <span>
              {errors.length > 0 ? errors[0].message : 'Configuration contains validation errors.'}
            </span>
          </div>
        )}

        {/* Code / Command Display Box */}
        <div className="code-display-container">
          <div className="code-display-caption">
            {activeTab === 'command' ? (
              <span>Run directly in terminal (Ubuntu, Debian, macOS, Arch)</span>
            ) : (
              <span>DotUp Canonical V3 YAML Configuration</span>
            )}
          </div>
          <pre className="code-display-block">
            <code>{textToCopy}</code>
          </pre>
        </div>

        {/* Action Controls Bar */}
        <div className="output-footer">
          <button
            type="button"
            onClick={handleCopy}
            className={`btn-primary-action ${copied ? 'btn-copied' : ''}`}
            aria-live="polite"
            disabled={!isValid}
            title={isValid ? 'Copy to clipboard' : 'Fix validation issues first'}
          >
            {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
            <span>
              {copied
                ? 'Copied to Clipboard!'
                : copyFailed
                ? 'Copy Failed'
                : activeTab === 'command'
                ? 'Copy Command'
                : 'Copy YAML'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadYaml}
            className="btn-secondary-action"
            disabled={!isValid}
            title="Download setup.yaml file"
          >
            <DownloadIcon size={15} />
            <span>Download .yaml</span>
          </button>
        </div>
      </div>

      {/* Execution Instructions Box */}
      <div className="guide-card">
        <div className="guide-header">
          <LightningIcon size={15} className="guide-icon" />
          <h3 className="guide-title">How It Works</h3>
        </div>
        <p className="guide-desc">
          Run the generated one-liner in your terminal to safely inspect and apply your environment state.
        </p>
        <ol className="guide-steps">
          <li>
            <span className="step-num">1</span>
            <span>
              Creates your local <code className="code-pill">setup.yaml</code> with declared tools and version constraints.
            </span>
          </li>
          <li>
            <span className="step-num">2</span>
            <span>
              Streams <code className="code-pill">bootstrap.sh</code> to securely verify and download DotUp.
            </span>
          </li>
          <li>
            <span className="step-num">3</span>
            <span>
              Inspects your machine and idempotently installs only missing tools without breaking existing setups.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
