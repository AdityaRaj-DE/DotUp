'use client';

import React from 'react';
import { ModuleDefinition } from '../lib/modules';
import { ModuleSymbol, CheckIcon } from './Icons';
import LiquidDropdown from './LiquidDropdown';
import { useAsciiGlitch } from './AsciiGlitchText';

interface ModuleCardProps {
  module: ModuleDefinition;
  isSelected: boolean;
  selectedVersion: string;
  showDescription?: boolean;
  onToggle: (id: string) => void;
  onChangeVersion: (id: string, version: string) => void;
}

export default function ModuleCard({
  module,
  isSelected,
  selectedVersion,
  showDescription = false,
  onToggle,
  onChangeVersion
}: ModuleCardProps) {
  const { displayText: titleText, triggerGlitch, resetGlitch } = useAsciiGlitch(module.name);

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
      onMouseEnter={triggerGlitch}
      onMouseLeave={resetGlitch}
      className={`card module-card compact-card ${isSelected ? 'card-selected' : ''}`}
    >
      <div className="card-top-header">
        <div className="card-header-left">
          <div
            className={`module-checkbox ${isSelected ? 'module-checkbox-checked' : ''}`}
            aria-hidden="true"
          >
            {isSelected && <CheckIcon size={10} />}
          </div>
          <div className="card-symbol-badge" aria-hidden="true">
            <ModuleSymbol type={module.iconType} size={15} />
          </div>
          <div className="card-titles">
            <h2 className="headline">{titleText}</h2>
          </div>
        </div>

        {module.supportsVersion && (
          <div
            className="card-header-version-zone"
            onClick={(e) => e.stopPropagation()}
          >
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
                placeholder="v"
                onChange={(e) => onChangeVersion(module.id, e.target.value)}
                className="module-version-input"
              />
            )}
          </div>
        )}
      </div>

      {showDescription && (
        <p className="body">{module.description}</p>
      )}
    </article>
  );
}
