# DotUp V3 — UX Redesign Audit

**Date:** 2026-10-12  
**Target:** DotUp V3 Frontend Setup Builder Redesign & Interactive Configurator  
**Document Status:** Complete (Phase 1 Baseline Audit)

---

## 1. Current Implementation Summary

The DotUp platform currently consists of:
- **Execution Engine (CLI):** Bash-based idempotent engine with canonical V3 Setup Definition parser (`lib/config_parser.sh`, `lib/config_validator.sh`, `dotup`, `bootstrap.sh`, etc.), tested and verified across Ubuntu and Debian.
- **Backend (FastAPI):** Python 3.11+ REST API running with Uvicorn, SQLAlchemy session factory, PostgreSQL 15 database connection, and Alembic migration infrastructure (`backend/app/main.py`). Currently exposes a single `/health` endpoint returning `{"status": "ok", "database": "ok"}`. No setup persistence endpoints currently exist in the backend.
- **Frontend (Next.js 14.2.5 App Router):** React 18, TypeScript, custom CSS styles in `frontend/app/globals.css` using Plus Jakarta Sans and JetBrains Mono fonts. The root page (`frontend/app/page.tsx`) server-renders a header with system health status pills (Frontend, Backend, Database) and mounts `<SetupGenerator />`.
- **Existing Configurator Component (`frontend/components/SetupGenerator.tsx`):** A monolithic 952-line client component that manages form inputs, preset switching, module toggles, version selection via `LiquidDropdown.tsx`, inline string generation for YAML/bash command, clipboard copy, and file download.

---

## 2. Existing Features and Their Locations

| Feature | Location | Current Implementation Details |
| :--- | :--- | :--- |
| **Preset Selection** | `frontend/components/SetupGenerator.tsx:45-63, 180-201`, `frontend/lib/modules.ts:106-137` | 5 presets: `minimal`, `frontend`, `backend`, `devops`, `full`. Selecting a preset resets profile name to `${id}-setup`, overrides description, and toggles module booleans. Manual toggle sets activePreset to `'custom'`. |
| **Profile Form** | `frontend/components/SetupGenerator.tsx:213-235` | Text input for `profileName` (defaults to `full-setup`) and `profileDesc` (defaults to full description). No format validation, no regex constraint, no visual error feedback. |
| **Module Explorer & Categorization** | `frontend/components/SetupGenerator.tsx:247-338`, `frontend/lib/modules.ts:12-97, 139-145` | 10 modules across 5 categories: `system`, `zsh` (terminal), `git`, `node`, `python`, `java` (development), `docker`, `gcloud` (infrastructure), `vscode`, `chrome` (editors). |
| **Version Selection** | `frontend/components/LiquidDropdown.tsx`, `frontend/lib/modules.ts:42-65` | Supported on `node` (defaults `20`), `python` (defaults `3.11`), `java` (defaults `17`). Values in `versionOptions` had visual suffixes (e.g. `'20 LTS'`, `'OpenJDK 17'`) causing option value divergence. |
| **YAML Serialization** | `frontend/lib/generator.ts:11-40` | Generates legacy/v2 schema (`schema_version: 1`, `profile:`, `modules:`). **Does not output canonical V3 schema** (`schemaVersion: "1"`, `setup:`, `components:` with optional `options:`). |
| **Command Generation** | `frontend/lib/generator.ts:45-55` | Produces heredoc writing `setup.yaml` and piping `bootstrap.sh` with `--config "$PWD/setup.yaml"`. |
| **Copy & Download** | `frontend/components/SetupGenerator.tsx:101-131` | Copies command or YAML to clipboard with 2.2s feedback; triggers blob download for `setup.yaml`. |
| **Search & Filtering** | None | Not implemented in existing component. |
| **Backend Integration** | `frontend/app/page.tsx:11-25` | Server-side `/health` check only. No persistence API calls. |

---

## 3. Current API and Data Contracts

### 3.1 Backend FastAPI Contracts
- **`GET /health`**: Returns `{"status": "ok", "database": "ok" | "failed"}`.
- **Backend URL:** Configured via `BACKEND_URL` environment variable (defaults to `http://localhost:8000`).
- **Database:** PostgreSQL containerized via Docker Compose.
- **Persistence:** Currently no profile CRUD endpoints exist in the backend.

