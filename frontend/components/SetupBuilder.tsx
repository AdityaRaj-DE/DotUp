'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { MODULES, PRESETS } from '../lib/modules';
import {
  generateDotupYaml,
  generateBootstrapSnippet,
  validateConfig
} from '../lib/generator';
import PresetPillSelector from './PresetPillSelector';
import PresetModuleList from './PresetModuleList';
import ModuleExplorer from './ModuleExplorer';
import BottomActionBar from './BottomActionBar';
import ProfileInformation from './ProfileInformation';
import { RotateCcwIcon, SlidersIcon, CheckIcon } from './Icons';
import AsciiGlitchText from './AsciiGlitchText';

interface SetupBuilderProps {
  initialBackendStatus?: string;
  initialDatabaseStatus?: string;
}

export default function SetupBuilder({
  initialBackendStatus = 'ok',
  initialDatabaseStatus = 'ok'
}: SetupBuilderProps) {
  // Authoritative environment configuration state
  const [setupId, setSetupId] = useState('full-setup');
  const [setupVersion, setSetupVersion] = useState('1.0.0');
  const [setupDescription, setSetupDescription] = useState(
    'Comprehensive development environment with runtimes, editors, and infrastructure tools'
  );
  const [activePresetId, setActivePresetId] = useState<string>('full');
  const [replayCount, setReplayCount] = useState(0);

  // Search & category view filter state for custom module explorer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Confirmation & metadata drawer state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAdvancedProfile, setShowAdvancedProfile] = useState(false);

  // Initialize modules based on full preset
  const [selectedModules, setSelectedModules] = useState<
    Record<string, { enabled: boolean; version?: string }>
  >(() => {
    const initial: Record<string, { enabled: boolean; version?: string }> = {};
    MODULES.forEach((m) => {
      initial[m.id] = {
        enabled: true,
        version: m.defaultVersion || ''
      };
    });
    return initial;
  });

  // Calculate preset counts dynamically
  const presetModuleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PRESETS.forEach((p) => {
      counts[p.id] = p.modules.length;
    });
    return counts;
  }, []);

  // Preset switching logic
  const handleSelectPreset = useCallback((presetId: string) => {
    setActivePresetId(presetId);
    setReplayCount((c) => c + 1);

    if (presetId === 'custom') {
      setSetupId('custom-setup');
      setSetupDescription('Customized environment profile');
      return;
    }

    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSetupId(`${preset.id}-setup`);
    setSetupDescription(preset.description);

    setSelectedModules((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => {
        next[m.id] = {
          ...next[m.id],
          enabled: preset.modules.includes(m.id)
        };
      });
      return next;
    });
  }, []);

  // Module toggle & version configuration
  const handleToggleModule = useCallback((id: string) => {
    setActivePresetId('custom');
    setSelectedModules((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id]?.enabled
      }
    }));
  }, []);

  const handleChangeVersion = useCallback((id: string, version: string) => {
    setSelectedModules((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        version
      }
    }));
  }, []);

  // Bulk actions for custom explorer
  const handleSelectAllVisible = useCallback(() => {
    setActivePresetId('custom');
    setSelectedModules((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => {
        const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
        if (!matchesCategory) return;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            m.name.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q);
          if (!match) return;
        }
        next[m.id] = {
          ...next[m.id],
          enabled: true
        };
      });
      return next;
    });
  }, [selectedCategory, searchQuery]);

  const handleClearAll = useCallback(() => {
    setActivePresetId('custom');
    setSelectedModules((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => {
        next[m.id] = {
          ...next[m.id],
          enabled: false
        };
      });
      return next;
    });
  }, []);

  // Reset to default
  const handleReset = useCallback(() => {
    handleSelectPreset('full');
    setShowResetConfirm(false);
  }, [handleSelectPreset]);

  // Authoritative configuration object
  const configObj = useMemo(() => {
    return {
      setupId,
      setupVersion,
      setupDescription,
      selectedModules
    };
  }, [setupId, setupVersion, setupDescription, selectedModules]);

  const validation = useMemo(() => validateConfig(configObj), [configObj]);
  const canonicalYaml = useMemo(() => generateDotupYaml(configObj), [configObj]);
  const bootstrapSnippet = useMemo(() => generateBootstrapSnippet(configObj), [configObj]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedModules).filter((m) => m.enabled).length;
  }, [selectedModules]);

  const activePreset = PRESETS.find((p) => p.id === activePresetId);

  return (
    <div className="builder-root-premium">
      {/* Top Banner and Headline with Architectural Crosshairs matching image 1 */}
      <div className="hero-ascii-frame">
        <span className="crosshair crosshair-tl" />
        <span className="crosshair crosshair-tr" />
        <span className="crosshair crosshair-bl" />
        <span className="crosshair crosshair-br" />

        <div className="hero-top-row">
          <div className="hero-pill-badge">
            <span className="badge-new">v3.0</span>
            <span>Declarative workstation engine for macOS & Linux</span>
          </div>

          <div className="hero-actions-right">
            <button
              type="button"
              onClick={() => setShowAdvancedProfile(!showAdvancedProfile)}
              className="btn-ghost-sm"
              title="Toggle metadata edit"
            >
              <SlidersIcon size={12} />
              <AsciiGlitchText text={showAdvancedProfile ? 'Hide Metadata' : 'Profile Meta'} />
            </button>

            {showResetConfirm ? (
              <div className="reset-confirm-bar" role="alert">
                <span className="reset-confirm-text">Reset to default?</span>
                <button type="button" onClick={handleReset} className="btn-danger-sm">
                  <AsciiGlitchText text="Reset" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-ghost-sm"
                >
                  <AsciiGlitchText text="Cancel" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="btn-ghost-sm"
                title="Reset configuration to Full preset"
              >
                <RotateCcwIcon size={12} />
                <AsciiGlitchText text="Reset" />
              </button>
            )}
          </div>
        </div>

        <h1 className="hero-headline">
          Declarative Environment Configurator
        </h1>
        <p className="hero-lead">
          Select a pre-tuned baseline pill below or switch to Custom to hand-pick languages, cloud CLI tools, and development editors into an idempotent setup specification.
        </p>

        {/* Advanced Profile Information Drawer (collapsible) */}
        {showAdvancedProfile && (
          <div className="profile-edit-drawer">
            <ProfileInformation
              setupId={setupId}
              setupVersion={setupVersion}
              setupDescription={setupDescription}
              onChangeSetupId={setSetupId}
              onChangeSetupVersion={setSetupVersion}
              onChangeSetupDescription={setSetupDescription}
              errors={validation.errors}
            />
          </div>
        )}
      </div>

      {/* Dynamic Main Body Content */}
      <div className="builder-flow-content">
        {activePresetId === 'custom' ? (
          /* Custom Pill Active: Unified single card with preset pills, custom header, search/filters, and interactive grid */
          <div className="flow-custom-zone">
            <ModuleExplorer
              activePresetId={activePresetId}
              presetModuleCounts={presetModuleCounts}
              onSelectPreset={handleSelectPreset}
              selectedModules={selectedModules}
              onToggleModule={handleToggleModule}
              onChangeVersion={handleChangeVersion}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectAllVisible={handleSelectAllVisible}
              onClearAll={handleClearAll}
            />
          </div>
        ) : (
          /* Preset Pill Active: Unified single card containing pills, preset header, and included modules */
          <div className="flow-preset-zone">
            <PresetModuleList
              presetId={`${activePresetId}-${replayCount}`}
              activePresetId={activePresetId}
              presetName={activePreset?.name || 'Selected Preset'}
              presetTagline={activePreset?.tagline}
              presetDescription={activePreset?.description}
              moduleCount={activePreset ? (presetModuleCounts[activePreset.id] ?? activePreset.modules.length) : undefined}
              presetModuleCounts={presetModuleCounts}
              customSelectedCount={selectedCount}
              selectedModules={selectedModules}
              onSelectPreset={handleSelectPreset}
              onChangeVersion={handleChangeVersion}
              onCustomizeStack={() => handleSelectPreset('custom')}
            />
          </div>
        )}
      </div>

      {/* Premium Sticky Bottom Action Bar with Copy, Download, and View Code */}
      <BottomActionBar
        command={bootstrapSnippet}
        yaml={canonicalYaml}
        setupId={setupId}
        selectedCount={selectedCount}
        isValid={validation.isValid}
        errors={validation.errors}
      />
    </div>
  );
}
