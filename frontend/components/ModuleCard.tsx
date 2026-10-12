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
      // Toggle card only if target isn't inside interactive version selector
      if ((e.target as HTMLElement).tagName !== 'BUTTON') {
        e.preventDefault();
        onToggle(module.id);
      }
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${module.name} (${module.id})`}
      tabIndex={0}
      onClick={() => onToggle(module.id)}
      onKeyDown={handleKeyDown}
      className={`module-card ${isSelected ? 'module-card-selected' : ''}`}
    >
      <div className="module-card-main">
        {/* Checkbox indicator */}
        <div className={`module-checkbox ${isSelected ? 'module-checkbox-checked' : ''}`} aria-hidden="true">
          {isSelected && <CheckIcon size={11} />}
        </div>

        {/* Brand symbol */}
        <div className="module-icon-wrap" aria-hidden="true">
          <ModuleSymbol type={module.iconType} size={18} />
        </div>

        {/* Identity & description */}
        <div className="module-info">
          <div className="module-title-row">
            <span className="module-name">{module.name}</span>
            <code className="module-id-badge">{module.id}</code>
          </div>
          <p className="module-desc">{module.description}</p>
        </div>
      </div>

      {/* Version selector if supported */}
      {module.supportsVersion && (
        <div className="module-version-zone" onClick={(e) => e.stopPropagation()}>
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
      )}
    </div>
  );
}
