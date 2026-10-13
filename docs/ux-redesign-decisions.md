# DotUp V3 — Interactive Voxel Tree: Architectural Decisions

**Date:** 2026-10-13  
**Status:** Approved & Active

---

## Decision 1: Vanilla Three.js over React Three Fiber (R3F)
- **Context:** R3F introduces heavy React reconciler overhead for fine-grained per-cube animations and frequent version peer-dependency friction with Next.js 14 App Router and React 18.
- **Decision:** Use vanilla `three.js` with an encapsulated React wrapper (`VoxelTreeCanvas.tsx`).
- **Rationale:** Direct scene graph control allows instanced mesh / procedural voxel rendering, requestAnimationFrame animation loops with zero React re-renders per frame, strict camera gesture locking (mouse drag horizontal orbit only, e.preventDefault on wheel), and clean WebGL context lifecycle management.

## Decision 2: Instanced Procedural Voxels with Stable Identifiers
- **Context:** A full tree canopy consists of several hundred voxel cubes. Rendering individual meshes causes draw-call overhead. Rebuilding geometry on each toggle risks animation jumps.
- **Decision:** Divide the tree into:
  1. Static Base & Trunk: Low-draw-call voxel trunk, boughs, ground plinth.
  2. Dynamic Category Foliage: Deterministic voxel coordinates assigned to each module in category spatial clusters.
  3. Animation Engine: Per-cube birth/death timestamps and target scales interpolated smoothly in the RAF render loop.
- **Rationale:** Ensures deterministic positions, zero GC churn, 60fps performance, and seamless interruptibility when toggling modules rapidly.

## Decision 3: Strict Camera Constraints (Rotation-Only)
- **Context:** Users must inspect the 3D voxel tree without disorienting navigation, accidental zooming, or breaking page scrolling.
- **Decision:**
  - Orbit camera: fixed radius (distance ~28 units), fixed elevation angle (~25-30 degrees), azimuth rotation driven strictly by pointer drag (horizontal delta).
  - Wheel events: completely unhandled by Three.js (allowed to scroll page normally, or explicitly blocked on the canvas to prevent zoom).
  - Pinch gestures: prevented from scaling the 3D view.
  - Reset View button provided in the 3D scene viewport overlay.

## Decision 4: Single Authoritative State Ownership
- **Context:** Product requirement mandates that the sidebar is the sole configuration interface.
- **Decision:** `SetupBuilder.tsx` owns the authoritative state (`selectedModules`, `setupId`, `setupVersion`, etc.). The 3D canvas is purely a reactive consumer via props (`selectedModules`). Clicks on the 3D canvas do not alter state.