### 3.2 Canonical V3 Setup Definition Contract
Established in engine parser (`engine/lib/config_parser.sh`) and tests (`tests/test_config.sh`, `tests/test_cli_integration.sh`):

```yaml
schemaVersion: "1"

setup:
  id: backend-dev
  version: "1.0.0"
  description: "Optional description"

components:
  - id: git
  - id: node
    options:
      version: "20"
  - id: docker
```

**Key parser rules & constraints in `engine/lib/config_parser.sh`:**
1. Root keys allowed: `schemaVersion`, `setup`, `components`.
2. `schemaVersion` must equal `"1"`.
3. Under `setup:`:
   - `id` (mandatory in validation; alphanumeric and hyphens/underscores).
   - `version` (mandatory in validation; semver string, e.g. `"1.0.0"`).
   - `description` (optional string).
4. Under `components:`:
   - Sequence items `- id: <component_id>`.
   - Optional `options:` block with key-value pairs (e.g. `version: "20"`). Options are mapped internally to `<module>.<key>=<val>` in `$DOTUP_CONFIG_FILE`.
5. Supported module options in engine:
   - `node`: `version` (e.g. `"20"`, `"22"`, `"18"`).
   - `python`: `version` (e.g. `"3.11"`, `"3.12"`, `"3.10"`).
   - `java`: `version` (e.g. `"17"`, `"21"`, `"11"`).

### 3.3 Bootstrap Execution Engine Invocation Contract
```bash
cat << 'EOF' > setup.yaml
<canonical_yaml>
EOF
curl -fsSL https://raw.githubusercontent.com/AdityaRaj-DE/DotUp/main/bootstrap.sh | bash -s -- --config "$PWD/setup.yaml"
```
Or directly with the CLI:
`dotup install --config setup.yaml`

---

## 4. Existing Design and Interaction Problems

1. **Schema Divergence:** `frontend/lib/generator.ts` outputs legacy V2 schema (`schema_version: 1`, `profile:`, `modules:`) rather than the established canonical V3 schema (`schemaVersion: "1"`, `setup:`, `components:`).
2. **Version Option Suffix Pollution:** In `frontend/lib/modules.ts`, options had human labels like `'20 LTS'` or `'OpenJDK 17'`. If selected, this inserted `"20 LTS"` directly into configuration files where the engine expects `"20"`, causing runtime failures.
3. **Monolithic Component Structure:** `SetupGenerator.tsx` is 952 lines long with inline styles, coupled logic, and no modular decomposition.
4. **No Search or Filter Capabilities:** Users must scroll through all modules without search, filtering by category, or quick selection toggles.
5. **No Bulk Actions:** Lacks "Select all visible", "Clear all", or category-level toggling.
6. **No Configuration Validation & Explanations:** Empty module selection, invalid profile IDs (spaces, special characters), or missing versions have no inline validation or warning indicators before command generation.
7. **Preset Customization Silent Overwrite:** Changing a preset after making customizations gave no warning or indication of overwritten selections.
8. **Summary & Inspection Gaps:** No compact interactive selection drawer/tray showing exactly what is enabled, missing quick removal from summary.
9. **Accessibility Shortfalls:** Keyboard navigation on module cards was inconsistent; missing accessible names on icon buttons; missing ARIA attributes on tab switchers and status badges.
10. **Mobile Responsiveness Issues:** Fixed pixel layouts (`1380px`, rigid column splits) without fluid flex/grid breakpoints caused overflow on screens under 768px.

---

## 5. Missing or Incomplete Functionality

1. Canonical V3 YAML serialization engine supporting `schemaVersion: "1"`, `setup: { id, version, description }`, and `components: [{ id, options }]`.
2. Dedicated modular components:
   - `SetupBuilder` (orchestrator with single authoritative state)
   - `PresetSelector` (card-based preset selector with module badges)
   - `ProfileInformation` (validated setup ID, version, and description)
   - `ModuleExplorer` (search, category filtering, bulk actions)
   - `ModuleCard` (accessible card with keyboard focus and version picker)
   - `SelectionSummary` (interactive tray with module pills and one-click remove)
   - `CommandPreview` (live terminal viewer with tabbed command / YAML views, copy confirmation, and file download)
   - `ConfigurationStatus` (validation banner indicating readiness)
