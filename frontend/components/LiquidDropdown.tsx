'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon } from './Icons';

interface LiquidDropdownProps {
  value: string;
  options: string[];
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.startsWith(value)) || value || placeholder;

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="apple-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.65rem 0.35rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#334155',
          backgroundColor: isOpen ? '#eef2f6' : 'rgba(241, 245, 249, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(203, 213, 225, 0.6)',
          borderRadius: '9999px',
          boxShadow: isOpen
            ? '0 0 0 2px rgba(37, 99, 235, 0.2), 0 2px 6px rgba(15, 23, 42, 0.06)'
            : '0 1px 3px rgba(15, 23, 42, 0.04)',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <span>{selectedOption}</span>
        {/* Apple subtle chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="#64748b"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <polyline points="2.5 3.75 5 6.25 7.5 3.75" />
        </svg>
      </button>

      {/* Floating Liquid Glass Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 100,
            minWidth: '135px',
            padding: '0.35rem',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '14px',
            boxShadow:
              '0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            animation: 'applePop 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {options.map((opt) => {
            const rawVal = opt.split(' ')[0];
            const isSelected = value === rawVal || selectedOption === opt;

            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(rawVal);
                  setIsOpen(false);
                }}
                className="apple-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.7rem',
                  borderRadius: '9px',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#1d4ed8' : '#1e293b',
                  backgroundColor: isSelected ? 'rgba(239, 246, 255, 0.95)' : 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
              >
                <span>{opt}</span>
                {isSelected && (
                  <span style={{ color: '#2563eb' }}>
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

