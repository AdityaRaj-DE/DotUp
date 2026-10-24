'use client';

import React, { useState } from 'react';
import { MODULES, PRESETS, ProfilePreset, ModuleDefinition } from '../lib/modules';
import { ModuleSymbol, EyeIcon, SparklesIcon, SlidersIcon, CheckIcon } from './Icons';
import LiquidDropdown from './LiquidDropdown';
import AsciiReveal from './AsciiReveal';
import AsciiRevealText from './AsciiRevealText';

interface PresetModuleListProps {
  presetId?: string;
  activePresetId: string;
  presetName: string;
  presetTagline?: string;
  presetDescription?: string;
  moduleCount?: number;
  presetModuleCounts: Record<string, number>;
  customSelectedCount: number;
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  onSelectPreset: (presetId: string) => void;
  onChangeVersion: (id: string, version: string) => void;
  onCustomizeStack?: () => void;
}

export default function PresetModuleList({
  presetId = 'preset',
  activePresetId,
  presetName,
  presetTagline,
  presetDescription,
  moduleCount,
  presetModuleCounts,
  customSelectedCount,
  selectedModules,
  onSelectPreset,
  onChangeVersion,
  onCustomizeStack
}: PresetModuleListProps) {
  const [showDescriptions, setShowDescriptions] = useState(false);
  const enabledModules = MODULES.filter((m) => selectedModules[m.id]?.enabled);
  const count = moduleCount ?? enabledModules.length;
  const isCustomActive = activePresetId === 'custom';

  return (
    <div className="preset-unified-card" data-ascii="surface">
      {/* Top Section: Pill Bar */}
      <div className="preset-unified-pills-section">
        <div className="preset-pill-header">
          <div className="preset-pill-title-row">
            <span className="preset-pill-label">Environment Presets</span>
            <span className="preset-pill-hint">Select a preset to load curated tools or customize your own stack</span>
          </div>
        </div>

        <div className="preset-pills-scroll" role="tablist" aria-label="Select preset baseline">
          {PRESETS.map((preset: ProfilePreset) => {
            const isSelected = activePresetId === preset.id;
            const pCount = presetModuleCounts[preset.id] ?? preset.modules.length;

            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectPreset(preset.id)}
                className={`preset-pill-btn ${isSelected ? 'preset-pill-btn-active' : ''}`}
              >
                <span className="preset-pill-icon">
                  {isSelected ? <CheckIcon size={13} /> : <SparklesIcon size={13} />}
                </span>
                <span className="preset-pill-name">{preset.name}</span>
                <span className="preset-pill-badge">{pCount}</span>
              </button>
            );
          })}

          <button
            type="button"
            role="tab"
            aria-selected={isCustomActive}
            onClick={() => onSelectPreset('custom')}
            className={`preset-pill-btn preset-pill-custom ${isCustomActive ? 'preset-pill-btn-active' : ''}`}
          >
            <span className="preset-pill-icon">
              <SlidersIcon size={13} />
            </span>
            <span className="preset-pill-name">Custom Stack</span>
            <span className="preset-pill-badge">{customSelectedCount}</span>
          </button>
        </div>
      </div>

      {/* Middle Section: Preset Info Header & Action Buttons */}
      <AsciiReveal preset="decode" triggerKey={presetId} duration={520} cellSize={14}>
        <div className="preset-unified-body">
          <div className="preset-modules-header">
            <div className="preset-desc-left">
              <div className="preset-desc-badge-row">
                <span className="preset-desc-tagline">
                  <AsciiRevealText
                    text={presetTagline || presetName}
                    preset="blueprint"
                    triggerKey={presetId}
                  />
                </span>
                <span className="preset-desc-modules-count">
                  {count} tools included
                </span>
              </div>
              <p className="preset-desc-text">
                <AsciiRevealText
                  text={presetDescription || 'Pre-tuned development baselines ready to provision.'}
                  preset="decode"
                  triggerKey={presetId}
                  speed={16}
                />
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
            </div>
          </div>

          {/* Bottom Section: Cards Grid */}
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
    </div>
  );
}
