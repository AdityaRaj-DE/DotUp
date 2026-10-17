'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { MODULES, PRESETS } from '../lib/modules';
import {
  generateDotupYaml,
  generateBootstrapSnippet,
  validateConfig,
  getDownloadFilename
} from '../lib/generator';
import VoxelTreeCanvas, { VoxelTreeCanvasHandle, SANCTUARY_MODULES } from './VoxelTreeCanvas';

interface SetupBuilderProps {
  initialBackendStatus?: string;
  initialDatabaseStatus?: string;
}

const CATEGORY_MAP: Record<string, { label: string; side: 'left' | 'right'; color: string }> = {
  system: { label: 'System Foundation', side: 'left', color: '#059669' },
  terminal: { label: 'Terminal & Shell', side: 'left', color: '#10b981' },
  editors: { label: 'Editors & IDEs', side: 'left', color: '#22c55e' },
  development: { label: 'Runtimes & SDKs', side: 'right', color: '#d97706' },
  infrastructure: { label: 'DevOps & Cloud', side: 'right', color: '#0d9488' }
};

const ALL_PRESET_ITEMS = [
  ...PRESETS.map((p) => ({
    id: p.id,
    label: p.name.toUpperCase(),
    desc: p.description,
    tools: p.modules
  })),
  {
    id: 'custom',
    label: 'CUSTOM',
    desc: 'Fine-tune individual canopy & root modules directly on the tree',
    tools: []
  }
];

