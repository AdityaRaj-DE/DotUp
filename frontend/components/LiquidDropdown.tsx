'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon } from './Icons';
import { VersionOption } from '../lib/modules';

interface LiquidDropdownProps {
  value: string;
  options: VersionOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LiquidDropdown({
  value,
  options,
  onChange,
  placeholder = 'Select'
}: LiquidDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = options.find((opt) => opt.value === value);
  const displayLabel = selectedItem?.label || selectedItem?.value || value || placeholder;

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select version, currently ${displayLabel}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.28rem 0.65rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono, monospace)',
          color: '#1e293b',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>v{value}</span>
        <ChevronDownIcon size={11} className={isOpen ? 'rotate-180' : ''} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.35rem',
            minWidth: '190px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            padding: '0.35rem',
            zIndex: 60,
            animation: 'applePop 0.15s var(--ease-apple)'
          }}
        >
          <div
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8'
            }}
          >
            Select Version
          </div>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  fontWeight: isSelected ? 600 : 500,
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt.label || `Version ${opt.value}`}</span>
                {isSelected && <CheckIcon size={12} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
