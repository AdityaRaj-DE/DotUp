'use client';

import React from 'react';
import { ModuleDefinition } from '../lib/modules';

export const CATEGORY_MAP: Record<string, { label: string; side: 'left' | 'right'; color: string }> = {
  system: { label: 'System Foundation', side: 'left', color: '#059669' },
  terminal: { label: 'Terminal & Shell', side: 'left', color: '#10b981' },
  editors: { label: 'Editors & IDEs', side: 'left', color: '#22c55e' },
  development: { label: 'Runtimes & SDKs', side: 'right', color: '#d97706' },
  infrastructure: { label: 'DevOps & Cloud', side: 'right', color: '#0d9488' }
};

interface CustomModuleColumnsProps {
  leftModules: ModuleDefinition[];
  rightModules: ModuleDefinition[];
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  hoveredModuleId: string | null;
  onHoverModule: (id: string | null) => void;
  onToggleModule: (id: string) => void;
  onChangeVersion: (id: string, ver: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  filteredCount: number;
  onSelectShown: () => void;
  onClearAll: () => void;
}

export default function CustomModuleColumns({
  leftModules,
  rightModules,
  selectedModules,
  hoveredModuleId,
  onHoverModule,
  onToggleModule,
  onChangeVersion,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  filteredCount,
  onSelectShown,
  onClearAll
}: CustomModuleColumnsProps) {
  return (
    <>
      {/* LEFT FLOATING COLUMN: Canopy & Trunk */}
      <section className="floating-column column-left" aria-label="Canopy and Trunk Modules">
        <div className="filter-mini-bar lush-glass">
          <div className="filter-row-top">
            <div className="search-box">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ color: 'var(--text-muted)' }}
              >
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
            <span>
              {filteredCount} module{filteredCount === 1 ? '' : 's'}
            </span>
            <div className="quick-actions">
              <button type="button" className="quick-link" onClick={onSelectShown}>
                Select Shown
              </button>
              <span>•</span>
              <button type="button" className="quick-link muted" onClick={onClearAll}>
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
                  onToggleModule(mod.id);
                }}
                onPointerEnter={() => onHoverModule(mod.id)}
                onPointerLeave={() => onHoverModule(null)}
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
                    onChange={(e) => onChangeVersion(mod.id, e.target.value)}
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

      {/* RIGHT FLOATING COLUMN: Land & Roots */}
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
                  onToggleModule(mod.id);
                }}
                onPointerEnter={() => onHoverModule(mod.id)}
                onPointerLeave={() => onHoverModule(null)}
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
                    onChange={(e) => onChangeVersion(mod.id, e.target.value)}
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
    </>
  );
}