const STEP_DEG = 360 / ALL_PRESET_ITEMS.length;

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

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'yaml' | 'bash' | 'info'>('yaml');
  const [infoSection, setInfoSection] = useState<'about' | 'howto' | 'policy' | 'developer'>('about');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const treeCanvasRef = useRef<VoxelTreeCanvasHandle>(null);
  const [resetSignal, setResetSignal] = useState(0);

  // 3D Carousel state
  const fullIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'full');
  const [targetAngle, setTargetAngle] = useState(-fullIdx * STEP_DEG);
  const [currentAngle, setCurrentAngle] = useState(-fullIdx * STEP_DEG);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startAngle: 0, velocity: 0 });

  // Camera & Tree references for 2D-to-3D SVG connectors
  const threeRefs = useRef<{ camera: THREE.PerspectiveCamera | null; treeGroup: THREE.Group | null }>({
    camera: null,
    treeGroup: null
  });

  const handleCameraRefOut = useCallback((cam: THREE.PerspectiveCamera, group: THREE.Group) => {
    threeRefs.current.camera = cam;
    threeRefs.current.treeGroup = group;
  }, []);

  // Validation
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

  // Select Preset by Index
  const selectPresetByIndex = useCallback(
    (idx: number, applyModules = true) => {
      const normIdx = ((idx % ALL_PRESET_ITEMS.length) + ALL_PRESET_ITEMS.length) % ALL_PRESET_ITEMS.length;
      const preset = ALL_PRESET_ITEMS[normIdx];

      const desiredMod = ((-normIdx * STEP_DEG) % 360 + 360) % 360;
      const currentMod = ((targetAngle % 360) + 360) % 360;
      let delta = desiredMod - currentMod;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
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
    [targetAngle]
  );

  // Sync body class for CUSTOM mode
  useEffect(() => {
    if (activePresetId === 'custom') {
      document.body.classList.add('custom-mode-active');
    } else {
      document.body.classList.remove('custom-mode-active');
    }
  }, [activePresetId]);

  // Carousel animation loop for spring interpolation
  useEffect(() => {
    let animId: number;
    const updateDial = () => {
      if (!dragRef.current.isDragging) {
        setCurrentAngle((curr) => curr + (targetAngle - curr) * 0.14);
      }
      animId = requestAnimationFrame(updateDial);
    };
    animId = requestAnimationFrame(updateDial);
    return () => cancelAnimationFrame(animId);
  }, [targetAngle]);

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

  // Reset all
  const handleResetAll = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('all');
    setResetSignal((prev) => prev + 1);
    const fullIndex = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'full');
    selectPresetByIndex(fullIndex, true);
    if (treeCanvasRef.current) {
      treeCanvasRef.current.resetCamera();
    }
    showToast('Restored Full Suite preset & reset view');
  }, [selectPresetByIndex, showToast]);

  // 2D-to-3D SVG Connectors
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
      {/* Soft Sunlight Bloom */}
      <div className="sunlight-bloom" />

      {/* 3D Voxel Stage */}
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

      {/* 1. TOP-LEFT: Hamburger Button + Bold Wordmark + Config Valid Badge */}
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
      <div
        id="drawer-backdrop"
        className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <aside id="side-drawer" className={`side-drawer ${isDrawerOpen ? 'open' : ''}`} aria-label="Site Navigation">
        <nav className="drawer-nav">
          <button
            className={`drawer-item ${infoSection === 'about' ? 'active' : ''}`}
            onClick={() => {
              setInfoSection('about');
              setModalTab('info');
              setIsModalOpen(true);
              setIsDrawerOpen(false);
            }}
          >
            <span>About DotUp</span>
            <span>→</span>
          </button>
          <button
            className={`drawer-item ${infoSection === 'howto' ? 'active' : ''}`}
            onClick={() => {
              setInfoSection('howto');
              setModalTab('info');
              setIsModalOpen(true);
              setIsDrawerOpen(false);
            }}
          >
            <span>How to Use</span>
            <span>→</span>
          </button>
          <button
            className={`drawer-item ${infoSection === 'policy' ? 'active' : ''}`}
            onClick={() => {
              setInfoSection('policy');
              setModalTab('info');
              setIsModalOpen(true);
              setIsDrawerOpen(false);
            }}
          >
            <span>Policy & Security</span>
            <span>→</span>
          </button>
          <button
            className={`drawer-item ${infoSection === 'developer' ? 'active' : ''}`}
            onClick={() => {
              setInfoSection('developer');
              setModalTab('info');
              setIsModalOpen(true);
              setIsDrawerOpen(false);
            }}
          >
            <span>Meet Developer</span>
            <span>→</span>
          </button>
        </nav>

        <div className="drawer-spec-box">
          <label htmlFor="spec-id-input">Workstation Metadata</label>
          <input
            id="spec-id-input"
            className="drawer-spec-input"
            type="text"
            value={setupId}
            onChange={(e) => setSetupId(e.target.value)}
            placeholder="Setup ID"
          />
          <input
            id="spec-ver-input"
            className="drawer-spec-input"
            type="text"
            value={setupVersion}
            onChange={(e) => setSetupVersion(e.target.value)}
            placeholder="Version"
          />
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, cursor: 'pointer' }}>
            <span>Reduced Motion</span>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              style={{ accentColor: 'var(--emerald-primary)', width: 16, height: 16 }}
            />
          </label>
        </div>
      </aside>

      {/* 2. TOP-CENTER 3D CYLINDRICAL CAROUSEL PRESET DIAL */}
      <section className="center-dial-stage" aria-label="3D Preset Selector Carousel">
        <div
          ref={carouselContainerRef}
          id="carousel-viewport"
          className="carousel-viewport"
          role="radiogroup"
          aria-label="Workstation Presets"
          tabIndex={0}
          onPointerDown={(e) => {
            dragRef.current.isDragging = true;
            dragRef.current.startX = e.clientX;
            dragRef.current.startAngle = currentAngle;
            dragRef.current.velocity = 0;
          }}
          onPointerMove={(e) => {
            if (!dragRef.current.isDragging) return;
            const dx = e.clientX - dragRef.current.startX;
            const nextAngle = dragRef.current.startAngle + dx * 0.32;
            dragRef.current.velocity = nextAngle - currentAngle;
            setCurrentAngle(nextAngle);
            setTargetAngle(nextAngle);
          }}
          onPointerUp={() => {
            if (!dragRef.current.isDragging) return;
            dragRef.current.isDragging = false;
            const projected = currentAngle + dragRef.current.velocity * 3.5;
            const snappedIdx = Math.round(-projected / STEP_DEG);
            selectPresetByIndex(snappedIdx, true);
          }}
          onWheel={(e) => {
            e.preventDefault();
            const curIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === activePresetId);
            const dir = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
            selectPresetByIndex(curIdx + dir, true);
          }}
          onKeyDown={(e) => {
            const curIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === activePresetId);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              selectPresetByIndex(curIdx + 1, true);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              selectPresetByIndex(curIdx - 1, true);
            }
          }}
        >
          <div id="carousel-cylinder" className="carousel-cylinder">
            {ALL_PRESET_ITEMS.map((preset, idx) => {
              const itemDeg = idx * STEP_DEG + currentAngle;
              const rad = (itemDeg * Math.PI) / 180;
              const radiusX = typeof window !== 'undefined' ? Math.min(320, window.innerWidth * 0.34) : 280;
              const radiusZ = 180;

              const x = Math.sin(rad) * radiusX;
              const z = Math.cos(rad) * radiusZ - radiusZ;
              const rotY = itemDeg * 0.55;

              const depthNorm = (Math.cos(rad) + 1) * 0.5;
              const scale = 0.52 + 0.48 * Math.pow(depthNorm, 1.35);
              const blurPx = (1 - Math.pow(depthNorm, 1.9)) * 7.5;
              const opacity = 0.15 + 0.85 * Math.pow(depthNorm, 1.6);
              const isFront = preset.id === activePresetId;

              return (
                <div
                  key={preset.id}
                  className={`dial-3d-item ${isFront ? 'is-front' : ''}`}
                  role="radio"
                  aria-checked={isFront}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectPresetByIndex(idx, true);
                  }}
                  style={{
                    transform: `translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
                    filter: blurPx < 0.35 ? 'none' : `blur(${blurPx.toFixed(2)}px)`,
                    opacity: opacity.toFixed(3),
                    zIndex: Math.round(depthNorm * 100),
                    pointerEvents: depthNorm > 0.28 ? 'auto' : 'none'
                  }}
                >
                  <div className="dial-3d-title">{preset.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dial-meta-bar">
          <span id="dial-tools-pill" className="dial-tools-pill">
            {activeToolCount} Tools Active
          </span>
          <span id="dial-desc-text" className="dial-hint-text">
            ← Drag, Scroll, or Click Preset →
          </span>
          <button
            id="btn-customize-toggle"
            className="customize-trigger-btn"
            title="Toggle Custom Module Cards"
            onClick={() => {
              if (activePresetId === 'custom') {
                const fullIndex = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'full');
                selectPresetByIndex(fullIndex, false);
              } else {
                const customIndex = ALL_PRESET_ITEMS.findIndex((p) => p.id === 'custom');
                selectPresetByIndex(customIndex, false);
              }
            }}
          >
            <span>{activePresetId === 'custom' ? 'Done Customizing' : 'Customize Stack'}</span>
            <span>✦</span>
          </button>
        </div>
      </section>

      {/* 3A. LEFT FLOATING COLUMN (CUSTOM MODE) */}
      <section className="floating-column column-left" aria-label="Canopy and Trunk Modules">
        <div className="filter-mini-bar lush-glass">
          <div className="filter-row-top">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--text-muted)' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="search-input"
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              id="category-filter"
              className="category-select"
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="system">System & Base</option>
              <option value="terminal">Terminal & Shell</option>
              <option value="development">Runtimes & SDKs</option>
              <option value="infrastructure">DevOps & Cloud</option>
              <option value="editors">Editors & Apps</option>
            </select>
          </div>
          <div className="filter-row-bottom">
            <span>{filteredModules.length} module{filteredModules.length === 1 ? '' : 's'}</span>
            <div className="quick-actions">
              <button type="button" className="quick-link" onClick={handleSelectShown}>
                Select Shown
              </button>
              <span>•</span>
              <button type="button" className="quick-link muted" onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="column-group-label">
          <span>Canopy & Trunk</span>
          <span className="zone-tag">SYSTEM • SHELL • EDITORS</span>
        </div>

        <div className="cards-scroll">
          {leftModules.map((mod) => {
            const isEnabled = Boolean(selectedModules[mod.id]?.enabled);
            const isHovered = hoveredModuleId === mod.id;
            const catMeta = CATEGORY_MAP[mod.category] || CATEGORY_MAP.system;

            return (
              <div
                key={mod.id}
                data-module-id={mod.id}
                className={`feature-card ${isEnabled ? 'enabled' : 'disabled'} ${isHovered ? 'highlighted' : ''}`}
                role="switch"
                aria-checked={isEnabled}
                tabIndex={0}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.version-select')) return;
                  handleToggleModule(mod.id);
                }}
                onPointerEnter={() => setHoveredModuleId(mod.id)}
                onPointerLeave={() => setHoveredModuleId((prev) => (prev === mod.id ? null : prev))}
              >
                <div className="card-left">
                  <div className="card-toggle">
                    <svg viewBox="0 0 24 24" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="card-info">
                    <div className="card-title-row">
                      <span className="cat-pip" style={{ background: catMeta.color }} />
                      <span className="card-name">{mod.name}</span>
                    </div>
                    <div className="card-desc" title={mod.description}>
                      {mod.description}
                    </div>
                  </div>
                </div>
                {mod.supportsVersion && mod.versionOptions && (
                  <select
                    className="version-select"
                    value={selectedModules[mod.id]?.version || mod.defaultVersion}
                    onChange={(e) => handleChangeVersion(mod.id, e.target.value)}
                  >
                    {mod.versionOptions.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label || v.value}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3B. RIGHT FLOATING COLUMN (CUSTOM MODE) */}
      <section className="floating-column column-right" aria-label="Land and Roots Modules">
        <div className="column-group-label">
          <span>Land & Roots</span>
          <span className="zone-tag">RUNTIMES • CLOUD • CONTAINERS</span>
        </div>

        <div className="cards-scroll">
          {rightModules.map((mod) => {
            const isEnabled = Boolean(selectedModules[mod.id]?.enabled);
            const isHovered = hoveredModuleId === mod.id;
            const catMeta = CATEGORY_MAP[mod.category] || CATEGORY_MAP.development;

            return (
              <div
                key={mod.id}
                data-module-id={mod.id}
                className={`feature-card ${isEnabled ? 'enabled' : 'disabled'} ${isHovered ? 'highlighted' : ''}`}
                role="switch"
                aria-checked={isEnabled}
                tabIndex={0}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.version-select')) return;
                  handleToggleModule(mod.id);
                }}
                onPointerEnter={() => setHoveredModuleId(mod.id)}
                onPointerLeave={() => setHoveredModuleId((prev) => (prev === mod.id ? null : prev))}
              >
                <div className="card-left">
                  <div className="card-toggle">
                    <svg viewBox="0 0 24 24" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="card-info">
                    <div className="card-title-row">
                      <span className="cat-pip" style={{ background: catMeta.color }} />
                      <span className="card-name">{mod.name}</span>
                    </div>
                    <div className="card-desc" title={mod.description}>
                      {mod.description}
                    </div>
                  </div>
                </div>
                {mod.supportsVersion && mod.versionOptions && (
                  <select
                    className="version-select"
                    value={selectedModules[mod.id]?.version || mod.defaultVersion}
                    onChange={(e) => handleChangeVersion(mod.id, e.target.value)}
                  >
                    {mod.versionOptions.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label || v.value}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BOTTOM-LEFT: Copy Command / Download YAML / Code View */}
      <footer className="bottom-left-dock lush-glass">
        <div className="dock-counter">
          <span className="status-dot" />
          <span><strong id="dock-tool-count">{activeToolCount}</strong> tools</span>
        </div>
        <button id="btn-copy-cmd" className="btn btn-primary" onClick={handleCopyCommand}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy Command</span>
        </button>
        <button id="btn-download-yaml" className="btn" onClick={handleDownloadYaml}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download YAML</span>
        </button>
        <button
          id="btn-code-view"
          className="btn"
          onClick={() => {
            setModalTab('yaml');
            setIsModalOpen(true);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Code View</span>
        </button>
      </footer>

      {/* 5. BOTTOM-RIGHT: Reset View & Reset All */}
      <div className="bottom-right-dock lush-glass">
        <button
          id="btn-reset-view"
          className="btn"
          title="Reset 3D Camera Angle"
          onClick={() => {
            if (treeCanvasRef.current) {
              treeCanvasRef.current.resetCamera();
            }
            showToast('Camera view reset');
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Reset View</span>
        </button>
        <button id="btn-reset-all" className="btn" title="Restore Full Suite Preset & Camera" onClick={handleResetAll}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span>Reset</span>
        </button>
      </div>

      {/* Toast Notification */}
      <div id="toast" className={`toast ${toastMessage ? 'show' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toast-text">{toastMessage}</span>
      </div>

      {/* Code View & Info Modal */}
      <div
        id="code-modal"
        className={`modal-overlay ${isModalOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={() => setIsModalOpen(false)}
      >
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-tabs" id="modal-tabs">
              <button
                type="button"
                className={`modal-tab ${modalTab === 'yaml' ? 'active' : ''}`}
                onClick={() => setModalTab('yaml')}
              >
                dotup.yaml
              </button>
              <button
                type="button"
                className={`modal-tab ${modalTab === 'bash' ? 'active' : ''}`}
                onClick={() => setModalTab('bash')}
              >
                bootstrap.sh
              </button>
              {modalTab === 'info' && (
                <button type="button" className="modal-tab active">
                  {infoSection.toUpperCase()}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                id="btn-modal-copy"
                className="btn btn-primary"
                style={{ height: 34, fontSize: 12 }}
                onClick={() => {
                  const text = modalTab === 'yaml' ? canonicalYaml : modalTab === 'bash' ? bootstrapSnippet : infoSection;
                  if (navigator.clipboard) navigator.clipboard.writeText(text);
                  showToast('Copied content to clipboard!');
                }}
              >
                Copy Code
              </button>
              <button
                id="btn-modal-close"
                className="btn"
                style={{ height: 34, fontSize: 12 }}
                onClick={() => setIsModalOpen(false)}
              >
                Close (Esc)
              </button>
            </div>
          </div>
          <div id="modal-code-content" className="modal-body">
            {modalTab === 'yaml' && canonicalYaml}
            {modalTab === 'bash' && bootstrapSnippet}
            {modalTab === 'info' && (
              <>
                {infoSection === 'about' &&
                  `# About DotUp (Sanctuary Edition)\n\nDotUp visually configures your developer workstation around an interactive 3D voxel tree standing in an expansive botanical meadow.\n\nSpin the center 3D preset carousel or switch to CUSTOM mode to curate canopy and root tools.`}
                {infoSection === 'howto' &&
                  `# How to Use\n\n1. Spin the Center 3D Preset Dial (drag horizontally, scroll, or click blurred side presets).\n2. Rotate to 'CUSTOM' (or click 'Customize Stack') to reveal the floating Canopy & Root module cards.\n3. Export your dotup.yaml or copy the one-line bootstrap command at the bottom-left.`}
                {infoSection === 'policy' &&
                  `# Policy & Security\n\nZero-Backend Execution: All YAML specs and shell bootstrap scripts are generated directly in your browser with zero telemetry.`}
                {infoSection === 'developer' &&
                  `# Meet Developer\n\nLead Architect: Aditya Raj\nBuilt with Three.js InstancedMesh, CSS 3D depth-of-field transforms, and sunlit minimalist glassmorphism.`}
              </>
            )}
          </div>
          <div className="modal-footer">
            <span id="modal-curl-preview">curl -sSL https://dotup.dev/setup/{setupId} | bash</span>
            <span>DotUp Sanctuary Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
