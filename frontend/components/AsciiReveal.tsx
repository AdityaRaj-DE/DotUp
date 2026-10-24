'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AsciiRevealProps {
  children: React.ReactNode;
  preset?: 'decode' | 'dither' | 'terminal' | 'blueprint';
  triggerKey?: string | number;
  duration?: number;
  cellSize?: number;
  waveFrom?: 'center' | 'corner' | 'cursor';
  speedMultiplier?: number;
  className?: string;
  as?: 'div' | 'span';
}

const PRESET_CONFIGS = {
  decode: {
    chars: '.-=+*#%@#01XYZ░▒▓',
    color: 'rgba(255, 255, 255, 0.45)',
    leadColor: '#ffffff'
  },
  dither: {
    chars: ' ░▒▓█',
    color: 'rgba(255, 255, 255, 0.55)',
    leadColor: '#ffffff'
  },
  terminal: {
    chars: '0101_[]<>$#*!/',
    color: '#34d399',
    leadColor: '#a7f3d0'
  },
  blueprint: {
    chars: '+-|/\\[]{}:;.',
    color: '#60a5fa',
    leadColor: '#bfdbfe'
  }
};

export default function AsciiReveal({
  children,
  preset = 'decode',
  triggerKey,
  duration = 600,
  cellSize = 14,
  waveFrom = 'center',
  speedMultiplier = 1,
  className = '',
  as = 'div'
}: AsciiRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(false);
  const Wrapper = as === 'span' ? 'span' : 'div';
  const Content = as === 'span' ? 'span' : 'div';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimating(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

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

    const adjustedDuration = duration / (speedMultiplier || 1);
    const startTime = performance.now();
    let animId: number;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / adjustedDuration, 1);

      ctx.clearRect(0, 0, rect.width, rect.height);

      if (progress < 1) {
        ctx.font = `600 ${cellSize - 3}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerC = cols / 2;
        const centerR = rows / 2;
        const maxDist = Math.hypot(centerC, centerR);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            let threshold = 0;

            if (waveFrom === 'center') {
              const dist = Math.hypot(c - centerC, r - centerR);
              threshold = dist / maxDist;
            } else if (waveFrom === 'corner') {
              threshold = (c / cols) * 0.7 + (r / rows) * 0.3;
            } else {
              threshold = (c / cols) * 0.5 + (r / rows) * 0.5;
            }

            // Before wave reaches cell: scrambled ASCII glyph
            // After wave: resolved DOM element underneath
            if (threshold > progress) {
              const x = c * cellSize + cellSize / 2;
              const y = r * cellSize + cellSize / 2;
              const distFromWave = threshold - progress;

              if (distFromWave < 0.15) {
                ctx.fillStyle = config.leadColor;
              } else {
                ctx.fillStyle = config.color;
              }

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
  }, [triggerKey, preset, duration, cellSize, waveFrom, speedMultiplier]);

  return (
    <Wrapper ref={containerRef as any} className={`ascii-reveal-wrapper ${className}`}>
      <Content className={`ascii-reveal-content ${animating ? 'ascii-reveal-animating' : ''}`}>
        {children}
      </Content>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`ascii-reveal-canvas ${animating ? 'ascii-canvas-active' : ''}`}
      />
    </Wrapper>
  );
}
