'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon } from './Icons';

export interface DropdownItem {
  value: string;
  label?: string;
  badge?: number | string;
}

interface GlassDropdownProps {
  value: string;
  items: DropdownItem[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  prefix?: string;
  compact?: boolean;
}

export default function GlassDropdown({
  value,
  items,
  onChange,
  placeholder = 'Select',
  ariaLabel,
  prefix = '',
  compact = false
}: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedItem = items.find((item) => item.value === value);
  const displayLabel = selectedItem?.label || selectedItem?.value || value || placeholder;

  return (
    <div
      ref={dropdownRef}
      className={`glass-dropdown-wrapper ${compact ? 'is-compact' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || `Selected ${displayLabel}`}
        className={`glass-dropdown-trigger ${isOpen ? 'is-open' : ''} ${compact ? 'is-compact' : ''}`}
      >
        <span className="glass-dropdown-label">
          {prefix && <span className="dropdown-prefix">{prefix}</span>}
          {displayLabel}
        </span>
        {selectedItem?.badge !== undefined && (
          <span className="dropdown-badge-pill">{selectedItem.badge}</span>
        )}
        <ChevronDownIcon size={11} className={`dropdown-chevron ${isOpen ? 'is-expanded' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`glass-dropdown-menu ${compact ? 'is-compact' : ''}`}
        >
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <button
                key={item.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(item.value);
                  setIsOpen(false);
                }}
                className={`glass-dropdown-option ${isSelected ? 'is-selected' : ''}`}
              >
                <div className="option-label-group">
                  <span className="option-name">{item.label || item.value}</span>
                  {item.badge !== undefined && (
                    <span className="option-count-pill">{item.badge}</span>
                  )}
                </div>
                {isSelected && <CheckIcon size={12} className="option-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
