'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AsciiRevealProps {
  children: React.ReactNode;
  preset?: 'decode' | 'terminal' | 'blueprint' | 'dither';
  triggerKey?: string | number;
  duration?: number; // total duration in ms
  cellSize?: number; // size of character cells in px
  className?: string;
}

const PRESET_CONFIGS = {
  decode: {
    chars: '.:-=+*#%@',
    color: 'rgba(37, 99, 235, 0.7)', // electric blue
    leadColor: 'rgba(15, 23, 42, 0.9)',
    bgAlpha: 0.85
  },
  terminal: {
    chars: '0101_[]<>$#*!/',
    color: 'rgba(16, 185, 129, 0.75)', // emerald terminal
    leadColor: 'rgba(5, 150, 105, 1)',
    bgAlpha: 0.9
  },
  blueprint: {
    chars: '+-|/\\[]{}:;.',
    color: 'rgba(59, 130, 246, 0.65)',
    leadColor: 'rgba(29, 78, 216, 0.9)',
    bgAlpha: 0.85
  },
  dither: {
    chars: ' ░▒▓█',
    color: 'rgba(100, 116, 139, 0.7)',
    leadColor: 'rgba(15, 23, 42, 0.9)',
    bgAlpha: 0.85
  }
};

export default function AsciiReveal({
  children,
  preset = 'decode',
  triggerKey,
  duration = 550,
  cellSize = 14,
  className = ''
}: AsciiRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimating(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const config = PRESET_CONFIGS[preset] || PRESET_CONFIGS.decode;
    const chars = config.chars;
    const cols = Math.ceil(rect.width / cellSize);
    const rows = Math.ceil(rect.height / cellSize);

    setAnimating(true);

    const startTime = performance.now();
    let animId: number;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, rect.width, rect.height);

      if (progress < 1) {
        ctx.font = `600 ${cellSize - 3}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Scanline sweep wave from left to right (with slight angle)
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // Coordinate normalized
            const cellProgressThreshold = (c / cols) * 0.75 + (r / rows) * 0.25;

            // Before wave: covered with ASCII scramble
            // After wave: resolved (transparent so DOM element underneath is revealed)
            if (cellProgressThreshold > progress) {
              const x = c * cellSize + cellSize / 2;
              const y = r * cellSize + cellSize / 2;

              // Near wave front
              const distFromWave = cellProgressThreshold - progress;
              if (distFromWave < 0.15) {
                ctx.fillStyle = config.leadColor;
              } else {
                ctx.fillStyle = config.color;
              }

              // Pick random glyph
              const char = chars[Math.floor(Math.random() * chars.length)];
              ctx.fillText(char, x, y);
            }
          }
        }

        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
        setAnimating(false);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (ctx) ctx.clearRect(0, 0, rect.width, rect.height);
      setAnimating(false);
    };
  }, [triggerKey, preset, duration, cellSize]);

  return (
    <div ref={containerRef} className={`ascii-reveal-wrapper ${className}`}>
      {/* Underlying DOM content (Never shifts layout) */}
      <div className={`ascii-reveal-content ${animating ? 'ascii-reveal-animating' : ''}`}>
        {children}
      </div>

      {/* Synchronized ASCII wave overlay canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`ascii-reveal-canvas ${animating ? 'ascii-canvas-active' : ''}`}
      />
    </div>
  );
}

