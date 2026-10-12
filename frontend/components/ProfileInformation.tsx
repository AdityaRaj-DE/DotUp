'use client';

import React from 'react';
import { UserIcon, AlertCircleIcon, InfoIcon } from './Icons';
import { ValidationError } from '../lib/generator';

interface ProfileInformationProps {
  setupId: string;
  setupVersion: string;
  setupDescription: string;
  onChangeSetupId: (value: string) => void;
  onChangeSetupVersion: (value: string) => void;
  onChangeSetupDescription: (value: string) => void;
  errors: ValidationError[];
}

export default function ProfileInformation({
  setupId,
  setupVersion,
  setupDescription,
  onChangeSetupId,
  onChangeSetupVersion,
  onChangeSetupDescription,
  errors
}: ProfileInformationProps) {
  const idError = errors.find((e) => e.field === 'setupId');
  const verError = errors.find((e) => e.field === 'setupVersion');

  return (
    <section aria-labelledby="profile-heading" className="panel-card">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-icon-wrap">
            <UserIcon size={16} />
          </span>
          <div>
            <h2 id="profile-heading" className="panel-title">Setup Profile Metadata</h2>
            <p className="panel-subtitle">Canonical V3 metadata serialized to your setup specification</p>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="setup-id" className="form-label">
              SETUP IDENTIFIER <span className="text-danger">*</span>
            </label>
            <span className="form-hint">Canonical setup.id</span>
          </div>
          <input
            id="setup-id"
            type="text"
            value={setupId}
            onChange={(e) => onChangeSetupId(e.target.value)}
            placeholder="e.g. backend-dev, full-setup"
            className={`form-input ${idError ? 'form-input-error' : ''}`}
            aria-invalid={!!idError}
            aria-describedby={idError ? 'setup-id-error' : 'setup-id-help'}
            spellCheck={false}
          />
          {idError ? (
            <p id="setup-id-error" className="form-error-msg">
              <AlertCircleIcon size={13} /> {idError.message}
            </p>
          ) : (
            <p id="setup-id-help" className="form-field-note">
              <InfoIcon size={12} /> Alphanumeric characters, dashes, and underscores only.
            </p>
          )}
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="setup-version" className="form-label">
              SPEC VERSION <span className="text-danger">*</span>
            </label>
            <span className="form-hint">Canonical setup.version</span>
          </div>
          <input
            id="setup-version"
            type="text"
            value={setupVersion}
            onChange={(e) => onChangeSetupVersion(e.target.value)}
            placeholder="1.0.0"
            className={`form-input ${verError ? 'form-input-error' : ''}`}
            aria-invalid={!!verError}
            aria-describedby={verError ? 'setup-ver-error' : undefined}
            spellCheck={false}
          />
          {verError && (
            <p id="setup-ver-error" className="form-error-msg">
              <AlertCircleIcon size={13} /> {verError.message}
            </p>
          )}
        </div>

        <div className="form-group form-group-full">
          <div className="form-label-row">
            <label htmlFor="setup-desc" className="form-label">
              DESCRIPTION <span className="badge-optional">(OPTIONAL)</span>
            </label>
            <span className="form-hint">Canonical setup.description</span>
          </div>
          <input
            id="setup-desc"
            type="text"
            value={setupDescription}
            onChange={(e) => onChangeSetupDescription(e.target.value)}
            placeholder="Purpose and context of this reproducible developer setup..."
            className="form-input"
          />
        </div>
      </div>
    </section>
  );
}
