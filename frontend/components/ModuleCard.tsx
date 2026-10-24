'use client';

import React from 'react';
import { ModuleDefinition } from '../lib/modules';
import { ModuleSymbol } from './Icons';
import LiquidDropdown from './LiquidDropdown';
import { useAsciiGlitch } from './AsciiGlitchText';

interface ModuleCardProps {
  module: ModuleDefinition;
  isSelected: boolean;
  isLastRow?: boolean;
  selectedVersion: string;
  showDescription?: boolean;
  onToggle: (id: string) => void;
  onChangeVersion: (id: string, version: string) => void;
}

export default function ModuleCard({
  module,
  isSelected,
  isLastRow,
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
    <div
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${module.name} (${module.id})`}
      tabIndex={0}
      data-ascii="surface"
      onClick={() => onToggle(module.id)}
      onKeyDown={handleKeyDown}
      onMouseEnter={triggerGlitch}
      onMouseLeave={resetGlitch}
      className={`matrix-cell ${isSelected ? 'matrix-cell-selected' : ''} ${isLastRow ? 'is-last-row' : ''}`}
    >
      <div className="matrix-cell-top">
        <div className="matrix-cell-left">
          <span className="matrix-cell-indicator" aria-hidden="true" />
          <div className="matrix-cell-symbol" aria-hidden="true">
            <ModuleSymbol type={module.iconType} size={15} />
          </div>
          <div className="matrix-cell-titles">
            <h2 className="matrix-cell-title">{titleText}</h2>
          </div>
        </div>

        {module.supportsVersion && (
          <div
            className="matrix-cell-version"
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

      {/* Description with smooth accordion collapse transition */}
      <div className={`matrix-cell-desc-collapse ${showDescription ? 'matrix-cell-desc-open' : ''}`}>
        <p className="matrix-cell-desc">{module.description}</p>
      </div>
    </div>
  );
}
