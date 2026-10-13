# DotUp V3 — Interactive Voxel Tree Setup Builder: Audit & Baseline

**Date:** 2026-10-13  
**Target:** Interactive 3D Voxel Tree Setup Builder (inspired by tree.icqr.com)  
**Status:** Audit Complete (Phase 1 Baseline)

---

## 1. Environment & Architecture Baseline

### 1.1 Git Status & Repository
- **Current Branch:** `v3-frontend`
- **Recent Commits:**
  - `ababd88` Refactor code structure for improved readability and maintainability
  - `babe34a` refactor: update module definitions and categories, enhance dropdown component, and add global styles
- **Working Tree:** Clean baseline prior to voxel builder implementation.

### 1.2 Frontend Stack
- **Framework:** Next.js 14.2.5 (App Router, React 18.3.1, TypeScript 5.5.3).
- **Installed 3D Libraries:** `three` (0.186.x) and `@types/three`. Vanilla Three.js integrated via direct canvas ref in client components avoids React 18/R3F peer dependency version conflicts and ensures maximum rendering performance and control.
- **Styling:** CSS variables design system in `frontend/app/globals.css`.
- **Existing Components:**
  - `SetupBuilder.tsx`: Canonical configuration state holder, preset switching, module toggles, validation.
  - `ModuleExplorer.tsx`: Search, categories, bulk toggles.
  - `CommandPreview.tsx`: Live canonical YAML & bootstrap command preview, copy command, download YAML.
  - `PresetSelector.tsx`, `ProfileInformation.tsx`, `SelectionSummary.tsx`, `LiquidDropdown.tsx`.
- **Existing Data Models:**
  - `MODULES`: 10 modules across 5 categories (`system`, `terminal`, `development`, `infrastructure`, `editors`).
  - `PRESETS`: 5 presets (`minimal`, `frontend`, `backend`, `devops`, `full`).
  - `CATEGORIES`: 5 canonical categories.
  - `generateDotupYaml`: Pure canonical V3 YAML serializer (`schemaVersion: "1"`, `setup`, `components`).
  - `generateBootstrapSnippet`: Deterministic installation command.

### 1.3 Backend & Infrastructure
- **FastAPI Backend:** Containerized (`dotup-backend`), exposes `/health` with database check.
- **PostgreSQL:** PostgreSQL 15 (`dotup-postgres`).
- **Contract Boundary:** Frontend communicates with backend via `/health`; configuration generation is client-side idempotent; FastAPI does not run bash commands.

---

## 2. Product Requirements & 3D Voxel Concept

### 2.1 3-Region Layout
1. **Top Navigation:** Brand identity, About, How to Use, Policy, Meet Developer, and Code View action.
2. **Left Configuration Sidebar:** Sole configuration interface (search, categories, module checkboxes, versions, presets, profile info, selection summary, bottom action area with Copy Command and Download YAML).
3. **Central 3D Tree:** Stylized 3D voxel tree composed of small cubes, occupying the prominent center/right stage.

### 2.2 Visual Voxel Tree Model
- **Trunk & Branches:** Solid wooden trunk with branching arms reaching into 5 category spatial quadrants/regions.
- **Ground Platform:** Restrained floating voxel pedestal with subtle grid/shadow.
- **Shared Category Foliage Regions:**
  - `system`: Lower core canopy / base crown.
  - `terminal`: Lower left branch cluster.
  - `development`: Top center crowning canopy.
  - `infrastructure`: Right mid-level canopy.
  - `editors`: Left mid-to-high canopy.
- **Module Contribution:** Each selected module contributes deterministic voxel clusters to its category's shared canopy region. When no modules are selected in a category, that category displays bare wooden branches. When all modules are selected, canopy is lush and full.
- **Cube Count Decoupling:** Cube count is purely aesthetic, never representing module complexity or file sizes.
- **Deterministic Geometry:** Layout uses fixed seeds per module and coordinate sets. Adding or toggling a module never rearranges existing foliage.

### 2.3 Camera & Interaction Contract
- **Allowed:** Horizontal orbit drag (mouse and touch).
- **Disabled:** Zoom (wheel, pinch), Pan, vertical inversion/flip, tree clicking/module selection via 3D.
- **Tree interaction NEVER alters configuration state.**

### 2.4 Animation System
- **Add Module:** Cubes animate in (scale/pop transition from branch anchor to final position).
- **Remove Module:** Affected cubes animate out (scale down/fade).
- **Idle Motion:** Subtle breathing/sway on leaves.
- **Interruption Safety:** Animations driven purely by current selection state; no stale cubes or orphan geometry on rapid toggles.
- **Accessibility:** `prefers-reduced-motion` skips animation and renders deterministic static voxels instantly.
- **WebGL Fallback:** Clean stylized SVG/isometric fallback card if WebGL context is lost or unsupported.
