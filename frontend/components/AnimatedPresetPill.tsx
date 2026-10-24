'use client';

import React, { useState, useEffect, useRef } from 'react';
import AsciiReveal from './AsciiReveal';
import AsciiRevealText from './AsciiRevealText';
import { motion } from 'framer-motion';

export interface AnimatedPresetPillProps {
  id: string;
  name: string;
  count: number;
  icon?: React.ReactNode;
  isSelected: boolean;
  isCustom?: boolean;
  onClick: () => void;
  index?: number;
}

export default function AnimatedPresetPill({
  id,
  name,
  count,
  icon,
  isSelected,
  isCustom = false,
  onClick,
  index = 0
}: AnimatedPresetPillProps) {
  const [hoverText, setHoverText] = useState(name);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with name prop
  useEffect(() => {
    setHoverText(name);
  }, [name]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isSelected) return;
    setIsHovered(true);
    const chars = '.-=+*#%@01XYZ';
    let frame = 0;
    if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);

    hoverTimerRef.current = setInterval(() => {
      frame++;
      if (frame > 5) {
        if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
        setHoverText(name);
        return;
      }
      const arr = name.split('');
      const randIdx = Math.floor(Math.random() * arr.length);
      if (arr[randIdx] && arr[randIdx] !== ' ') {
        arr[randIdx] = chars[Math.floor(Math.random() * chars.length)];
      }
      setHoverText(arr.join(''));
    }, 28);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
    setHoverText(name);
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`preset-pill-btn ${isCustom ? 'preset-pill-custom' : ''} ${isSelected ? 'preset-pill-btn-active' : ''}`}
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Sliding Active Pill Background via layoutId */}
      {isSelected && (
        <motion.span
          layoutId="preset-active-pill-bg"
          className={`preset-pill-active-bg ${isCustom ? 'preset-pill-custom-active-bg' : ''}`}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      )}

      {/* Micro ASCII canvas wave on active pill element */}
      {isSelected && (
        <AsciiReveal
          as="span"
          preset="terminal"
          triggerKey={`pill-${id}`}
          duration={280}
          cellSize={8}
          className="preset-pill-canvas-overlay"
        >
          {null}
        </AsciiReveal>
      )}

      {icon && <span className="preset-pill-icon">{icon}</span>}

      <span className="preset-pill-name">
        {isSelected ? (
          <AsciiRevealText
            text={name}
            triggerKey={`active-${id}`}
            preset="terminal"
            speed={16}
          />
        ) : isHovered ? (
          hoverText
        ) : (
          name
        )}
      </span>

      <span className="preset-pill-badge">
        {isSelected ? (
          <AsciiRevealText
            text={String(count)}
            triggerKey={`active-${id}`}
            preset="terminal"
            speed={20}
          />
        ) : (
          count
        )}
      </span>
    </button>
  );
}

