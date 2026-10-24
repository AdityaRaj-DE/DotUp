'use client';

import React, { useEffect, useState } from 'react';

export interface AsciiRevealTextProps {
  text: string;
  className?: string;
  speed?: number; // frame tick interval in ms (default: 24ms)
  duration?: number; // total duration in ms (default: capped at 1500ms / 1.5s)
  preset?: 'decode' | 'terminal' | 'blueprint' | 'dither';
  triggerKey?: string | number;
  as?: React.ElementType;
}

const CHAR_SETS = {
  decode: '.-+*=%@#01XYZ░▒▓',
  terminal: '01_[]{}<>/\\$#@!~',
  blueprint: '+-|/\\[]{}:;.',
  dither: ' .:-=+*#%@'
};

export default function AsciiRevealText({
  text,
  className = '',
  speed = 24,
  duration,
  preset = 'decode',
  triggerKey,
  as: Component = 'span'
}: AsciiRevealTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const chars = CHAR_SETS[preset] || CHAR_SETS.decode;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(text);
      return;
    }

    const targetLength = text.length;
    if (targetLength === 0) {
      setDisplayText('');
      return;
    }

    // Cap total animation time to max 1.5 seconds (1500ms) across all text elements
    const targetDuration = duration ?? Math.min(1500, Math.max(350, targetLength * 19));
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / targetDuration, 1);
      const resolvedCount = Math.floor(progress * targetLength);

      const scrambled = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (char === '\n') return '\n';
          if (index < resolvedCount) {
            return text[index];
          }
          const randIndex = Math.floor(Math.random() * chars.length);
          return chars[randIndex];
        })
        .join('');

      setDisplayText(scrambled);

      if (progress >= 1) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, triggerKey, preset, speed, duration, chars]);

  return (
    <Component className={`ascii-text-reveal ${className}`} data-preset={preset}>
      {displayText}
    </Component>
  );
}
