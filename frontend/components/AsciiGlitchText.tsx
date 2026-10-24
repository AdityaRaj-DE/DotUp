'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export const ASCII_GLITCH_CHARS = '.-=+*#%@01XYZ';

export interface UseAsciiGlitchOptions {
  chars?: string;
  speed?: number;
  frames?: number;
}

export function useAsciiGlitch(
  text: string,
  options: UseAsciiGlitchOptions = {}
) {
  const { chars = ASCII_GLITCH_CHARS, speed = 28, frames = 5 } = options;
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const triggerGlitch = useCallback(() => {
    let frame = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      frame++;
      if (frame > frames) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDisplayText(text);
        return;
      }
      const arr = text.split('');
      const count = arr.length > 10 ? 2 : 1;
      for (let c = 0; c < count; c++) {
        const randIdx = Math.floor(Math.random() * arr.length);
        if (arr[randIdx] && arr[randIdx] !== ' ') {
          arr[randIdx] = chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplayText(arr.join(''));
    }, speed);
  }, [text, chars, speed, frames]);

  const resetGlitch = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayText(text);
  }, [text]);

  return { displayText, triggerGlitch, resetGlitch };
}

export interface AsciiGlitchTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
  chars?: string;
  speed?: number;
  durationFrames?: number;
  isGlitching?: boolean;
  hoverEnabled?: boolean;
}

export default function AsciiGlitchText({
  text,
  className = '',
  as: Component = 'span',
  chars = ASCII_GLITCH_CHARS,
  speed = 28,
  durationFrames = 5,
  isGlitching,
  hoverEnabled = true
}: AsciiGlitchTextProps) {
  const { displayText, triggerGlitch, resetGlitch } = useAsciiGlitch(text, {
    chars,
    speed,
    frames: durationFrames
  });

  useEffect(() => {
    if (isGlitching === true) {
      triggerGlitch();
    } else if (isGlitching === false) {
      resetGlitch();
    }
  }, [isGlitching, triggerGlitch, resetGlitch]);

  return (
    <Component
      className={`ascii-glitch-text ${className}`}
      onMouseEnter={hoverEnabled ? triggerGlitch : undefined}
      onMouseLeave={hoverEnabled ? resetGlitch : undefined}
    >
      {displayText}
    </Component>
  );
}

