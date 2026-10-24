'use client';

import React from 'react';
import { ModuleDefinition } from '../lib/modules';
import { ModuleSymbol, CheckIcon } from './Icons';
import LiquidDropdown from './LiquidDropdown';

interface ModuleCardProps {
  module: ModuleDefinition;
  isSelected: boolean;
  selectedVersion: string;
  onToggle: (id: string) => void;
  onChangeVersion: (id: string, version: string) => void;
}

export default function ModuleCard({
  module,
  isSelected,
  selectedVersion,
  onToggle,
  onChangeVersion
}: ModuleCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        onToggle(module.id);
      }
    }
  };

  return (
    <article
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${module.name} (${module.id})`}
      tabIndex={0}
      data-ascii="surface"
      onClick={() => onToggle(module.id)}
      onKeyDown={handleKeyDown}
      className={`card module-card ${isSelected ? 'card-selected' : ''}`}
    >
      <div className="card-top-header">
        <div className="card-header-left">
          <div
            className={`module-checkbox ${isSelected ? 'module-checkbox-checked' : ''}`}
            aria-hidden="true"
          >
            {isSelected && <CheckIcon size={11} />}
          </div>
          <div className="card-symbol-badge" aria-hidden="true">
            <ModuleSymbol type={module.iconType} size={18} />
          </div>
        </div>

        <div className="card-titles">
          <p className="eyebrow">{module.category.toUpperCase()} TOOL</p>
          <h2 className="headline">{module.name}</h2>
        </div>
      </div>

      <p className="body">{module.description}</p>

      <div className="row between hair" onClick={(e) => e.stopPropagation()}>
        <div className="tag-zone">
          <code className="tiny mono muted">id: {module.id}</code>
        </div>

        <div className="version-zone">
          {module.supportsVersion ? (
            <div className="card-version-picker">
              {module.versionOptions && module.versionOptions.length > 0 ? (
                <LiquidDropdown
                  value={selectedVersion || module.defaultVersion || ''}
                  options={module.versionOptions}
                  onChange={(val) => onChangeVersion(module.id, val)}
                />
              ) : (
                <input
                  type="text"
                  aria-label={`${module.name} version`}
                  value={selectedVersion}
                  placeholder="Version"
                  onChange={(e) => onChangeVersion(module.id, e.target.value)}
                  className="module-version-input"
                />
              )}
            </div>
          ) : (
            <span className={`tiny mono ${isSelected ? 'ready-status' : 'muted'}`}>
              {isSelected ? 'Enabled' : 'Click to add'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