3. Validation engine:
   - Valid setup ID regex: `^[a-zA-Z0-9_-]+$`
   - At least 1 module selected
   - Supported clean version options
4. Client-side persistence fallback (LocalStorage draft saving/restoring) since backend profile persistence endpoints are currently not mounted in FastAPI.
5. Unit and component tests for frontend modules, generator, and validation logic.

---

## 6. Planned Implementation Changes

### 6.1 State Architecture & Data Flow
Single authoritative state:
```typescript
interface SetupState {
  setupId: string;
  setupVersion: string;
  description: string;
  activePresetId: string | 'custom';
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  searchQuery: string;
  selectedCategory: string | 'all';
}
```
Derived state:
- `selectedCount`: number of enabled modules.
- `validationErrors`: array of validation issues (`id`, `message`, `field`).
- `isValid`: boolean.
- `canonicalYaml`: pure function `generateV3Yaml(state)`.
- `bootstrapCommand`: pure function `generateV3Command(state)`.

### 6.2 Component Hierarchy
```
app/page.tsx
 └── SetupBuilder (orchestrator)
      ├── SetupHeader (branding, profile badge, status indicators, reset action)
      ├── ConfigurationStatus (readiness & validation banner)
      ├── Layout Grid (responsive 2-column on desktop, single on mobile)
      │    ├── Left Workspace
      │    │    ├── PresetSelector
      │    │    ├── ProfileInformation
      │    │    ├── ModuleExplorer
      │    │    │    ├── ExplorerHeader (search input, category filters, bulk actions)
      │    │    │    └── ModuleCategoryGroup
      │    │    │         └── ModuleCard (with inline VersionSelector)
      │    │    └── SelectionSummary (collapsible active modules drawer)
      │    └── Right Terminal / Command Hub
      │         ├── CommandPreview (One-liner snippet / V3 YAML preview tabs)
      │         ├── CopyButton & DownloadYamlButton
      │         └── ExecutionGuideCard
```

### 6.3 Design Tokens & Styling
Maintain the clean, premium developer aesthetics:
- Font: Inter / Plus Jakarta Sans + JetBrains Mono.
- Colors: Slate palette (`#0f172a`, `#1e293b`, `#334155`, `#f8fafc`, `#e2e8f0`), indigo/blue accents (`#2563eb`, `#3b82f6`), emerald success (`#10b981`), amber warnings (`#f59e0b`).
- Micro-interactions: Subtle spring transitions (`--ease-apple`), active press states, pulse indicators, toast/copied feedback.
- Accessible focus rings: `outline: 2px solid #2563eb; outline-offset: 2px`.

---

## 7. Regression Risks and Verification Strategy

| Risk | Mitigation | Verification |
| :--- | :--- | :--- |
| **YAML Schema Incompatibility:** Engine fails to parse generated YAML | Use canonical V3 format matching `tests/test_config.sh` (`schemaVersion: "1"`, `setup`, `components`). | Run generated YAML through `engine/lib/config_parser.sh` via test script. |
| **Option Value Corruption:** e.g. "20 LTS" instead of "20" breaks engine option validation | Clean version values (`20`, `22`, `18`, `3.11`, `17`) with optional display labels separated in data model. | Verify parsed values in `$DOTUP_CONFIG_FILE`. |
| **State Desynchronization:** YAML preview, download file, and copy command diverge | Derive YAML, download blob, and bash command from the exact same pure generator function. | Unit tests asserting byte-for-byte YAML identity between generator and download. |
| **Search Filter Dropping Selections:** Filtering hides modules, potentially losing checked state | Checked state stored in independent dictionary by module ID, decoupled from search query or visible filter. | Component test: search, toggle, clear search, verify selection retained. |
| **Layout Breakage on Mobile:** 375px/768px viewport overflow | Fluid CSS grid/flexbox with `@media` breakpoints; `min-width: 0` on flex items; code blocks with `overflow-x: auto`. | Viewport inspection and responsive checks at 375px, 768px, 1024px, 1440px. |
| **Build & Lint Failure:** Next.js build or TypeScript errors | Run `npm run build` and `npm run lint`. | Automated build execution. |
