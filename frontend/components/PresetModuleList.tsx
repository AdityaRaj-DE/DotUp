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
  // Find all modules enabled for this preset
  const enabledModules = MODULES.filter((m) => selectedModules[m.id]?.enabled);

  return (
    <AsciiReveal preset="decode" triggerKey={presetId} duration={480} cellSize={16}>
      <div className="preset-modules-card">
        <div className="preset-modules-header">
          <div className="preset-modules-header-info">
            <span className="preset-modules-badge">Included in {presetName}</span>
            <h3 className="preset-modules-title">
              <AsciiRevealText
                text="Components Included in this Preset"
                preset="decode"
                triggerKey={presetId}
                speed={20}
              />
            </h3>
            <p className="preset-modules-sub">
              {enabledModules.length} curated tools and runtimes pre-configured and ready to deploy.
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
              <div
                key={module.id}
                className="preset-module-row stagger-fade-in"
                style={{ animationDelay: `${idx * 45}ms` }}
              >
                <div className="preset-module-row-left">
                  <div className="preset-module-icon-box" aria-hidden="true">
                    <ModuleSymbol type={module.iconType} size={18} />
                  </div>
                  <div className="preset-module-text">
                    <div className="preset-module-name-row">
                      <span className="preset-module-name">{module.name}</span>
                      <span className="preset-module-tag">{module.id}</span>
                    </div>
                    <p className="preset-module-desc">{module.description}</p>
                  </div>
                </div>

                <div className="preset-module-row-right">
                  {module.supportsVersion ? (
                    <div className="preset-module-version-zone">
                      <span className="version-label">Version</span>
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
                    <span className="preset-module-status-chip">
                      <CheckIcon size={11} /> Ready
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AsciiReveal>
  );
}
