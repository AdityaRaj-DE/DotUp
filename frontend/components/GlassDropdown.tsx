'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width?: number;
    openUp: boolean;
  }>({
    openUp: false
  });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const approxMenuHeight = Math.min(items.length * 36 + 16, 260);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < approxMenuHeight && spaceAbove > spaceBelow;

    if (compact) {
      setCoords({
        top: openUp ? undefined : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
        right: window.innerWidth - rect.right,
        openUp
      });
    } else {
      setCoords({
        top: openUp ? undefined : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
        left: rect.left,
        width: Math.max(rect.width, 180),
        openUp
      });
    }
  }, [items.length, compact]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const currentIdx = items.findIndex((i) => i.value === value);
      setFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
    }
  }, [isOpen, updatePosition, items, value]);

  useEffect(() => {
    if (!isOpen) return;

    function handleScrollOrResize() {
      updatePosition();
    }
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onChange(items[focusedIndex].value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, items, focusedIndex, onChange, updatePosition]);

  const selectedItem = items.find((item) => item.value === value);
  const displayLabel = selectedItem?.label || selectedItem?.value || value || placeholder;

  return (
    <div
      className={`glass-dropdown-wrapper ${compact ? 'is-compact' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
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

      {isOpen && mounted && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          className={`glass-dropdown-portal-menu ${compact ? 'is-compact' : ''} ${coords.openUp ? 'is-upwards' : ''}`}
          style={{
            position: 'fixed',
            top: coords.top !== undefined ? `${coords.top}px` : 'auto',
            bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
            left: coords.left !== undefined ? `${coords.left}px` : 'auto',
            right: coords.right !== undefined ? `${coords.right}px` : 'auto',
            width: coords.width !== undefined ? `${coords.width}px` : 'auto',
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, idx) => {
            const isSelected = item.value === value;
            const isFocused = idx === focusedIndex;
            return (
              <button
                key={item.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(item.value);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`glass-dropdown-option ${isSelected ? 'is-selected' : ''} ${isFocused ? 'is-focused' : ''}`}
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
        </div>,
        document.body
      )}
    </div>
  );
}
