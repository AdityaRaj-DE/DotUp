'use client';

import React from 'react';
import { PRESETS, ProfilePreset } from '../lib/modules';
import { GridIcon, CheckIcon } from './Icons';

interface PresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  presetModuleCounts: Record<string, number>;
}

export default function PresetSelector({
  activePresetId,
  onSelectPreset,
  presetModuleCounts
}: PresetSelectorProps) {
  return (
    <section aria-labelledby="presets-heading" className="panel-card">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-icon-wrap">
            <GridIcon size={16} />
          </span>
          <div>
            <h2 id="presets-heading" className="panel-title">Starter Presets</h2>
            <p className="panel-subtitle">Select a pre-tuned baseline or build a custom profile</p>
          </div>
        </div>
        <span className="badge-subtle">{PRESETS.length} Baselines</span>
      </div>

      <div className="preset-grid" role="radiogroup" aria-label="Starter presets">
        {PRESETS.map((preset: ProfilePreset) => {
          const isSelected = activePresetId === preset.id;
          const count = presetModuleCounts[preset.id] ?? preset.modules.length;

          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPreset(preset.id)}
              className={`preset-card ${isSelected ? 'preset-card-active' : ''}`}
            >
              <div className="preset-card-top">
                <span className="preset-card-title">{preset.name}</span>
                <span className="preset-card-count">{count} tools</span>
              </div>
              <div className="preset-card-tagline">{preset.tagline}</div>
              <p className="preset-card-desc">{preset.description}</p>
              <div className="preset-card-footer">
                {isSelected ? (
                  <span className="preset-indicator-active">
                    <CheckIcon size={11} /> Active Baseline
                  </span>
                ) : (
                  <span className="preset-indicator-inactive">Click to apply</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
