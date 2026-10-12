'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MODULES, PRESETS } from '../lib/modules';
import {
  generateDotupYaml,
  generateBootstrapSnippet,
  validateConfig,
  getDownloadFilename
} from '../lib/generator';
import PresetSelector from './PresetSelector';
import ProfileInformation from './ProfileInformation';
import ModuleExplorer from './ModuleExplorer';
import SelectionSummary from './SelectionSummary';
import CommandPreview from './CommandPreview';
import { RotateCcwIcon, CheckIcon, AlertCircleIcon } from './Icons';

interface SetupBuilderProps {
  initialBackendStatus?: string;
  initialDatabaseStatus?: string;
}

export default function SetupBuilder({
  initialBackendStatus = 'ok',
  initialDatabaseStatus = 'ok'
}: SetupBuilderProps) {
  // 1. Authoritative configuration state
  const [setupId, setSetupId] = useState('full-setup');
  const [setupVersion, setSetupVersion] = useState('1.0.0');
  const [setupDescription, setSetupDescription] = useState(
    'Comprehensive development environment with runtimes, editors, and infrastructure tools'
  );
  const [activePresetId, setActivePresetId] = useState<string>('full');

  // Search & category view filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  // 2. Preset switching logic
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
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

  // 3. Module toggle & version configuration
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

  const handleRemoveModule = useCallback((id: string) => {
    setActivePresetId('custom');
    setSelectedModules((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: false
      }
    }));
  }, []);

  // Bulk actions
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

  // 4. Authoritative configuration object
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

  return (
    <div className="builder-root">
      {/* Top Header & Actions Bar */}
      <div className="builder-header-bar">
        <div className="builder-header-left">
          <div className="builder-profile-badge">
            <span className="profile-badge-dot" />
            <span className="profile-badge-id">{setupId || 'untitled-setup'}</span>
            <span className="profile-badge-ver">v{setupVersion}</span>
          </div>

          <div className="builder-status-badge">
            {validation.isValid ? (
              <span className="status-pill status-pill-success">
                <CheckIcon size={11} /> Valid Specification
              </span>
            ) : (
              <span className="status-pill status-pill-warning">
                <AlertCircleIcon size={11} /> {validation.errors.length} issue
                {validation.errors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="builder-header-right">
          {showResetConfirm ? (
            <div className="reset-confirm-bar" role="alert">
              <span className="reset-confirm-text">Reset configuration to default?</span>
              <button
                type="button"
                onClick={handleReset}
                className="btn-danger-sm"
              >
                Yes, Reset
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
              className="btn-ghost"
              title="Reset configuration to default preset"
            >
              <RotateCcwIcon size={13} />
              <span>Reset Setup</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="builder-grid">
        {/* Left Column: Workspace Configurator */}
        <div className="builder-workspace">
          {/* Starter Presets */}
          <PresetSelector
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            presetModuleCounts={presetModuleCounts}
          />

          {/* Profile Information Metadata */}
          <ProfileInformation
            setupId={setupId}
            setupVersion={setupVersion}
            setupDescription={setupDescription}
            onChangeSetupId={setSetupId}
            onChangeSetupVersion={setSetupVersion}
            onChangeSetupDescription={setSetupDescription}
            errors={validation.errors}
          />

          {/* Component Explorer with Search & Categories */}
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

          {/* Selection Summary Tray */}
          <SelectionSummary
            selectedModules={selectedModules}
            onRemoveModule={handleRemoveModule}
            isValid={validation.isValid}
            onApplyPreset={handleSelectPreset}
          />
        </div>

        {/* Right Column: Sticky Command and Terminal Preview */}
        <div className="builder-sidebar">
          <div className="sticky-sidebar">
            <CommandPreview
              command={bootstrapSnippet}
              yaml={canonicalYaml}
              setupId={setupId}
              selectedCount={selectedCount}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
