'use client';

import React, { useMemo } from 'react';
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
  RotateCcwIcon,
  CheckIcon
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
  // Filter modules based on search query and category
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
        <div className="module-header-actions">
          <span className="badge-pill badge-primary">
            {selectedCount} of {MODULES.length} Selected
          </span>
        </div>
      </div>

      {/* Explorer Controls: Search + Categories */}
      <div className="explorer-controls">
        {/* Search Input */}
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
                  <span className="filter-pill-count">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Bulk Actions */}
          <div className="bulk-actions">
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="bulk-btn"
              title="Select all currently visible modules"
            >
              <CheckIcon size={12} /> Select Visible ({filteredModules.length})
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="bulk-btn bulk-btn-danger"
              title="Clear all selected modules"
            >
              <RotateCcwIcon size={12} /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Module List by Group */}
      <div className="modules-list-wrapper">
        {filteredModules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SearchIcon size={24} />
            </div>
            <h3 className="empty-state-title">No modules matched your criteria</h3>
            <p className="empty-state-desc">
              We couldn't find any tools matching &ldquo;{searchQuery}&rdquo; in this category.
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
          CATEGORIES.map((cat) => {
            const catModules = filteredModules.filter((m) => m.category === cat.id);
            if (catModules.length === 0) return null;

            return (
              <div key={cat.id} className="category-group">
                <div className="category-header">
                  <div className="category-header-title">
                    <span className="category-header-icon">{getCategoryIcon(cat.iconType)}</span>
                    <span className="category-header-text">{cat.label}</span>
                  </div>
                  <span className="category-desc-text">{cat.description}</span>
                </div>

                <div className="category-module-grid">
                  {catModules.map((mod: ModuleDefinition) => {
                    const isChecked = !!selectedModules[mod.id]?.enabled;
                    const ver = selectedModules[mod.id]?.version || '';

                    return (
                      <ModuleCard
                        key={mod.id}
                        module={mod}
                        isSelected={isChecked}
                        selectedVersion={ver}
                        onToggle={onToggleModule}
                        onChangeVersion={onChangeVersion}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
