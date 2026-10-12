'use client';

import React, { useState, useMemo } from 'react';
import { MODULES, PRESETS, CATEGORIES, ModuleDefinition } from '../lib/modules';
import { generateDotupYaml, generateBootstrapSnippet } from '../lib/generator';

export default function SetupGenerator() {
  const [profileName, setProfileName] = useState('zsh-setup');
  const [profileDesc, setProfileDesc] = useState('Custom development environment');
  const [activePreset, setActivePreset] = useState<string>('minimal');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bootstrap' | 'yaml'>('bootstrap');

  // Module state: { [moduleId]: { enabled: boolean, version?: string } }
  const [moduleState, setModuleState] = useState<Record<string, { enabled: boolean; version?: string }>>(() => {
    const initial: Record<string, { enabled: boolean; version?: string }> = {};
    MODULES.forEach((m) => {
      initial[m.id] = {
        enabled: m.id === 'system' || m.id === 'git' || m.id === 'zsh',
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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badge}>DotUp Setup Tool</div>
        <h1 style={styles.title}>Interactive Setup Generator</h1>
        <p style={styles.subtitle}>
          Select modules, customize configuration, and generate an instant one-liner command ready to run in your terminal.
        </p>
      </div>

      {/* Main Grid */}
      <div style={styles.layout}>
        {/* Left Column: Config & Selection */}
        <div style={styles.leftCol}>
          {/* Presets Bar */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Starter Presets</span>
              <span style={styles.tag}>{PRESETS.length} Available</span>
            </div>
            <div style={styles.presetGrid}>
              {PRESETS.map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    style={{
                      ...styles.presetBtn,
                      ...(isActive ? styles.presetBtnActive : {})
                    }}
                  >
                    <div style={styles.presetBtnName}>{p.name}</div>
                    <div style={styles.presetBtnDesc}>{p.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Details */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Profile Information</span>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Profile Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. zsh-setup"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description (optional)</label>
                <input
                  type="text"
                  value={profileDesc}
                  onChange={(e) => setProfileDesc(e.target.value)}
                  placeholder="e.g. My primary dev environment"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Module Categories */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.cardTitle}>Available Modules</span>
                <span style={{ ...styles.tag, marginLeft: '0.75rem' }}>
                  {selectedCount} Selected
                </span>
              </div>
            </div>

            <div style={styles.categoriesList}>
              {CATEGORIES.map((cat) => {
                const catModules = MODULES.filter((m) => m.category === cat.id);
                if (catModules.length === 0) return null;

                return (
                  <div key={cat.id} style={styles.categoryBlock}>
                    <div style={styles.categoryTitle}>
                      <span style={{ marginRight: '0.5rem' }}>{cat.icon}</span>
                      {cat.label}
                    </div>

                    <div style={styles.moduleGrid}>
                      {catModules.map((mod: ModuleDefinition) => {
                        const isEnabled = !!moduleState[mod.id]?.enabled;
                        const version = moduleState[mod.id]?.version || '';

                        return (
                          <div
                            key={mod.id}
                            onClick={() => toggleModule(mod.id)}
                            style={{
                              ...styles.moduleCard,
                              ...(isEnabled ? styles.moduleCardActive : {})
                            }}
                          >
                            <div style={styles.moduleCardTop}>
                              <div style={styles.moduleTitleBox}>
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => {}} // handled by card click
                                  style={styles.checkbox}
                                />
                                <span style={styles.moduleIcon}>{mod.icon}</span>
                                <span style={styles.moduleName}>{mod.name}</span>
                              </div>
                              <span style={styles.moduleId}>({mod.id})</span>
                            </div>

                            <p style={styles.moduleDesc}>{mod.description}</p>

                            {mod.supportsVersion && (
                              <div
                                style={styles.versionContainer}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <label style={styles.versionLabel}>Version:</label>
                                <input
                                  type="text"
                                  value={version}
                                  disabled={!isEnabled}
                                  onChange={(e) => setModuleVersion(mod.id, e.target.value)}
                                  placeholder={mod.versionPlaceholder || 'default'}
                                  style={{
                                    ...styles.versionInput,
                                    opacity: isEnabled ? 1 : 0.5
                                  }}
                                />
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

        {/* Right Column: Live Terminal Output */}
        <div style={styles.rightCol}>
          <div style={styles.stickyPanel}>
            <div style={styles.terminalCard}>
              <div style={styles.terminalHeader}>
                <div style={styles.terminalDots}>
                  <div style={{ ...styles.dot, backgroundColor: '#ff5f56' }} />
                  <div style={{ ...styles.dot, backgroundColor: '#ffbd2e' }} />
                  <div style={{ ...styles.dot, backgroundColor: '#27c93f' }} />
                </div>
                <div style={styles.tabGroup}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bootstrap')}
                    style={{
                      ...styles.tabBtn,
                      ...(activeTab === 'bootstrap' ? styles.tabBtnActive : {})
                    }}
                  >
                    🚀 One-Liner Command
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('yaml')}
                    style={{
                      ...styles.tabBtn,
                      ...(activeTab === 'yaml' ? styles.tabBtnActive : {})
                    }}
                  >
                    📄 setup.yaml
                  </button>
                </div>
              </div>

              <div style={styles.codeContainer}>
                <pre style={styles.codeContent}>
                  <code>{activeTab === 'bootstrap' ? generatedCommand : generatedYaml}</code>
                </pre>
              </div>

              <div style={styles.terminalFooter}>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    ...styles.copyBtn,
                    backgroundColor: copied ? '#10b981' : '#3b82f6'
                  }}
                >
                  {copied ? '✓ Copied to Clipboard!' : '📋 Copy Command'}
                </button>
                <div style={styles.summaryText}>
                  {selectedCount} module{selectedCount !== 1 ? 's' : ''} configured
                </div>
              </div>
            </div>

            {/* Instruction helper */}
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>⚡ Quick Execution</h3>
              <p style={styles.infoText}>
                Paste this command into any Linux / macOS terminal to download and run the declarative configuration automatically.
              </p>
              <div style={styles.stepList}>
                <div style={styles.stepItem}>
                  <strong>1.</strong> Automatically writes <code>setup.yaml</code> in the current folder.
                </div>
                <div style={styles.stepItem}>
                  <strong>2.</strong> Streams <code>bootstrap.sh</code> directly to execute the engine install plan.
                </div>
                <div style={styles.stepItem}>
                  <strong>3.</strong> Inspects and installs only missing dependencies idempotently.
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
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    color: '#1e293b',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    fontSize: '0.8125rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    letterSpacing: '0.025em'
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    fontSize: '1.05rem',
    color: '#64748b',
    maxWidth: '650px',
    margin: '0 auto',
    lineHeight: 1.5
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '2rem',
    alignItems: 'start'
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  rightCol: {
    position: 'relative'
  },
  stickyPanel: {
    position: 'sticky',
    top: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  tag: {
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px'
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '0.75rem'
  },
  presetBtn: {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  },
  presetBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    boxShadow: '0 0 0 1px #3b82f6'
  },
  presetBtnName: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  presetBtnDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
    lineHeight: 1.3
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem'
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#475569'
  },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    color: '#0f172a',
    outline: 'none'
  },
  categoriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  categoryBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  categoryTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#334155',
    display: 'flex',
    alignItems: 'center'
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem'
  },
  moduleCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.875rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.15s ease'
  },
  moduleCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#f8faff',
    boxShadow: '0 0 0 1px #3b82f6'
  },
  moduleCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.375rem'
  },
  moduleTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  checkbox: {
    cursor: 'pointer'
  },
  moduleIcon: {
    fontSize: '1rem'
  },
  moduleName: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#0f172a'
  },
  moduleId: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  moduleDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: '0.25rem 0 0.5rem 0',
    lineHeight: 1.3
  },
  versionContainer: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px dashed #e2e8f0'
  },
  versionLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#64748b'
  },
  versionInput: {
    width: '100%',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px'
  },
  terminalCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155'
  },
  terminalDots: {
    display: 'flex',
    gap: '0.375rem'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  tabGroup: {
    display: 'flex',
    gap: '0.5rem'
  },
  tabBtn: {
    padding: '0.25rem 0.625rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  tabBtnActive: {
    backgroundColor: '#334155',
    color: '#ffffff'
  },
  codeContainer: {
    padding: '1.25rem',
    maxHeight: '420px',
    overflowY: 'auto'
  },
  codeContent: {
    margin: 0,
    fontFamily: '"Fira Code", Monaco, Consolas, "Courier New", monospace',
    fontSize: '0.8125rem',
    color: '#e2e8f0',
    lineHeight: 1.6,
    whiteSpace: 'pre'
  },
  terminalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#1e293b',
    borderTop: '1px solid #334155'
  },
  copyBtn: {
    padding: '0.625rem 1.25rem',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
  },
  summaryText: {
    fontSize: '0.8125rem',
    color: '#94a3b8'
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem'
  },
  infoTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 0.5rem 0'
  },
  infoText: {
    fontSize: '0.8125rem',
    color: '#475569',
    lineHeight: 1.5,
    margin: '0 0 0.75rem 0'
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    fontSize: '0.8125rem',
    color: '#334155'
  },
  stepItem: {
    lineHeight: 1.4
  }
};

