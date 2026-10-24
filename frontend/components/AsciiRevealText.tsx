'use client';

import React, { useEffect, useState, useRef } from 'react';

export interface AsciiRevealTextProps {
  text: string;
  className?: string;
  speed?: number; // ms per tick
  preset?: 'decode' | 'terminal' | 'blueprint' | 'dither';
  triggerKey?: string | number; // Re-trigger on change
  as?: React.ElementType;
}

// Preset character palettes
const CHAR_SETS = {
  decode: '.-+*=%@#01XYZ',
  terminal: '01_[]{}<>/\\$#@!~',
  blueprint: '+-|/\\[]{}:;.',
  dither: ' .:-=+*#%@'
};

export default function AsciiRevealText({
  text,
  className = '',
  speed = 28,
  preset = 'decode',
  triggerKey,
  as: Component = 'span'
}: AsciiRevealTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const chars = CHAR_SETS[preset] || CHAR_SETS.decode;
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(text);
      return;
    }

    const targetLength = text.length;
    let iteration = 0;
    const totalFrames = targetLength * 2.5;

    const interval = setInterval(() => {
      iteration++;
      const resolvedCount = Math.floor((iteration / totalFrames) * targetLength);

      const scrambled = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (char === '\n') return '\n';
          if (index < resolvedCount) {
            return text[index];
          }
          // Pick random ASCII glyph from chosen preset palette
          const randIndex = Math.floor(Math.random() * chars.length);
          return chars[randIndex];
        })
        .join('');

      setDisplayText(scrambled);

      if (resolvedCount >= targetLength) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => {
      clearInterval(interval);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, triggerKey, preset, speed, chars]);

  return (
    <Component className={`ascii-text-reveal ${className}`} data-preset={preset}>
      {displayText}
    </Component>
  );
}

