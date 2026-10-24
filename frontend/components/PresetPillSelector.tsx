'use client';

import React from 'react';
import { PRESETS, ProfilePreset } from '../lib/modules';
import { SparklesIcon, SlidersIcon, CheckIcon } from './Icons';
import AsciiRevealText from './AsciiRevealText';

interface PresetPillSelectorProps {
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  presetModuleCounts: Record<string, number>;
  customSelectedCount: number;
}

export default function PresetPillSelector({
  activePresetId,
  onSelectPreset,
  presetModuleCounts,
  customSelectedCount
}: PresetPillSelectorProps) {
  const isCustomActive = activePresetId === 'custom';
  const activePreset = PRESETS.find((p) => p.id === activePresetId);

  return (
    <div className="preset-pill-container" aria-label="Preset configurations">
      <div className="preset-pill-header">
        <div className="preset-pill-title-row">
          <span className="preset-pill-label">Environment Presets</span>
          <span className="preset-pill-hint">Select a preset to load curated tools or customize your own stack</span>
        </div>
      </div>

      {/* Horizontal Pills Row */}
      <div className="preset-pills-scroll" role="tablist" aria-label="Select preset baseline">
        {PRESETS.map((preset: ProfilePreset) => {
          const isSelected = activePresetId === preset.id;
          const count = presetModuleCounts[preset.id] ?? preset.modules.length;

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
              <span className="preset-pill-badge">{count}</span>
            </button>
          );
        })}

        {/* Custom Pill Option */}
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

      {/* Dynamic Description Box (Only displays for the selected preset with ASCII reveal) */}
      <div className="preset-pill-description-box" role="region" aria-live="polite">
        {isCustomActive ? (
          <div className="preset-description-content">
            <div className="preset-desc-left">
              <span className="preset-desc-tagline">
                <AsciiRevealText text="Custom Tailored Environment" preset="terminal" triggerKey="custom" />
              </span>
              <p className="preset-desc-text">
                <AsciiRevealText
                  text="Build your own setup from scratch. Select and configure specific runtimes, cloud SDKs, shells, and tools below."
                  preset="decode"
                  triggerKey="custom"
                  speed={18}
                />
              </p>
            </div>
            <div className="preset-desc-stats">
              <span className="preset-desc-count-num">{customSelectedCount}</span>
              <span className="preset-desc-count-label">modules configured</span>
            </div>
          </div>
        ) : activePreset ? (
          <div className="preset-description-content">
            <div className="preset-desc-left">
              <div className="preset-desc-badge-row">
                <span className="preset-desc-tagline">
                  <AsciiRevealText
                    text={activePreset.tagline}
                    preset="blueprint"
                    triggerKey={activePreset.id}
                  />
                </span>
                <span className="preset-desc-modules-count">
                  {presetModuleCounts[activePreset.id] ?? activePreset.modules.length} tools included
                </span>
              </div>
              <p className="preset-desc-text">
                <AsciiRevealText
                  text={activePreset.description}
                  preset="decode"
                  triggerKey={activePreset.id}
                  speed={16}
                />
              </p>
            </div>
            <div className="preset-desc-stats">
              <span className="preset-desc-count-num">
                {presetModuleCounts[activePreset.id] ?? activePreset.modules.length}
              </span>
              <span className="preset-desc-count-label">curated tools</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
