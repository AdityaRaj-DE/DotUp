'use client';

import React, { useState } from 'react';
import { MODULES, ModuleDefinition } from '../lib/modules';
import { ModuleSymbol, EyeIcon } from './Icons';
import LiquidDropdown from './LiquidDropdown';
import AsciiReveal from './AsciiReveal';
import AsciiRevealText from './AsciiRevealText';

interface PresetModuleListProps {
  presetId?: string;
  presetName: string;
  presetTagline?: string;
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  onChangeVersion: (id: string, version: string) => void;
  onCustomizeStack?: () => void;
}

export default function PresetModuleList({
  presetId = 'preset',
  presetName,
  presetTagline,
  selectedModules,
  onChangeVersion,
  onCustomizeStack
}: PresetModuleListProps) {
  const [showDescriptions, setShowDescriptions] = useState(false);
  const enabledModules = MODULES.filter((m) => selectedModules[m.id]?.enabled);

  return (
    <AsciiReveal preset="decode" triggerKey={presetId} duration={520} cellSize={14}>
      <div className="preset-modules-card" data-ascii="surface">
        <div className="preset-modules-header">
          <div className="preset-modules-header-info">
            <h3 className="headline">
              <AsciiRevealText
                text="Components Included in this Preset"
                preset="decode"
                triggerKey={presetId}
                speed={18}
              />
            </h3>
            <p className="body-preset-lead">
              {presetTagline || 'Pre-tuned development baselines ready to provision.'} Idempotent, zero drift, and ready to deploy.
            </p>
          </div>

          <div className="preset-header-actions-row">
            {/* Show / Hide Descriptions Toggle Button */}
            <button
              type="button"
              onClick={() => setShowDescriptions(!showDescriptions)}
              className={`btn-desc-toggle ${showDescriptions ? 'btn-desc-toggle-active' : ''}`}
              title={showDescriptions ? 'Hide descriptions on cards' : 'Show descriptions on all cards'}
            >
              <EyeIcon size={13} />
              <span>{showDescriptions ? 'Hide Descriptions' : 'Show Descriptions'}</span>
            </button>

            {/* Customize Stack Button */}
            {onCustomizeStack && (
              <button
                type="button"
                onClick={onCustomizeStack}
                className="btn-outline-custom"
                title="Switch to Custom to add or remove individual modules"
              >
                <span>Customize Tools</span>
              </button>
            )}
          </div>
        </div>

        <div className="preset-modules-grid">
          {enabledModules.map((module: ModuleDefinition, idx: number) => {
            const modState = selectedModules[module.id];
            const currentVersion = modState?.version || module.defaultVersion || '';

            return (
              <article
                key={module.id}
                className="card compact-card"
                data-ascii="surface"
                tabIndex={0}
                aria-label={`${module.name} card`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="card-top-header">
                  <div className="card-header-left">
                    <div className="card-symbol-badge" aria-hidden="true">
                      <ModuleSymbol type={module.iconType} size={15} />
                    </div>
                    <div className="card-titles">
                      <h2 className="headline">{module.name}</h2>
                    </div>
                  </div>

                  {module.supportsVersion && (
                    <div
                      className="card-header-version-zone"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {module.versionOptions && module.versionOptions.length > 0 ? (
                        <LiquidDropdown
                          value={currentVersion}
                          options={module.versionOptions}
                          onChange={(val) => onChangeVersion(module.id, val)}
                        />
                      ) : (
                        <input
                          type="text"
                          aria-label={`${module.name} version`}
                          value={currentVersion}
                          placeholder="v"
                          onChange={(e) => onChangeVersion(module.id, e.target.value)}
                          className="module-version-input"
                        />
                      )}
                    </div>
                  )}
                </div>

                {showDescriptions && (
                  <p className="body">{module.description}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </AsciiReveal>
  );
}
