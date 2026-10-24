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
import { RotateCcwIcon, CheckIcon, AlertCircleIcon, SlidersIcon } from './Icons';

interface SetupBuilderProps {
  initialBackendStatus?: string;
  initialDatabaseStatus?: string;
}

export default function SetupBuilder({
  initialBackendStatus = 'ok',
  initialDatabaseStatus = 'ok'
}: SetupBuilderProps) {
  // Authoritative configuration state
  const [setupId, setSetupId] = useState('full-setup');
  const [setupVersion, setSetupVersion] = useState('1.0.0');
  const [setupDescription, setSetupDescription] = useState(
    'Comprehensive development environment with runtimes, editors, and infrastructure tools'
  );
  const [activePresetId, setActivePresetId] = useState<string>('full');

  // Search & category view filter state for custom module explorer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Reset confirmation state
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

  // Validation
  const validation = useMemo(() => validateConfig(configObj), [configObj]);

  // Derived outputs
  const canonicalYaml = useMemo(() => generateDotupYaml(configObj), [configObj]);
  const bootstrapSnippet = useMemo(() => generateBootstrapSnippet(configObj), [configObj]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedModules).filter((m) => m.enabled).length;
  }, [selectedModules]);

  const activePreset = PRESETS.find((p) => p.id === activePresetId);

  return (
    <div className="builder-root-premium">
      {/* Top Banner and Summary */}
      <div className="builder-hero-section">
        <div className="hero-top-row">
          <div className="hero-badge">
            <span className="status-dot-green" />
            <span>Declarative Workstation Engine</span>
          </div>

          <div className="hero-actions-right">
            <button
              type="button"
              onClick={() => setShowAdvancedProfile(!showAdvancedProfile)}
              className="btn-ghost-sm"
              title="Toggle metadata edit"
            >
              <SlidersIcon size={12} />
              <span>{showAdvancedProfile ? 'Hide Metadata' : 'Profile Meta'}</span>
            </button>

            {showResetConfirm ? (
              <div className="reset-confirm-bar" role="alert">
                <span className="reset-confirm-text">Reset to default?</span>
                <button type="button" onClick={handleReset} className="btn-danger-sm">
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-ghost-sm"
                >
                  Cancel
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
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="hero-title">Configure Your Developer Environment</h1>
        <p className="hero-subtitle">
          Select a pre-configured baseline below or choose custom to hand-pick languages, cloud CLI tools, and development editors.
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

      {/* Preset Pills Header (Horizontal selection with dynamic description) */}
      <PresetPillSelector
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        presetModuleCounts={presetModuleCounts}
        customSelectedCount={selectedCount}
      />

      {/* Dynamic Main Body Content */}
      <div className="builder-flow-content">
        {activePresetId === 'custom' ? (
          /* Custom Pill Active: Full interactive module explorer with search and category filters */
          <div className="flow-custom-zone">
            <ModuleExplorer
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
          /* Preset Pill Active: Down below, what is in that pill is cleanly listed */
          <div className="flow-preset-zone">
            <PresetModuleList
              presetName={activePreset?.name || 'Selected Preset'}
              presetTagline={activePreset?.tagline}
              selectedModules={selectedModules}
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
