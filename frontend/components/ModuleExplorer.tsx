'use client';

import React, { useMemo, useState } from 'react';
import { MODULES, CATEGORIES, ModuleDefinition } from '../lib/modules';
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
  EyeIcon
} from './Icons';

interface ModuleExplorerProps {
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
    <section aria-labelledby="modules-heading" className="panel-card">
      {/* Panel header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-icon-wrap">
            <LayersIcon size={16} />
          </span>
          <div>
            <h2 id="modules-heading" className="panel-title">Component Modules</h2>
            <p className="panel-subtitle">Select environment tools, runtimes, and editors</p>
          </div>
        </div>

        <div className="module-header-actions-group">
          <button
            type="button"
            onClick={() => setShowDescriptions(!showDescriptions)}
            className={`btn-desc-toggle ${showDescriptions ? 'btn-desc-toggle-active' : ''}`}
            title={showDescriptions ? 'Hide descriptions on cards' : 'Show descriptions on all cards'}
          >
            <EyeIcon size={13} />
            <span>{showDescriptions ? 'Hide Descriptions' : 'Show Descriptions'}</span>
          </button>

          <span className="badge-pill badge-primary">
            {selectedCount} of {MODULES.length} Selected
          </span>
        </div>
      </div>

      {/* Explorer Controls: Search + Categories */}
      <div className="explorer-controls">
        <div className="search-bar">
          <SearchIcon size={15} className="search-icon" />
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
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all'}
              onClick={() => onSelectCategory('all')}
              className={`filter-pill ${selectedCategory === 'all' ? 'filter-pill-active' : ''}`}
            >
              All Modules ({MODULES.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = MODULES.filter((m) => m.category === cat.id).length;
              const isCatActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isCatActive}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`filter-pill ${isCatActive ? 'filter-pill-active' : ''}`}
                >
                  <span className="filter-pill-icon">{getCategoryIcon(cat.iconType)}</span>
                  <span>{cat.label}</span>
                  <span className="filter-pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="bulk-actions">
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="btn-filter-action"
              title="Select all currently visible modules"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="btn-filter-action"
              title="Deselect all modules"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="modules-container">
        {filteredModules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SearchIcon size={24} />
            </div>
            <h3 className="empty-state-title">No modules matched your criteria</h3>
            <p className="empty-state-desc">
              We couldn&apos;t find any tools matching &ldquo;{searchQuery}&rdquo; in this category.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="category-module-grid">
            {filteredModules.map((mod: ModuleDefinition) => {
              const isChecked = !!selectedModules[mod.id]?.enabled;
              const ver = selectedModules[mod.id]?.version || '';

              return (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  isSelected={isChecked}
                  selectedVersion={ver}
                  showDescription={showDescriptions}
                  onToggle={onToggleModule}
                  onChangeVersion={onChangeVersion}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
