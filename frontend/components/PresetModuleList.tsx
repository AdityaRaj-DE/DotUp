'use client';

import React from 'react';
import { MODULES, ModuleDefinition } from '../lib/modules';
import { ModuleSymbol, CheckIcon } from './Icons';
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
  const enabledModules = MODULES.filter((m) => selectedModules[m.id]?.enabled);

  return (
    <AsciiReveal preset="decode" triggerKey={presetId} duration={520} cellSize={14}>
      <div className="preset-modules-card" data-ascii="surface">
        <div className="preset-modules-header">
          <div className="preset-modules-header-info">
            <p className="eyebrow">
              Included in {presetName} · {enabledModules.length} components
            </p>
            <h3 className="headline">
              <AsciiRevealText
                text="Components Included in this Preset"
                preset="decode"
                triggerKey={presetId}
                speed={18}
              />
            </h3>
            <p className="body">
              {presetTagline || 'Pre-tuned development baselines ready to provision.'} Idempotent, zero drift, and ready to deploy.
            </p>
          </div>
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

        <div className="preset-modules-grid">
          {enabledModules.map((module: ModuleDefinition, idx: number) => {
            const modState = selectedModules[module.id];
            const currentVersion = modState?.version || module.defaultVersion || '';

            return (
              <article
                key={module.id}
                className="card"
                data-ascii="surface"
                tabIndex={0}
                aria-label={`${module.name} card`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="card-top-header">
                  <div className="card-symbol-badge" aria-hidden="true">
                    <ModuleSymbol type={module.iconType} size={18} />
                  </div>
                  <div className="card-titles">
                    <p className="eyebrow">{module.category.toUpperCase()} RUNTIME</p>
                    <h2 className="headline">{module.name}</h2>
                  </div>
                </div>

                <p className="body">{module.description}</p>

                <div className="row between hair">
                  <div className="tag-zone">
                    <code className="tiny mono muted">id: {module.id}</code>
                  </div>

                  <div className="version-zone" onClick={(e) => e.stopPropagation()}>
                    {module.supportsVersion ? (
                      <div className="card-version-picker">
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
                            placeholder="Version"
                            onChange={(e) => onChangeVersion(module.id, e.target.value)}
                            className="module-version-input"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="tiny mono ready-status">
                        <CheckIcon size={11} /> Ready
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AsciiReveal>
  );
}
