'use client';

import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface CodeCopyBlockProps {
  code: string;
  language?: string;
  caption?: string;
}

export default function CodeCopyBlock({
  code,
  language = 'bash',
  caption
}: CodeCopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="code-copy-block" data-ascii="surface">
      <div className="code-copy-header">
        <div className="code-copy-left">
          <span className="code-lang-tag">{language}</span>
          {caption && <span className="code-caption-tag">{caption}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-code-copy"
          aria-label="Copy code to clipboard"
        >
          {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="code-copy-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

