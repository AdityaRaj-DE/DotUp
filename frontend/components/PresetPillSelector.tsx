'use client';

import React from 'react';
import { PRESETS, ProfilePreset } from '../lib/modules';
import { SparklesIcon, SlidersIcon, CheckIcon } from './Icons';
import AsciiRevealText from './AsciiRevealText';
import AnimatedPresetPill from './AnimatedPresetPill';

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
          <span className="preset-pill-label">
            <AsciiRevealText text="Environment Presets" preset="blueprint" speed={16} />
          </span>
          <span className="preset-pill-hint">
            <AsciiRevealText
              text="Select a preset to load curated tools or customize your own stack"
              preset="decode"
              speed={12}
            />
          </span>
        </div>
      </div>

      {/* Horizontal Pills Row */}
      <div className="preset-pills-scroll" role="tablist" aria-label="Select preset baseline">
        {PRESETS.map((preset: ProfilePreset, idx: number) => {
          const isSelected = activePresetId === preset.id;
          const count = presetModuleCounts[preset.id] ?? preset.modules.length;

          return (
            <AnimatedPresetPill
              key={preset.id}
              id={preset.id}
              name={preset.name}
              count={count}
              isSelected={isSelected}
              onClick={() => onSelectPreset(preset.id)}
              index={idx}
            />
          );
        })}

        {/* Custom Pill Option */}
        <AnimatedPresetPill
          key="custom"
          id="custom"
          name="Custom Stack"
          count={customSelectedCount}
          isSelected={isCustomActive}
          isCustom={true}
          onClick={() => onSelectPreset('custom')}
          index={PRESETS.length}
        />
      </div>

      {/* Dynamic Description Box (Only displays for custom stack or when not inside merged preset list) */}
      {isCustomActive && (
        <div className="preset-pill-description-box" role="region" aria-live="polite">
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
                  duration={1500}
                />
              </p>
            </div>
            <div className="preset-desc-stats">
              <span className="preset-desc-count-num">{customSelectedCount}</span>
              <span className="preset-desc-count-label">modules configured</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
