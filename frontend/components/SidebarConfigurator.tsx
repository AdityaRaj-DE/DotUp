'use client';

import React, { useState } from 'react';
import {
  SearchIcon,
  XIcon,
  CheckIcon,
  AlertCircleIcon,
  ChevronDownIcon
} from './Icons';
import { MODULES, CATEGORIES, ModuleDefinition } from '../lib/modules';
import LiquidDropdown from './LiquidDropdown';

interface SidebarConfiguratorProps {
  setupId: string;
  setupVersion: string;
  setupDescription: string;
  onChangeSetupId: (id: string) => void;
  onChangeSetupVersion: (ver: string) => void;
  onChangeSetupDescription: (desc: string) => void;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  onToggleModule: (id: string) => void;
  onChangeVersion: (id: string, version: string) => void;
  onSelectAllVisible: () => void;
  onClearAll: () => void;
  onCopyCommand: () => Promise<boolean>;
  onDownloadYaml: () => void;
  isValid: boolean;
  errors: Array<{ field: string; message: string; moduleId?: string }>;
}

export default function SidebarConfigurator({
  setupId,
  setupVersion,
  setupDescription,
  onChangeSetupId,
  onChangeSetupVersion,
  onChangeSetupDescription,
  activePresetId,
  onSelectPreset,
  selectedModules,
  onToggleModule,
  onChangeVersion,
  onSelectAllVisible,
  onClearAll,
  onCopyCommand,
  onDownloadYaml,
  isValid,
  errors
}: SidebarConfiguratorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Filter modules by category & search query
  const filteredModules = MODULES.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });

  const selectedCount = Object.values(selectedModules).filter((m) => m.enabled).length;

  const handleCopy = async () => {
    const success = await onCopyCommand();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const idError = errors.find((e) => e.field === 'setupId');
  const verError = errors.find((e) => e.field === 'setupVersion');
  const moduleError = errors.find((e) => e.field === 'modules');

  return (
    <aside className="sidebar-container" aria-label="Development environment configuration">
      {/* 1. Header & Presets Tray */}
      <div className="sidebar-section sidebar-header-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">Environment Preset</span>
          <span className="sidebar-count-badge">{selectedCount} active</span>
        </div>

        {/* Preset Pills */}
        <div className="preset-pill-group" role="radiogroup" aria-label="Quick setup presets">
          {[
            { id: 'minimal', label: 'Minimal' },
            { id: 'frontend', label: 'Frontend' },
            { id: 'backend', label: 'Backend' },
            { id: 'devops', label: 'DevOps' },
            { id: 'full', label: 'Full Suite' }
          ].map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectPreset(preset.id)}
                className={`preset-chip-btn ${isSelected ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Collapsible Profile & Metadata */}
      <div className="sidebar-section sidebar-profile-section">
        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="sidebar-collapse-trigger"
          aria-expanded={isProfileOpen}
        >
          <span className="sidebar-section-title">
            Specification Metadata: <strong>{setupId || 'untitled'}</strong> (v{setupVersion})
          </span>
          <span className={`collapse-arrow ${isProfileOpen ? 'open' : ''}`}>
            <ChevronDownIcon size={14} />
          </span>
        </button>

        {isProfileOpen && (
          <div className="sidebar-profile-content">
            <div className="profile-input-grid">
              <div className="input-group">
                <label htmlFor="sb-setup-id" className="input-label">Setup ID</label>
                <input
                  id="sb-setup-id"
                  type="text"
                  value={setupId}
                  onChange={(e) => onChangeSetupId(e.target.value)}
                  placeholder="e.g. backend-dev"
                  className={`input-text-sm ${idError ? 'input-error' : ''}`}
                />
                {idError && <span className="field-error-msg">{idError.message}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="sb-setup-ver" className="input-label">Version</label>
                <input
                  id="sb-setup-ver"
                  type="text"
                  value={setupVersion}
                  onChange={(e) => onChangeSetupVersion(e.target.value)}
                  placeholder="1.0.0"
                  className={`input-text-sm ${verError ? 'input-error' : ''}`}
                />
                {verError && <span className="field-error-msg">{verError.message}</span>}
              </div>
            </div>

            <div className="input-group mt-2">
              <label htmlFor="sb-setup-desc" className="input-label">Description</label>
              <input
                id="sb-setup-desc"
                type="text"
                value={setupDescription}
                onChange={(e) => onChangeSetupDescription(e.target.value)}
                placeholder="Environment purpose or description"
                className="input-text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="sidebar-section sidebar-search-section">
        <div className="search-input-wrapper">
          <SearchIcon size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, runtimes, editors..."
            className="search-input"
            aria-label="Filter modules"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              <XIcon size={13} />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Scroller */}
        <div className="category-tab-scroll" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`cat-tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const activeInCat = MODULES.filter(
              (m) => m.category === cat.id && selectedModules[m.id]?.enabled
            ).length;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`cat-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                <span>{cat.label.split(' ')[0]}</span>
                {activeInCat > 0 && <span className="cat-count-pill">{activeInCat}</span>}
              </button>
            );
          })}
        </div>

        {/* Bulk Action Sub-bar */}
        <div className="bulk-actions-subbar">
          <span className="bulk-count-label">
            {filteredModules.length} tool{filteredModules.length !== 1 ? 's' : ''} shown
          </span>
          <div className="bulk-btn-group">
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="btn-link-action"
            >
              Select Shown
            </button>
            <span className="bulk-divider">•</span>
            <button
              type="button"
              onClick={onClearAll}
              className="btn-link-action text-muted"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* 4. Module Selection List (Scrollable) */}
      <div className="sidebar-module-list" role="list" aria-label="Available modules">
        {moduleError && (
          <div className="module-empty-alert" role="alert">
            <AlertCircleIcon size={14} />
            <span>{moduleError.message}</span>
          </div>
        )}

        {filteredModules.length === 0 ? (
          <div className="sidebar-empty-state">
            <p>No tools match &ldquo;{searchQuery}&rdquo;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-link-action mt-1"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredModules.map((module) => {
            const isEnabled = Boolean(selectedModules[module.id]?.enabled);
            const currentVersion = selectedModules[module.id]?.version || module.defaultVersion || '';

            return (
              <div
                key={module.id}
                role="listitem"
                className={`sidebar-module-row ${isEnabled ? 'is-selected' : ''}`}
              >
                <label className="sidebar-module-label">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => onToggleModule(module.id)}
                    className="sidebar-module-checkbox"
                  />
                  <div className="sidebar-module-info">
                    <span className="sidebar-module-name">{module.name}</span>
                    <span className="sidebar-module-desc">{module.description}</span>
                  </div>
                </label>

                {/* Inline Version Selector if supported */}
                {module.supportsVersion && module.versionOptions && isEnabled && (
                  <div className="sidebar-module-version-wrap">
                    <LiquidDropdown
                      options={module.versionOptions}
                      value={currentVersion}
                      onChange={(newVer) => onChangeVersion(module.id, newVer)}
                      ariaLabel={`${module.name} version`}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Bottom Action Area (Copy Command & Download YAML) */}
      <div className="sidebar-bottom-actions">
        <button
          type="button"
          onClick={handleCopy}
          className="btn-primary-action w-full"
          aria-live="polite"
          title="Copy installation command"
        >
          {copied ? (
            <>
              <CheckIcon size={15} />
              <span>Command Copied!</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Command</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onDownloadYaml}
          className="btn-secondary-action w-full mt-2"
          title="Download setup.yaml file"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download YAML</span>
        </button>
      </div>
    </aside>
  );
}
