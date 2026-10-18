'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { PRESETS } from '../lib/modules';

export interface PresetDialItem {
  id: string;
  label: string;
  desc: string;
  tools: string[];
}

export const ALL_PRESET_ITEMS: PresetDialItem[] = [
  ...PRESETS.map((p) => ({
    id: p.id,
    label: p.name.toUpperCase(),
    desc: p.description,
    tools: p.modules
  })),
  {
    id: 'custom',
    label: 'CUSTOM',
    desc: 'Fine-tune individual canopy & root modules directly on the tree',
    tools: []
  }
];

export const STEP_DEG = 360 / ALL_PRESET_ITEMS.length;

interface PresetDialProps {
  activePresetId: string;
  onSelectPresetByIndex: (index: number, applyModules?: boolean) => void;
  activeToolCount: number;
  onToggleCustomize: () => void;
  targetAngle: number;
  setTargetAngle: React.Dispatch<React.SetStateAction<number>>;
  currentAngle: number;
  setCurrentAngle: React.Dispatch<React.SetStateAction<number>>;
}

export default function PresetDial({
  activePresetId,
  onSelectPresetByIndex,
  activeToolCount,
  onToggleCustomize,
  targetAngle,
  setTargetAngle,
  currentAngle,
  setCurrentAngle
}: PresetDialProps) {
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startAngle: 0, velocity: 0 });

  // Spring animation loop for smooth dial rotation
  useEffect(() => {
    let animId: number;
    const updateDial = () => {
      if (!dragRef.current.isDragging) {
        setCurrentAngle((curr) => {
          const diff = targetAngle - curr;
          if (Math.abs(diff) < 0.01) return targetAngle;
          return curr + diff * 0.14;
        });
      }
      animId = requestAnimationFrame(updateDial);
    };
    animId = requestAnimationFrame(updateDial);
    return () => cancelAnimationFrame(animId);
  }, [targetAngle, setCurrentAngle]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startAngle = currentAngle;
    dragRef.current.velocity = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const nextAngle = dragRef.current.startAngle + dx * 0.32;
    dragRef.current.velocity = nextAngle - currentAngle;
    setCurrentAngle(nextAngle);
    setTargetAngle(nextAngle);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const projected = currentAngle + dragRef.current.velocity * 3.5;
    const snappedIdx = Math.round(-projected / STEP_DEG);
    onSelectPresetByIndex(snappedIdx, true);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const curIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === activePresetId);
    const dir = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
    onSelectPresetByIndex(curIdx + dir, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const curIdx = ALL_PRESET_ITEMS.findIndex((p) => p.id === activePresetId);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onSelectPresetByIndex(curIdx + 1, true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onSelectPresetByIndex(curIdx - 1, true);
    }
  };

  return (
    <section className="center-dial-stage" aria-label="3D Preset Selector Carousel">
      <div
        ref={carouselContainerRef}
        id="carousel-viewport"
        className="carousel-viewport"
        role="radiogroup"
        aria-label="Workstation Presets"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
      >
        <div id="carousel-cylinder" className="carousel-cylinder">
          {ALL_PRESET_ITEMS.map((preset, idx) => {
            const rawDeg = idx * STEP_DEG + currentAngle;
            // Normalize relative angular offset to range [-180, 180]
            const normDeg = ((((rawDeg % 360) + 540) % 360) - 180);

            // FIX: Strict culling on backface!
            // If outside front arc [-75deg, +75deg], completely cull element to prevent mirror images!
            if (Math.abs(normDeg) > 75) {
              return null;
            }

            const rad = (normDeg * Math.PI) / 180;
            const radiusX = typeof window !== 'undefined' ? Math.min(320, window.innerWidth * 0.35) : 280;
            const radiusZ = 130;

            const x = Math.sin(rad) * radiusX;
            const z = (Math.cos(rad) - 1) * radiusZ;

            // FIX: Rotate gently along cylinder normal without vertical/keystone tilt!
            const rotY = -normDeg * 0.22;

            const distProgress = 1 - Math.abs(normDeg) / 75; // 1 at center, 0 at edge
            const scale = 0.65 + 0.35 * Math.pow(distProgress, 1.4);
            const opacity = 0.2 + 0.8 * Math.pow(distProgress, 1.3);
            const blurPx = (1 - distProgress) * 4.5;
            const isFront = preset.id === activePresetId;

            return (
              <div
                key={preset.id}
                className={`dial-3d-item ${isFront ? 'is-front' : ''} ${preset.id === 'custom' ? 'is-custom-option' : ''}`}
                role="radio"
                aria-checked={isFront}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPresetByIndex(idx, true);
                }}
                style={{
                  transform: `translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
                  filter: blurPx < 0.3 ? 'none' : `blur(${blurPx.toFixed(2)}px)`,
                  opacity: opacity.toFixed(3),
                  zIndex: Math.round(distProgress * 100),
                  pointerEvents: distProgress > 0.25 ? 'auto' : 'none'
                }}
              >
                <div className="dial-3d-title">
                  {preset.label}
                  {preset.id === 'custom' && <span className="custom-sparkle-pip">✦</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dial-meta-bar">
        <span id="dial-tools-pill" className="dial-tools-pill">
          {activeToolCount} Tools Active
        </span>
        <span id="dial-desc-text" className="dial-hint-text">
          ← Drag, Scroll, or Click Preset →
        </span>
        <button
          id="btn-customize-toggle"
          className={`customize-trigger-btn ${activePresetId === 'custom' ? 'active-custom' : ''}`}
          title="Toggle Custom Module Cards"
          onClick={onToggleCustomize}
        >
          <span>{activePresetId === 'custom' ? 'Done Customizing' : 'Customize Stack'}</span>
          <span className="customize-star-icon">✦</span>
        </button>
      </div>
    </section>
  );
}
