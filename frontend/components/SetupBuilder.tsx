'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { MODULES, PRESETS } from '../lib/modules';
import {
  generateDotupYaml,
  generateBootstrapSnippet,
  validateConfig,
  getDownloadFilename
} from '../lib/generator';
import TopNavbar from './TopNavbar';
import SidebarConfigurator from './SidebarConfigurator';
import VoxelTreeCanvas from './VoxelTreeCanvas';
import FloatingActionDock from './FloatingActionDock';
import CodeViewModal from './CodeViewModal';

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

  // Code View modal visibility
  const [isCodeViewOpen, setIsCodeViewOpen] = useState(false);

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

  // Bulk actions
  const handleSelectAllVisible = useCallback(() => {
    setActivePresetId('custom');
    setSelectedModules((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => {
        next[m.id] = {
          ...next[m.id],
          enabled: true
        };
      });
      return next;
    });
  }, []);

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
  const handleResetSetup = useCallback(() => {
    handleSelectPreset('full');
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

  // Copy command handler
  const handleCopyCommand = useCallback(async (): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(bootstrapSnippet);
        return true;
      }
      const textArea = document.createElement('textarea');
      textArea.value = bootstrapSnippet;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }, [bootstrapSnippet]);

  // Download YAML handler
  const handleDownloadYaml = useCallback(() => {
    try {
      const blob = new Blob([canonicalYaml], { type: 'application/x-yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getDownloadFilename(setupId);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, [canonicalYaml, setupId]);

  return (
    <div className="voxel-builder-root">
      {/* 1. Floating Glass Navbar */}
      <TopNavbar
        setupId={setupId}
        setupVersion={setupVersion}
        isValid={validation.isValid}
        issueCount={validation.errors.length}
        onOpenCodeView={() => setIsCodeViewOpen(true)}
        onResetSetup={handleResetSetup}
        backendStatus={initialBackendStatus}
        databaseStatus={initialDatabaseStatus}
      />

      {/* 2. Main 2-Pane Experience */}
      <div className="voxel-builder-body">
        {/* Left: Sole Configuration Sidebar in frosted glass */}
        <SidebarConfigurator
          setupId={setupId}
          setupVersion={setupVersion}
          setupDescription={setupDescription}
          onChangeSetupId={setSetupId}
          onChangeSetupVersion={setSetupVersion}
          onChangeSetupDescription={setSetupDescription}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          selectedModules={selectedModules}
          onToggleModule={handleToggleModule}
          onChangeVersion={handleChangeVersion}
          onSelectAllVisible={handleSelectAllVisible}
          onClearAll={handleClearAll}
          isValid={validation.isValid}
          errors={validation.errors}
        />

        {/* Center / Right: The Atmospheric 3D Voxel Stage */}
        <main className="tree-center-stage" aria-label="Visual environment representation">
          <VoxelTreeCanvas selectedModules={selectedModules} />
        </main>

        {/* 3. Floating Bottom-Centered Glass Action Dock */}
        <FloatingActionDock
          onCopyCommand={handleCopyCommand}
          onDownloadYaml={handleDownloadYaml}
          isValid={validation.isValid}
          selectedCount={selectedCount}
        />
      </div>

      {/* Code View Modal */}
      <CodeViewModal
        isOpen={isCodeViewOpen}
        onClose={() => setIsCodeViewOpen(false)}
        yaml={canonicalYaml}
        command={bootstrapSnippet}
        setupId={setupId}
        isValid={validation.isValid}
        errors={validation.errors}
        onCopyCommand={handleCopyCommand}
        onDownloadYaml={handleDownloadYaml}
      />
    </div>
  );
}
