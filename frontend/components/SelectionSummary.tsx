'use client';

import React from 'react';
import { MODULES } from '../lib/modules';
import { LayersIcon, XIcon, CheckIcon, AlertCircleIcon } from './Icons';

interface SelectionSummaryProps {
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  onRemoveModule: (id: string) => void;
  isValid: boolean;
  onApplyPreset: (presetId: string) => void;
}

export default function SelectionSummary({
  selectedModules,
  onRemoveModule,
  isValid,
  onApplyPreset
}: SelectionSummaryProps) {
  const enabledModuleIds = Object.keys(selectedModules).filter(
    (id) => selectedModules[id]?.enabled
  );

  return (
    <section aria-label="Selected modules summary" className="summary-tray">
      <div className="summary-tray-header">
        <div className="summary-title-row">
          <LayersIcon size={15} />
          <span className="summary-title">Active Selection ({enabledModuleIds.length})</span>
        </div>
        <div className="summary-status-pill">
          {isValid ? (
            <span className="status-indicator status-valid">
              <CheckIcon size={11} /> Ready to Generate
            </span>
          ) : (
            <span className="status-indicator status-invalid">
              <AlertCircleIcon size={11} /> Setup Incomplete
            </span>
          )}
        </div>
      </div>

      {enabledModuleIds.length === 0 ? (
        <div className="summary-empty">
          <p className="summary-empty-text">No modules selected in this environment configuration.</p>
          <div className="summary-presets-quick">
            <span>Quick add:</span>
            <button
              type="button"
              onClick={() => onApplyPreset('minimal')}
              className="quick-preset-btn"
            >
              Minimal Base
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('frontend')}
              className="quick-preset-btn"
            >
              Frontend Web
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('backend')}
              className="quick-preset-btn"
            >
              Backend Dev
            </button>
          </div>
        </div>
      ) : (
        <div className="summary-pills-wrap">
          {enabledModuleIds.map((id) => {
            const modDef = MODULES.find((m) => m.id === id);
            const ver = selectedModules[id]?.version;
            const name = modDef?.name || id;

            return (
              <span key={id} className="summary-pill">
                <span className="summary-pill-name">{name}</span>
                {ver && <span className="summary-pill-ver">v{ver}</span>}
                <button
                  type="button"
                  onClick={() => onRemoveModule(id)}
                  aria-label={`Remove ${name} from configuration`}
                  className="summary-pill-remove"
                >
                  <XIcon size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}
