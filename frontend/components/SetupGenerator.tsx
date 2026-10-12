'use client';

import React, { useState, useMemo } from 'react';
import { MODULES, PRESETS, CATEGORIES, ModuleDefinition } from '../lib/modules';
import { generateDotupYaml, generateBootstrapSnippet } from '../lib/generator';
import {
  GridIcon,
  UserIcon,
  LayersIcon,
  LightningIcon,
  GearIcon,
  TerminalIcon,
  CodeIcon,
  CloudIcon,
  WindowIcon,
  ModuleSymbol,
  FileTextIcon,
  CopyIcon,
  DownloadIcon,
  CheckIcon
} from './Icons';
import LiquidDropdown from './LiquidDropdown';

export default function SetupGenerator() {
  const [profileName, setProfileName] = useState('full-setup');
  const [profileDesc, setProfileDesc] = useState(
    'All development runtimes, editors, and infrastructure tools'
  );
  const [activePreset, setActivePreset] = useState<string>('full');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bootstrap' | 'yaml'>('bootstrap');

  // Initialize with full preset active
  const [moduleState, setModuleState] = useState<Record<string, { enabled: boolean; version?: string }>>(() => {
    const initial: Record<string, { enabled: boolean; version?: string }> = {};
    MODULES.forEach((m) => {
      initial[m.id] = {
        enabled: true,
        version: m.defaultVersion || ''
      };
    });
    return initial;
  });

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setProfileName(`${preset.id}-setup`);
    setProfileDesc(preset.description);

    setModuleState((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => {
        next[m.id] = {
          ...next[m.id],
          enabled: preset.modules.includes(m.id)
        };
      });
      return next;
    });
  };

  const toggleModule = (id: string) => {
    setActivePreset('custom');
    setModuleState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id]?.enabled
      }
    }));
  };

  const setModuleVersion = (id: string, version: string) => {
    setModuleState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        version
      }
    }));
  };

  const selectedCount = useMemo(() => {
    return Object.values(moduleState).filter((m) => m.enabled).length;
  }, [moduleState]);

  const configObj = useMemo(() => {
    return {
      profileName,
      profileDescription: profileDesc,
      selectedModules: moduleState
    };
  }, [profileName, profileDesc, moduleState]);

  const generatedYaml = useMemo(() => generateDotupYaml(configObj), [configObj]);
  const generatedCommand = useMemo(() => generateBootstrapSnippet(configObj), [configObj]);

  const handleCopy = async () => {
    const textToCopy = activeTab === 'bootstrap' ? generatedCommand : generatedYaml;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([generatedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
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
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Badge & Title */}
      <div style={styles.heroSection}>
        <div className="apple-interactive" style={styles.pillBadge}>
          <span style={styles.blueDot} />
          DotUp Setup Engine
        </div>
        <h1 style={styles.heroTitle}>Interactive Setup Generator</h1>
        <p style={styles.heroSubtitle}>
          Select modules, customize configuration, and generate an instant one-liner
          <br />
          command ready to run in macOS &amp; Linux terminals.
        </p>
      </div>

      {/* Main App Grid */}
      <div style={styles.mainGrid}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Section 1: Starter Presets */}
          <div style={styles.panelCard}>
            <div style={styles.panelCardHeader}>
              <div style={styles.panelTitleGroup}>
                <GridIcon size={17} />
                <span style={styles.panelTitle}>Starter Presets</span>
              </div>
              <span style={styles.countBadge}>{PRESETS.length} Available</span>
            </div>

            <div style={styles.presetGrid}>
              {PRESETS.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className="apple-interactive"
                    style={{
                      ...styles.presetBox,
                      ...(isSelected ? styles.presetBoxActive : {})
                    }}
                  >
                    <div style={styles.presetTopRow}>
                      <span style={styles.presetName}>{p.name}</span>
                      {isSelected && <span style={styles.activeDot} />}
                    </div>
                    <p style={styles.presetDescription}>{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Profile Information */}
          <div style={styles.panelCard}>
            <div style={styles.panelCardHeader}>
              <div style={styles.panelTitleGroup}>
                <UserIcon size={17} />
                <span style={styles.panelTitle}>Profile Information</span>
              </div>
            </div>

            <div style={styles.profileFormGrid}>
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>PROFILE NAME</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. full-setup"
                  style={styles.fieldInput}
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</label>
                <input
                  type="text"
                  value={profileDesc}
                  onChange={(e) => setProfileDesc(e.target.value)}
                  placeholder="Profile description..."
                  style={styles.fieldInput}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Available Modules */}
          <div style={styles.panelCard}>
            <div style={styles.panelCardHeader}>
              <div style={styles.panelTitleGroup}>
                <LayersIcon size={17} />
                <span style={styles.panelTitle}>Available Modules</span>
              </div>
              <span style={styles.selectedPillBadge}>{selectedCount} Selected</span>
            </div>

            <div style={styles.categoriesWrapper}>
              {CATEGORIES.map((cat) => {
                const catModules = MODULES.filter((m) => m.category === cat.id);
                if (catModules.length === 0) return null;

                const isSingleColumn = cat.id === 'system' || cat.id === 'terminal';

                return (
                  <div key={cat.id} style={styles.categoryBlock}>
                    <div style={styles.categoryHeader}>
                      <span style={styles.categoryIcon}>{getCategoryIcon(cat.iconType)}</span>
                      <span style={styles.categoryLabel}>{cat.label}</span>
                    </div>

                    <div
                      style={
                        isSingleColumn
                          ? styles.singleColumnModuleGrid
                          : styles.multiColumnModuleGrid
                      }
                    >
                      {catModules.map((mod: ModuleDefinition) => {
                        const isChecked = !!moduleState[mod.id]?.enabled;
                        const currentVersion = moduleState[mod.id]?.version || '';

                        return (
                          <div
                            key={mod.id}
                            onClick={() => toggleModule(mod.id)}
                            className="apple-interactive"
                            style={{
                              ...styles.moduleCard,
                              ...(isChecked ? styles.moduleCardChecked : {})
                            }}
                          >
                            <div style={styles.moduleCardLeft}>
                              <div
                                style={{
                                  ...styles.customCheckbox,
                                  ...(isChecked ? styles.customCheckboxChecked : {})
                                }}
                              >
                                {isChecked && <CheckIcon size={11} />}
                              </div>

                              <div style={styles.symbolContainer}>
                                <ModuleSymbol type={mod.iconType} size={17} />
                              </div>

                              <div style={styles.moduleTextContainer}>
                                <div style={styles.moduleHeaderLine}>
                                  <span style={styles.moduleItemTitle}>{mod.name}</span>
                                  <span style={styles.moduleItemId}>({mod.id})</span>
                                </div>
                                {mod.description && (
                                  <p style={styles.moduleItemDesc}>{mod.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Optional Version Selector with Apple Liquid Dropdown */}
                            {mod.supportsVersion && (
                              <div
                                style={styles.versionBadgeContainer}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {mod.versionOptions ? (
                                  <LiquidDropdown
                                    value={currentVersion}
                                    options={mod.versionOptions}
                                    onChange={(val) => setModuleVersion(mod.id, val)}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={currentVersion}
                                    placeholder="Version"
                                    onChange={(e) => setModuleVersion(mod.id, e.target.value)}
                                    style={styles.versionTextInput}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Code Terminal & Quick Execution */}
        <div style={styles.rightColumn}>
          <div style={styles.stickyContainer}>
            {/* Dark Terminal Window */}
            <div style={styles.terminalWindow}>
              {/* Terminal Chrome Bar */}
              <div style={styles.terminalChrome}>
                <div style={styles.macButtons}>
                  <span className="apple-btn" style={{ ...styles.macDot, backgroundColor: '#ff5f56' }} />
                  <span className="apple-btn" style={{ ...styles.macDot, backgroundColor: '#ffbd2e' }} />
                  <span className="apple-btn" style={{ ...styles.macDot, backgroundColor: '#27c93f' }} />
                </div>

                <div style={styles.switchTabsContainer}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bootstrap')}
                    className="apple-btn"
                    style={{
                      ...styles.terminalTab,
                      ...(activeTab === 'bootstrap' ? styles.terminalTabActive : {})
                    }}
                  >
                    <LightningIcon size={12} />
                    One-Liner
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('yaml')}
                    className="apple-btn"
                    style={{
                      ...styles.terminalTab,
                      ...(activeTab === 'yaml' ? styles.terminalTabActive : {})
                    }}
                  >
                    <FileTextIcon size={12} />
                    setup.yaml
                  </button>
                </div>
              </div>

              {/* Terminal Code View */}
              <div style={styles.terminalBody}>
                <div style={styles.commentHeader}># Execute direct configuration pipeline</div>
                <pre style={styles.codeText}>
                  <code>{activeTab === 'bootstrap' ? generatedCommand : generatedYaml}</code>
                </pre>
              </div>

              {/* Bottom Actions inside Terminal Card */}
              <div style={styles.terminalActionBar}>
                <div style={styles.actionButtonsLeft}>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="apple-btn"
                    style={{
                      ...styles.copyCommandBtn,
                      backgroundColor: copied ? '#10b981' : '#1e293b'
                    }}
                  >
                    {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    {copied ? 'Copied to Clipboard' : 'Copy Command'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadYaml}
                    className="apple-btn"
                    style={styles.downloadYamlBtn}
                  >
                    <DownloadIcon size={14} />
                    Download YAML
                  </button>
                </div>

                <div style={styles.moduleCountPill}>
                  <span style={styles.blueDot} />
                  {selectedCount} modules configured
                </div>
              </div>
            </div>

            {/* Quick Execution Guide Box */}
            <div className="apple-interactive" style={styles.guideCard}>
              <div style={styles.guideHeader}>
                <LightningIcon size={16} />
                <span style={styles.guideTitle}>Quick Execution</span>
              </div>
              <p style={styles.guideSubtitle}>
                Paste this command into any Linux / macOS terminal to download and run the declarative configuration automatically.
              </p>
              <div style={styles.guideSteps}>
                <div style={styles.guideStepItem}>
                  <span style={styles.guideNumber}>1.</span>
                  <span>
                    Automatically writes <code style={styles.codeSnippet}>setup.yaml</code> in the current directory.
                  </span>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.guideNumber}>2.</span>
                  <span>
                    Streams <code style={styles.codeSnippet}>bootstrap.sh</code> directly to execute the engine install plan.
                  </span>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.guideNumber}>3.</span>
                  <span>
                    Inspects and installs missing dependencies idempotently.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1380px',
    margin: '0 auto',
    padding: '3rem 2rem',
    color: '#0f172a'
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '3.25rem'
  },
  pillBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.95rem',
    borderRadius: '9999px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '0.8125rem',
    fontWeight: 600,
    marginBottom: '1.1rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
    cursor: 'default'
  },
  blueDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    display: 'inline-block'
  },
  heroTitle: {
    fontSize: '3.15rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.04em',
    lineHeight: 1.15
  },
  heroSubtitle: {
    fontSize: '1.08rem',
    color: '#64748b',
    maxWidth: '680px',
    margin: '0 auto',
    lineHeight: 1.6,
    letterSpacing: '-0.01em'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
    gap: '2.5rem',
    alignItems: 'start'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem'
  },
  rightColumn: {
    position: 'relative'
  },
  stickyContainer: {
    position: 'sticky',
    top: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  panelCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #eef2f6',
    borderRadius: '18px',
    padding: '1.75rem',
    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)'
  },
  panelCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.35rem'
  },
  panelTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    color: '#0f172a'
  },
  panelTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  countBadge: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px'
  },
  selectedPillBadge: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    padding: '0.25rem 0.8rem',
    borderRadius: '9999px'
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.75rem'
  },
  presetBox: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '92px'
  },
  presetBoxActive: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 1.5px #2563eb'
  },
  presetTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.45rem'
  },
  presetName: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.015em'
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#2563eb'
  },
  presetDescription: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.35
  },
  profileFormGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr',
    gap: '1rem'
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem'
  },
  fieldLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#64748b'
  },
  fieldInput: {
    padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
  },
  categoriesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.85rem'
  },
  categoryBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b'
  },
  categoryIcon: {
    display: 'flex',
    alignItems: 'center',
    color: '#64748b'
  },
  categoryLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    color: '#64748b'
  },
  singleColumnModuleGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  multiColumnModuleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem'
  },
  moduleCard: {
    border: '1px solid #eef2f6',
    borderRadius: '14px',
    padding: '0.9rem 1.1rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  moduleCardChecked: {
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  moduleCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    flex: 1
  },
  customCheckbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#ffffff',
    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  customCheckboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  symbolContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px'
  },
  moduleTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem'
  },
  moduleHeaderLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  moduleItemTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#0f172a',
    letterSpacing: '-0.015em'
  },
  moduleItemId: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontFamily: 'var(--font-mono)'
  },
  moduleItemDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.35
  },
  versionBadgeContainer: {
    marginLeft: '0.75rem'
  },
  versionSelectDropdown: {
    padding: '0.35rem 0.65rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#334155',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  versionTextInput: {
    width: '65px',
    padding: '0.35rem 0.5rem',
    fontSize: '0.75rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    color: '#334155',
    fontFamily: 'inherit'
  },
  terminalWindow: {
    backgroundColor: '#0a0f1d',
    borderRadius: '18px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
    overflow: 'hidden',
    border: '1px solid #1e293b'
  },
  terminalChrome: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.95rem 1.35rem',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0f172a'
  },
  macButtons: {
    display: 'flex',
    gap: '0.45rem'
  },
  macDot: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    cursor: 'pointer'
  },
  switchTabsContainer: {
    display: 'flex',
    gap: '0.35rem',
    backgroundColor: '#1e293b',
    padding: '0.2rem',
    borderRadius: '10px'
  },
  terminalTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  terminalTabActive: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
  },
  terminalBody: {
    padding: '1.5rem',
    minHeight: '380px',
    maxHeight: '480px',
    overflowY: 'auto'
  },
  commentHeader: {
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-mono)',
    color: '#64748b',
    marginBottom: '0.85rem'
  },
  codeText: {
    margin: 0,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8125rem',
    color: '#34d399',
    lineHeight: 1.65,
    whiteSpace: 'pre'
  },
  terminalActionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.35rem',
    backgroundColor: '#0f172a',
    borderTop: '1px solid #1e293b'
  },
  actionButtonsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  copyCommandBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.15rem',
    color: '#ffffff',
    border: '1px solid #334155',
    borderRadius: '10px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  downloadYamlBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.05rem',
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #334155',
    borderRadius: '10px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  moduleCountPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontFamily: 'var(--font-mono)'
  },
  guideCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #eef2f6',
    borderRadius: '18px',
    padding: '1.6rem',
    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)'
  },
  guideHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.55rem',
    color: '#2563eb'
  },
  guideTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.015em'
  },
  guideSubtitle: {
    fontSize: '0.8125rem',
    color: '#64748b',
    margin: '0 0 1rem 0',
    lineHeight: 1.55
  },
  guideSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem'
  },
  guideStepItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.45rem',
    fontSize: '0.8125rem',
    color: '#334155',
    lineHeight: 1.45
  },
  guideNumber: {
    fontWeight: 700,
    color: '#2563eb'
  },
  codeSnippet: {
    backgroundColor: '#f1f5f9',
    padding: '0.15rem 0.4rem',
    borderRadius: '5px',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: '#0f172a'
  }
};
