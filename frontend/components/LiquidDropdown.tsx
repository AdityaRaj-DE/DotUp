'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon } from './Icons';
import { VersionOption } from '../lib/modules';
import { motion, AnimatePresence } from 'framer-motion';

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
      className="liquid-dropdown-wrapper"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select version, currently ${displayLabel}`}
        className={`liquid-dropdown-trigger ${isOpen ? 'liquid-dropdown-trigger-open' : ''}`}
      >
        <span>v{value}</span>
        <ChevronDownIcon size={10} className={`dropdown-chevron ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            className="liquid-dropdown-menu"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="liquid-dropdown-heading">
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
                  className={`liquid-dropdown-item ${isSelected ? 'liquid-dropdown-item-active' : ''}`}
                >
                  <span className="dropdown-item-label">{opt.label || `Version ${opt.value}`}</span>
                  {isSelected && <CheckIcon size={12} className="dropdown-item-check" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

