'use client';

import React, { useState } from 'react';
import { MODULES, PRESETS, ProfilePreset, ModuleDefinition } from '../lib/modules';
import { ModuleSymbol, EyeIcon, SparklesIcon, SlidersIcon, CheckIcon } from './Icons';
import LiquidDropdown from './LiquidDropdown';
import AsciiRevealText from './AsciiRevealText';
import AnimatedPresetPill from './AnimatedPresetPill';
import AsciiGlitchText, { useAsciiGlitch } from './AsciiGlitchText';
import { useGridCols, isLastRow } from '../lib/useGridCols';
import { AnimatePresence, motion } from 'framer-motion';

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
  const gridCols = useGridCols();
  const enabledModules = MODULES.filter((m) => selectedModules[m.id]?.enabled);
  const count = moduleCount ?? enabledModules.length;
  const isCustomActive = activePresetId === 'custom';

  return (
    <div className="preset-unified-card" data-ascii="surface">
      {/* Top Section: Pill Bar */}
      <div className="preset-unified-pills-section">
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

        <div className="preset-pills-scroll" role="tablist" aria-label="Select preset baseline">
          {PRESETS.map((preset: ProfilePreset, idx: number) => {
            const isSelected = activePresetId === preset.id;
            const pCount = presetModuleCounts[preset.id] ?? preset.modules.length;

            return (
              <AnimatedPresetPill
                key={preset.id}
                id={preset.id}
                name={preset.name}
                count={pCount}
                isSelected={isSelected}
                onClick={() => onSelectPreset(preset.id)}
                index={idx}
              />
            );
          })}

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
      </div>

      {/* Middle Section: Preset Info Header & Action Buttons */}
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
                <AsciiGlitchText text={showDescriptions ? 'Hide Descriptions' : 'Show Descriptions'} />
              </button>
            </div>
          </div>

          {/* Bottom Section: Tic-Tac-Toe Matrix Grid with AnimatePresence */}
          <motion.div layout className="modules-matrix-grid preset-modules-grid">
            <AnimatePresence mode="popLayout">
              {enabledModules.map((module: ModuleDefinition, idx: number) => {
                const modState = selectedModules[module.id];
                const currentVersion = modState?.version || module.defaultVersion || '';
                const isLast = isLastRow(idx, enabledModules.length, gridCols);

                return (
                  <PresetCompactCard
                    key={module.id}
                    module={module}
                    idx={idx}
                    isLastRow={isLast}
                    currentVersion={currentVersion}
                    showDescriptions={showDescriptions}
                    onChangeVersion={onChangeVersion}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
    </div>
  );
}

function PresetCompactCard({
  module,
  idx,
  isLastRow,
  currentVersion,
  showDescriptions,
  onChangeVersion
}: {
  module: ModuleDefinition;
  idx: number;
  isLastRow?: boolean;
  currentVersion: string;
  showDescriptions: boolean;
  onChangeVersion: (id: string, version: string) => void;
}) {
  const { displayText: titleText, triggerGlitch, resetGlitch } = useAsciiGlitch(module.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`matrix-cell matrix-cell-static ${isLastRow ? 'is-last-row' : ''}`}
      data-ascii="surface"
      tabIndex={0}
      aria-label={`${module.name} cell`}
      onMouseEnter={triggerGlitch}
      onMouseLeave={resetGlitch}
    >
      <div className="matrix-cell-top">
        <div className="matrix-cell-left">
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

      {/* Description with smooth accordion collapse transition */}
      <div className={`matrix-cell-desc-collapse ${showDescriptions ? 'matrix-cell-desc-open' : ''}`}>
        <p className="matrix-cell-desc">{module.description}</p>
      </div>
    </motion.div>
  );
}
