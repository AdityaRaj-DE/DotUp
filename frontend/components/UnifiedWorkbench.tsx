'use client';

import React, { useState, useMemo } from 'react';
import { MODULES, CATEGORIES, PRESETS, ProfilePreset, ModuleDefinition } from '../lib/modules';
import AnimatedPresetPill from './AnimatedPresetPill';
import AsciiRevealText from './AsciiRevealText';
import AsciiGlitchText, { useAsciiGlitch } from './AsciiGlitchText';
import {
  LayersIcon,
  SearchIcon,
  XIcon,
  GearIcon,
  TerminalIcon,
  CodeIcon,
  CloudIcon,
  WindowIcon,
  EyeIcon,
  RotateCcwIcon,
  ModuleSymbol
} from './Icons';
import LiquidDropdown from './LiquidDropdown';
import { useGridCols, isLastRow } from '../lib/useGridCols';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedWorkbenchProps {
  activePresetId: string;
  presetModuleCounts: Record<string, number>;
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  onSelectPreset: (presetId: string) => void;
  onToggleModule: (id: string) => void;
  onChangeVersion: (id: string, version: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectAllVisible: () => void;
  onClearAll: () => void;
}

export default function UnifiedWorkbench({
  activePresetId,
  presetModuleCounts,
  selectedModules,
  onSelectPreset,
  onToggleModule,
  onChangeVersion,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onSelectAllVisible,
  onClearAll
}: UnifiedWorkbenchProps) {
  const [showDescriptions, setShowDescriptions] = useState(false);
  const gridCols = useGridCols();
  const isCustom = activePresetId === 'custom';

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.id === activePresetId),
    [activePresetId]
  );

  const selectedCount = useMemo(
    () => Object.values(selectedModules).filter((m) => m.enabled).length,
    [selectedModules]
  );

  // When a preset is selected, display only enabled modules in that preset.
  // When Custom is selected, display all modules (filterable by category & search).
  const visibleModules = useMemo(() => {
    if (!isCustom) {
      return MODULES.filter((m) => selectedModules[m.id]?.enabled);
    }
    return MODULES.filter((m) => {
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [isCustom, selectedModules, selectedCategory, searchQuery]);

  const getCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case 'system':
        return <GearIcon size={14} />;
      case 'terminal':
        return <TerminalIcon size={14} />;
      case 'code':
        return <CodeIcon size={14} />;
      case 'cloud':
        return <CloudIcon size={14} />;
      case 'window':
        return <WindowIcon size={14} />;
      default:
        return <LayersIcon size={14} />;
    }
  };

  return (
    <div className="preset-unified-card" data-ascii="surface">
      {/* Top Section: Persistent Pill Bar (Never unmounts or jumps) */}
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
            const pCount = presetModuleCounts?.[preset.id] ?? preset.modules.length;

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
            count={selectedCount}
            isSelected={isCustom}
            isCustom={true}
            onClick={() => onSelectPreset('custom')}
            index={PRESETS.length}
          />
        </div>
      </div>

      {/* Middle Section: Header with description + toggle button */}
      <div className="preset-unified-body">
        <div className="preset-modules-header">
          <div className="preset-desc-left">
            <div className="preset-desc-badge-row">
              <span className="preset-desc-tagline">
                <AsciiRevealText
                  key={isCustom ? 'custom-tagline' : activePreset?.id || 'preset-tagline'}
                  text={isCustom ? 'Custom Tailored Environment' : activePreset?.tagline || activePreset?.name || 'Curated Stack'}
                  preset="blueprint"
                />
              </span>
              <span className="preset-desc-modules-count">
                {isCustom ? `${selectedCount} of ${MODULES.length} Selected` : `${visibleModules.length} tools included`}
              </span>
            </div>
            <p className="preset-desc-text">
              <AsciiRevealText
                key={isCustom ? 'custom-desc' : activePreset?.id || 'preset-desc'}
                text={
                  isCustom
                    ? 'Build your own setup from scratch. Select and configure specific runtimes, cloud SDKs, shells, and tools below.'
                    : activePreset?.description || 'Pre-tuned development baselines ready to provision.'
                }
                preset="decode"
                duration={1500}
              />
            </p>
          </div>

          <div className="preset-header-actions-row">
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

        {/* Custom Toolbar (Search + Categories) with smooth accordion collapse */}
        <AnimatePresence initial={false}>
          {isCustom && (
            <motion.div
              key="custom-controls"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="explorer-controls" style={{ paddingBottom: '0.5rem' }}>
                <div className="search-input-wrap">
                  <SearchIcon size={15} className="search-icon-inside" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Filter modules by name, tool ID, or capability..."
                    className="search-input"
                    aria-label="Filter modules"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="search-clear-btn"
                      aria-label="Clear search"
                    >
                      <XIcon size={13} />
                    </button>
                  )}
                </div>

                <div className="filter-toolbar">
                  <div className="category-pills" role="tablist" aria-label="Module categories">
                    <CategoryFilterPill
                      label="All Modules"
                      count={MODULES.length}
                      isActive={selectedCategory === 'all'}
                      onClick={() => onSelectCategory('all')}
                    />

                    {CATEGORIES.map((cat) => {
                      const count = MODULES.filter((m) => m.category === cat.id).length;
                      const isCatActive = selectedCategory === cat.id;

                      return (
                        <CategoryFilterPill
                          key={cat.id}
                          label={cat.label}
                          count={count}
                          isActive={isCatActive}
                          icon={getCategoryIcon(cat.iconType)}
                          onClick={() => onSelectCategory(cat.id)}
                        />
                      );
                    })}
                  </div>

                  <div className="bulk-actions">
                    <FilterActionButton
                      title="Select all currently visible modules"
                      label="Select All"
                      onClick={onSelectAllVisible}
                    />
                    <FilterActionButton
                      title="Deselect all modules"
                      label="Clear"
                      onClick={onClearAll}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matrix Grid: Shared layout with fluid framer-motion re-ordering & transitions */}
        {visibleModules.length === 0 ? (
          <div className="empty-state" data-ascii="surface">
            <span className="crosshair crosshair-tl" />
            <span className="crosshair crosshair-tr" />
            <span className="crosshair crosshair-bl" />
            <span className="crosshair crosshair-br" />

            <div className="empty-state-icon">
              <SearchIcon size={22} />
            </div>
            <h3 className="empty-state-title">
              <AsciiGlitchText text="No modules matched your criteria" />
            </h3>
            <p className="empty-state-desc">
              {searchQuery ? (
                <>
                  No developer tools matching{' '}
                  <code className="empty-state-query">&ldquo;{searchQuery}&rdquo;</code> in the current filter.
                </>
              ) : (
                'No developer tools found in this category.'
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="btn-empty-reset"
            >
              <RotateCcwIcon size={13} />
              <AsciiGlitchText text="Reset Search & Filters" />
            </button>
          </div>
        ) : (
          <motion.div layout className="modules-matrix-grid category-module-grid">
            <AnimatePresence mode="popLayout">
              {visibleModules.map((mod: ModuleDefinition, idx: number) => {
                const isChecked = !!selectedModules[mod.id]?.enabled;
                const ver = selectedModules[mod.id]?.version || mod.defaultVersion || '';
                const isLast = isLastRow(idx, visibleModules.length, gridCols);

                return (
                  <WorkbenchMatrixCard
                    key={mod.id}
                    module={mod}
                    isCustom={isCustom}
                    isSelected={isChecked}
                    isLastRow={isLast}
                    selectedVersion={ver}
                    showDescription={showDescriptions}
                    onToggle={onToggleModule}
                    onChangeVersion={onChangeVersion}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const WorkbenchMatrixCard = React.forwardRef<
  HTMLDivElement,
  {
    module: ModuleDefinition;
    isCustom: boolean;
    isSelected: boolean;
    isLastRow?: boolean;
    selectedVersion: string;
    showDescription: boolean;
    onToggle: (id: string) => void;
    onChangeVersion: (id: string, version: string) => void;
  }
>(function WorkbenchMatrixCard(
  {
    module,
    isCustom,
    isSelected,
    isLastRow,
    selectedVersion,
    showDescription,
    onToggle,
    onChangeVersion
  },
  ref
) {
  const { displayText: titleText, triggerGlitch, resetGlitch } = useAsciiGlitch(module.name);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isCustom) return;
    if (e.key === ' ' || e.key === 'Enter') {
      if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        onToggle(module.id);
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      role={isCustom ? 'checkbox' : undefined}
      aria-checked={isCustom ? isSelected : undefined}
      aria-label={`${module.name} (${module.id})`}
      tabIndex={isCustom ? 0 : undefined}
      data-ascii="surface"
      onClick={() => isCustom && onToggle(module.id)}
      onKeyDown={handleKeyDown}
      onMouseEnter={triggerGlitch}
      onMouseLeave={resetGlitch}
      className={`matrix-cell ${!isCustom ? 'matrix-cell-static' : ''} ${
        isCustom && isSelected ? 'matrix-cell-selected' : ''
      } ${isLastRow ? 'is-last-row' : ''}`}
    >
      <div className="matrix-cell-top">
        <div className="matrix-cell-left">
          {isCustom && <span className="matrix-cell-indicator" aria-hidden="true" />}
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
                value={selectedVersion || module.defaultVersion || ''}
                options={module.versionOptions}
                onChange={(val) => onChangeVersion(module.id, val)}
              />
            ) : (
              <input
                type="text"
                aria-label={`${module.name} version`}
                value={selectedVersion}
                placeholder="v"
                onChange={(e) => onChangeVersion(module.id, e.target.value)}
                className="module-version-input"
              />
            )}
          </div>
        )}
      </div>

      {/* Description with smooth accordion collapse transition */}
      <div className={`matrix-cell-desc-collapse ${showDescription ? 'matrix-cell-desc-open' : ''}`}>
        <p className="matrix-cell-desc">{module.description}</p>
      </div>
    </motion.div>
  );
});

WorkbenchMatrixCard.displayName = 'WorkbenchMatrixCard';

function CategoryFilterPill({
  label,
  count,
  isActive,
  icon,
  onClick
}: {
  label: string;
  count: number;
  isActive: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  const { displayText, triggerGlitch, resetGlitch } = useAsciiGlitch(label);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      onMouseEnter={triggerGlitch}
      onMouseLeave={resetGlitch}
      className={`filter-pill ${isActive ? 'filter-pill-active' : ''}`}
    >
      {icon && <span className="filter-pill-icon">{icon}</span>}
      <span>{displayText}</span>
      <span className="filter-pill-count">{count}</span>
    </button>
  );
}

function FilterActionButton({
  title,
  label,
  onClick
}: {
  title: string;
  label: string;
  onClick: () => void;
}) {
  const { displayText, triggerGlitch, resetGlitch } = useAsciiGlitch(label);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={triggerGlitch}
      onMouseLeave={resetGlitch}
      className="btn-filter-action"
      title={title}
    >
      <span>{displayText}</span>
    </button>
  );
}
