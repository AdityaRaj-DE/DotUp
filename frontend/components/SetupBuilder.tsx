'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { MODULES } from '../lib/modules';
import {
  generateDotupYaml,
  generateBootstrapSnippet,
  validateConfig,
  getDownloadFilename
} from '../lib/generator';
import VoxelTreeCanvas, { VoxelTreeCanvasHandle, SANCTUARY_MODULES } from './VoxelTreeCanvas';
import PresetDial, { ALL_PRESET_ITEMS, STEP_DEG } from './PresetDial';
import CustomModuleColumns, { CATEGORY_MAP } from './CustomModuleColumns';
import NavigationDrawer from './NavigationDrawer';
import InfoModal, { InfoSectionType } from './InfoModal';
import CodeExportModal from './CodeExportModal';
import ActionDocks from './ActionDocks';

interface SetupBuilderProps {
  initialBackendStatus?: string;
  initialDatabaseStatus?: string;
}

export default function SetupBuilder({
  initialBackendStatus = 'ok',
  initialDatabaseStatus = 'ok'
}: SetupBuilderProps) {
  // Authoritative config state
  const [setupId, setSetupId] = useState('lush-sanctuary');
  const [setupVersion, setSetupVersion] = useState('1.0.0');
  const [setupDescription, setSetupDescription] = useState(
    'Comprehensive developer workstation in White & Lush Sanctuary'
  );
  const [activePresetId, setActivePresetId] = useState<string>('full');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Selected Modules
  const [selectedModules, setSelectedModules] = useState<
    Record<string, { enabled: boolean; version?: string }>
  >(() => {
    const initial: Record<string, { enabled: boolean; version?: string }> = {};
    MODULES.forEach((m) => {
      initial[m.id] = {
        enabled: true,
        version: m.defaultVersion || (m.versionOptions ? m.versionOptions[0]?.value : '')
      };
    });
    return initial;
  });

  // Filter state in Custom Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null);

  // Navigation Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoSection, setInfoSection] = useState<InfoSectionType>('about');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3D Scene Controls & Reset
  const treeCanvasRef = useRef<VoxelTreeCanvasHandle>(null);
  const [resetSignal, setResetSignal] = useState(0);

  // 3D Carousel Angle state
  const fullIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'full');
  const [targetAngle, setTargetAngle] = useState(-fullIdx * STEP_DEG);
  const [currentAngle, setCurrentAngle] = useState(-fullIdx * STEP_DEG);

  // Camera & Tree references for 2D-to-3D SVG connectors
  const threeRefs = useRef<{ camera: THREE.PerspectiveCamera | null; treeGroup: THREE.Group | null }>({
    camera: null,
    treeGroup: null
  });

  const handleCameraRefOut = useCallback((cam: THREE.PerspectiveCamera, group: THREE.Group) => {
    threeRefs.current.camera = cam;
    threeRefs.current.treeGroup = group;
  }, []);

  // Validation & Code Generation
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

  const activeToolCount = useMemo(() => {
    return Object.values(selectedModules).filter((m) => m.enabled).length;
  }, [selectedModules]);

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // Select Preset with Rotational Animation
  const selectPresetByIndex = useCallback(
    (idx: number, applyModules = true) => {
      const normIdx = ((idx % ALL_PRESET_ITEMS.length) + ALL_PRESET_ITEMS.length) % ALL_PRESET_ITEMS.length;
      const preset = ALL_PRESET_ITEMS[normIdx];

      const desiredMod = ((-normIdx * STEP_DEG) % 360 + 360) % 360;
      const currentMod = ((targetAngle % 360) + 360) % 360;
      let delta = desiredMod - currentMod;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // Special rotating spin animation when selecting CUSTOM
      if (preset.id === 'custom' && activePresetId !== 'custom') {
        const spinSign = delta >= 0 ? 1 : -1;
        delta += spinSign * 360;
      }

      setTargetAngle((prev) => prev + delta);
      setActivePresetId(preset.id);

      if (applyModules && preset.id !== 'custom') {
        setSelectedModules((prev) => {
          const next = { ...prev };
          MODULES.forEach((m) => {
            next[m.id] = {
              ...next[m.id],
              enabled: preset.tools.includes(m.id)
            };
          });
          return next;
        });
      }
    },
    [targetAngle, activePresetId]
  );

  // Toggle Customize Button
  const handleToggleCustomize = useCallback(() => {
    if (activePresetId === 'custom') {
      const fullIndex = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'full');
      selectPresetByIndex(fullIndex, false);
    } else {
      const customIndex = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'custom');
      selectPresetByIndex(customIndex, false);
    }
  }, [activePresetId, selectPresetByIndex]);

  // Sync body class for CUSTOM mode
  useEffect(() => {
    if (activePresetId === 'custom') {
      document.body.classList.add('custom-mode-active');
    } else {
      document.body.classList.remove('custom-mode-active');
    }
  }, [activePresetId]);

  // Module toggle
  const handleToggleModule = useCallback((id: string) => {
    const customIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'custom');
    selectPresetByIndex(customIdx, false);
    setSelectedModules((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id]?.enabled
      }
    }));
  }, [selectPresetByIndex]);

  const handleChangeVersion = useCallback((id: string, ver: string) => {
    setSelectedModules((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        version: ver
      }
    }));
  }, []);

  // Filtered modules
  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MODULES.filter((m) => {
      const catMatch = categoryFilter === 'all' || m.category === categoryFilter;
      const qMatch = !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [searchQuery, categoryFilter]);

  const leftModules = useMemo(() => {
    return filteredModules.filter((m) => CATEGORY_MAP[m.category]?.side === 'left');
  }, [filteredModules]);

  const rightModules = useMemo(() => {
    return filteredModules.filter((m) => CATEGORY_MAP[m.category]?.side === 'right');
  }, [filteredModules]);

  // Bulk actions
  const handleSelectShown = useCallback(() => {
    const customIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'custom');
    selectPresetByIndex(customIdx, false);
    setSelectedModules((prev) => {
      const next = { ...prev };
      filteredModules.forEach((m) => {
        next[m.id] = { ...next[m.id], enabled: true };
      });
      return next;
    });
  }, [filteredModules, selectPresetByIndex]);

  const handleClearAll = useCallback(() => {
    const customIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'custom');
    selectPresetByIndex(customIdx, false);
    setSelectedModules((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => {
        next[m.id] = { ...next[m.id], enabled: false };
      });
      return next;
    });
  }, [selectPresetByIndex]);

  // Copy command
  const handleCopyCommand = useCallback(() => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(bootstrapSnippet);
    } else {
      const ta = document.createElement('textarea');
      ta.value = bootstrapSnippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast('Copied bootstrap command to clipboard!');
  }, [bootstrapSnippet, showToast]);

  // Download YAML
  const handleDownloadYaml = useCallback(() => {
    const blob = new Blob([canonicalYaml], { type: 'application/x-yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadFilename(setupId);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${getDownloadFilename(setupId)}`);
  }, [canonicalYaml, setupId, showToast]);

  // Reset View & Reset All Handlers
  const handleResetView = useCallback(() => {
    if (treeCanvasRef.current) {
      treeCanvasRef.current.resetCamera();
    }
    showToast('Camera angle & view reset');
  }, [showToast]);

  const handleResetAll = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('all');
    setResetSignal((prev) => prev + 1);
    const fullIndex = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'full');
    selectPresetByIndex(fullIndex, true);
    if (treeCanvasRef.current) {
      treeCanvasRef.current.resetCamera();
    }
    showToast('Restored Full Suite & reset camera view');
  }, [selectPresetByIndex, showToast]);

  // Open Info Sections from Navigation Bar
  const handleOpenInfoSection = useCallback((sec: InfoSectionType) => {
    setInfoSection(sec);
    setIsInfoModalOpen(true);
  }, []);

  // 2D-to-3D SVG Connectors in Custom Mode
  const [connectorPaths, setConnectorPaths] = useState<
    Array<{ id: string; d: string; dotX: number; dotY: number; color: string; width: number; opacity: number }>
  >([]);

  useEffect(() => {
    if (activePresetId !== 'custom') {
      setConnectorPaths([]);
      return;
    }

    let frameId: number;
    const projVec = new THREE.Vector3();

    const updateLines = () => {
      const cam = threeRefs.current.camera;
      const group = threeRefs.current.treeGroup;
      if (!cam || !group || window.innerWidth <= 1024) {
        frameId = requestAnimationFrame(updateLines);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      const lines: typeof connectorPaths = [];

      SANCTUARY_MODULES.forEach((mod) => {
        const cardEl = document.querySelector(`[data-module-id="${mod.id}"]`);
        if (!cardEl) return;

        const rect = cardEl.getBoundingClientRect();
        const parentRect = cardEl.parentElement?.getBoundingClientRect();
        if (parentRect && (rect.bottom < parentRect.top || rect.top > parentRect.bottom)) {
          return;
        }

        const isLeft = CATEGORY_MAP[mod.category]?.side === 'left';
        const startX = isLeft ? rect.right : rect.left;
        const startY = rect.top + rect.height / 2;

        projVec.set(mod.anchor[0], mod.anchor[1], mod.anchor[2]);
        projVec.applyMatrix4(group.matrixWorld);
        projVec.project(cam);

        const endX = (projVec.x * 0.5 + 0.5) * w;
        const endY = (-projVec.y * 0.5 + 0.5) * h;

        const ctrlOffset = isLeft ? 85 : -85;
        const dStr = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${(startX + ctrlOffset).toFixed(1)} ${startY.toFixed(1)}, ${(endX - ctrlOffset * 0.5).toFixed(1)} ${endY.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;

        const isEnabled = Boolean(selectedModules[mod.id]?.enabled);
        const isHovered = hoveredModuleId === mod.id;

        lines.push({
          id: mod.id,
          d: dStr,
          dotX: endX,
          dotY: endY,
          color: isHovered ? '#d97706' : isEnabled ? '#059669' : '#94a3b8',
          width: isHovered ? 2.5 : isEnabled ? 1.5 : 1.0,
          opacity: isHovered ? 0.95 : isEnabled ? 0.52 : 0.25
        });
      });

      setConnectorPaths(lines);
      frameId = requestAnimationFrame(updateLines);
    };

    frameId = requestAnimationFrame(updateLines);
    return () => cancelAnimationFrame(frameId);
  }, [activePresetId, selectedModules, hoveredModuleId]);

  return (
    <div className="app-shell">
      {/* 3D Voxel Stage with Branches, Dynamic Shadows & 3D Sunlight */}
      <VoxelTreeCanvas
        ref={treeCanvasRef}
        selectedModules={selectedModules}
        hoveredModuleId={hoveredModuleId}
        onHoverModule={setHoveredModuleId}
        onToggleModule={handleToggleModule}
        reducedMotion={reducedMotion}
        resetSignal={resetSignal}
        cameraRefOut={handleCameraRefOut}
      />

      {/* Dynamic 2D-to-3D SVG Connector Lines in CUSTOM Mode */}
      <svg id="connector-svg" xmlns="http://www.w3.org/2000/svg">
        <g id="connector-paths-group">
          {connectorPaths.map((c) => (
            <React.Fragment key={c.id}>
              <path
                d={c.d}
                stroke={c.color}
                strokeWidth={c.width}
                opacity={c.opacity}
                fill="none"
                strokeLinecap="round"
                className="connector-path"
              />
              <circle cx={c.dotX} cy={c.dotY} r={c.width * 2} fill={c.color} opacity={c.opacity} />
            </React.Fragment>
          ))}
        </g>
      </svg>

      {/* TOP-LEFT: Hamburger Navigation + Wordmark + Config Valid Badge */}
      <header className="top-left-bar">
        <button
          id="hamburger-btn"
          className={`hamburger-btn ${isDrawerOpen ? 'open' : ''}`}
          aria-label="Open Navigation Menu"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="brand-pill lush-glass">
          <div className="brand-wordmark">
            <span className="brand-leaf" />
            <span>DotUp</span>
          </div>
          <div className="divider-v" />
          <div className={`status-badge ${validation.isValid ? '' : 'has-issues'}`}>
            <span className={`status-dot ${validation.isValid ? '' : 'warning'}`} />
            <span>{validation.isValid ? 'Config Valid' : `${validation.errors.length} Issues`}</span>
          </div>
        </div>
      </header>

      {/* Slide-Out Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenInfoSection={handleOpenInfoSection}
        setupId={setupId}
        setSetupId={setSetupId}
        setupVersion={setupVersion}
        setSetupVersion={setSetupVersion}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
      />

      {/* TOP-CENTER 3D CYLINDRICAL CAROUSEL PRESET DIAL */}
      <PresetDial
        activePresetId={activePresetId}
        onSelectPresetByIndex={selectPresetByIndex}
        activeToolCount={activeToolCount}
        onToggleCustomize={handleToggleCustomize}
        targetAngle={targetAngle}
        setTargetAngle={setTargetAngle}
        currentAngle={currentAngle}
        setCurrentAngle={setCurrentAngle}
      />

      {/* FLOATING CANOPY & ROOT MODULE CARDS (CUSTOM MODE) */}
      <CustomModuleColumns
        leftModules={leftModules}
        rightModules={rightModules}
        selectedModules={selectedModules}
        hoveredModuleId={hoveredModuleId}
        onHoverModule={setHoveredModuleId}
        onToggleModule={handleToggleModule}
        onChangeVersion={handleChangeVersion}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        filteredCount={filteredModules.length}
        onSelectShown={handleSelectShown}
        onClearAll={handleClearAll}
      />

      {/* BOTTOM ACTION DOCKS */}
      <ActionDocks
        activeToolCount={activeToolCount}
        onCopyCommand={handleCopyCommand}
        onDownloadYaml={handleDownloadYaml}
        onOpenCodeView={() => setIsCodeModalOpen(true)}
        onResetView={handleResetView}
        onResetAll={handleResetAll}
      />

      {/* Toast Notification */}
      <div id="toast" className={`toast ${toastMessage ? 'show' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toast-text">{toastMessage}</span>
      </div>

      {/* Dedicated Information Modal (About, How to Use, Policy, Developer - NO copy code button) */}
      <InfoModal
        isOpen={isInfoModalOpen}
        section={infoSection}
        onClose={() => setIsInfoModalOpen(false)}
        onSelectSection={setInfoSection}
      />

      {/* Dedicated Code View Modal (YAML & Bash export with Copy Code button) */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        yamlCode={canonicalYaml}
        bashCode={bootstrapSnippet}
        setupId={setupId}
        onCopyText={(text) => {
          if (navigator.clipboard) navigator.clipboard.writeText(text);
          showToast('Copied content to clipboard!');
        }}
      />
    </div>
  );
}
