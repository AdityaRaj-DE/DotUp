'use client';

import React, { useMemo, useState } from 'react';
import { MODULES, CATEGORIES, PRESETS, ProfilePreset, ModuleDefinition } from '../lib/modules';
import ModuleCard from './ModuleCard';
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
  SparklesIcon,
  SlidersIcon,
  CheckIcon,
  RotateCcwIcon
} from './Icons';
import AsciiRevealText from './AsciiRevealText';
import AnimatedPresetPill from './AnimatedPresetPill';
import AsciiGlitchText, { useAsciiGlitch } from './AsciiGlitchText';
import { useGridCols, isLastRow } from '../lib/useGridCols';
import { AnimatePresence, motion } from 'framer-motion';

interface ModuleExplorerProps {
  activePresetId?: string;
  presetModuleCounts?: Record<string, number>;
  onSelectPreset?: (presetId: string) => void;
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  onToggleModule: (id: string) => void;
  onChangeVersion: (id: string, version: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectAllVisible: () => void;
  onClearAll: () => void;
}

export default function ModuleExplorer({
  activePresetId = 'custom',
  presetModuleCounts = {},
  onSelectPreset,
  selectedModules,
  onToggleModule,
  onChangeVersion,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onSelectAllVisible,
  onClearAll
}: ModuleExplorerProps) {
  const [showDescriptions, setShowDescriptions] = useState(false);
  const gridCols = useGridCols();
  const isCustomActive = activePresetId === 'custom';

  const filteredModules = useMemo(() => {
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
  }, [searchQuery, selectedCategory]);

  const selectedCount = Object.values(selectedModules).filter((m) => m.enabled).length;

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
    <section aria-labelledby="modules-heading" className="preset-unified-card">
      {/* Top Section: Integrated Preset Pills Bar */}
      {onSelectPreset && (
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
              isSelected={isCustomActive}
              isCustom={true}
              onClick={() => onSelectPreset('custom')}
              index={PRESETS.length}
            />
          </div>
        </div>
      )}

      {/* Preset / Custom Description Header & Controls */}
      <div className="preset-modules-header">
        <div className="preset-desc-left">
          <div className="preset-desc-badge-row">
            <span className="preset-desc-tagline">
              <AsciiRevealText
                text="Custom Tailored Environment"
                preset="blueprint"
                triggerKey="custom"
              />
            </span>
            <span className="preset-desc-modules-count">
              {selectedCount} of {MODULES.length} Selected
            </span>
          </div>
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

      {/* Explorer Controls: Search + Categories */}
      <div className="explorer-controls">
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

        {/* Category Pills & Bulk Actions Toolbar */}
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

      {/* Module Grid */}
      <div className="modules-container">
        {filteredModules.length === 0 ? (
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
                  <code className="empty-state-query">&ldquo;{searchQuery}&rdquo;</code>{' '}
                  in the current filter.
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
              {filteredModules.map((mod: ModuleDefinition, idx: number) => {
                const isChecked = !!selectedModules[mod.id]?.enabled;
                const ver = selectedModules[mod.id]?.version || '';
                const isLast = isLastRow(idx, filteredModules.length, gridCols);

                return (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
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
    </section>
  );
}

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
