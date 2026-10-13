/**
 * Voxel Tree Geometry & Island Generator
 *
 * Foliage Connectivity, Canopy Quality & Natural Terrain Refinement:
 * 1. Branch-Anchored Canopy Envelope & Connected Foliage Clusters:
 *    - Eliminates detached/floating outlier cubes.
 *    - Anchors foliage clusters directly around actual supporting branches.
 *    - Each module contributes a coherent mass of overlapping voxels that visually
 *      and structurally adhere to its category bough.
 * 2. Layered Organic Canopy:
 *    - Multi-scale cube hierarchy:
 *      * Macro core volume blocks (0.85 - 1.05) establishing dense foliage bodies.
 *      * Medium transition blocks (0.62 - 0.76) shaping organic cluster boundaries.
 *      * Micro edge blocks (0.42 - 0.54) creating natural leaf-silhouette variation.
 *    - Balanced coverage: dense canopy when all modules are enabled while preserving
 *      glimpses of trunk and branches through natural gaps.
 * 3. Natural Green Palette:
 *    - Sunlit outer canopy: #A6D95A
 *    - Primary leaf green:  #78BD43
 *    - Mid-depth green:     #438D35
 *    - Deep foliage green:  #245C2C
 *    - Shaded interior:     #1E4A25
 *    - Spatially coherent lighting-based distribution.
 * 4. Refined Grassy Island & Organic Terrain:
 *    - Expanded balanced platform with cohesive multi-tone turf (#7CB342, #558B2F, #33691E).
 *    - Natural stepped perimeter with warm earthy subsoil and bedrock underside.
 *    - Dedicated natural grass tuft clusters concentrated along edges and fields.
 * 5. Deterministic placement, zero-randomness across renders, zero coplanar z-fighting.
 */

export interface VoxelCoord {
  x: number;
  y: number;
  z: number;
  color?: string;
  size?: number;
}

export interface ModuleVoxelCluster {
  moduleId: string;
  categoryId: string;
  voxels: VoxelCoord[];
}

// Coordinated Natural Palettes inspired by stylized game asset voxel art
export const VOXEL_PALETTE = {
  // Wood / Bark Palette (warm natural timber)
  trunkHighlight: '#8d6e63', // Sunlit bark edges
  trunkMed: '#6d4c41',       // Primary warm brown trunk
  trunkDark: '#4e342e',      // Crevices, roots, branch forks
  trunkShadow: '#3e2723',    // Underside shading

  // Island / Grassy Base Palette
  grassLight: '#7cb342',     // Sunlit grassy upper surface
  grassMed: '#558b2f',       // Primary lush turf
  grassDark: '#33691e',      // Shaded turf / edge accents
  grassHighlight: '#8bc34a', // Vibrant grass patch accent
  soilTop: '#5d4037',        // Earthy upper soil rim
  soilBase: '#3e2723',       // Dark substrate bedrock / floating base
  soilDark: '#271915',       // Deep underplate shadow

  // Coordinated Natural Green Canopy Palette
  leafSunlit: '#A6D95A',     // Sunlit outer & upper foliage
  leafPrimary: '#78BD43',    // Primary leaf green body
  leafMid: '#438D35',        // Mid-depth intermediate layer
  leafDeep: '#245C2C',       // Deep foliage green & undercanopy
  leafShadow: '#1E4A25',     // Shaded inner core
  leafBright: '#95CD41'      // Fresh sunny highlights
};

// Procedural pseudo-random generator with fixed seed for strict determinism
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate the static trunk, branches, and enlarged grassy island base
 */
export function getStaticTreeVoxels(): {
  plinth: VoxelCoord[];
  trunk: VoxelCoord[];
  branches: Record<string, VoxelCoord[]>;
} {
  const plinth: VoxelCoord[] = [];
  const trunk: VoxelCoord[] = [];
  const branches: Record<string, VoxelCoord[]> = {
    system: [],
    terminal: [],
    development: [],
    infrastructure: [],
    editors: []
  };

  // -------------------------------------------------------------
  // 1. Enlarged Grassy Floating Island Base
  // -------------------------------------------------------------
  const step = 0.85;
  const islandRadius = 5.6;

  for (let gx = -6; gx <= 6; gx++) {
    for (let gz = -6; gz <= 6; gz++) {
      const worldX = Number((gx * step).toFixed(3));
      const worldZ = Number((gz * step).toFixed(3));
      const dist = Math.sqrt(worldX * worldX + worldZ * worldZ);

      // (a) Deep bedrock layer (y = -2.4): tapered floating underside
      if (dist <= 3.8) {
        plinth.push({
          x: worldX,
          y: -2.4,
          z: worldZ,
          color: (gx + gz) % 2 === 0 ? VOXEL_PALETTE.soilDark : VOXEL_PALETTE.soilBase,
          size: step
        });
      }

      // (b) Mid subsoil layer (y = -1.6): intermediate earthy perimeter
      if (dist <= 4.8) {
        plinth.push({
          x: worldX,
          y: -1.6,
          z: worldZ,
          color: dist > 3.8 ? VOXEL_PALETTE.soilBase : VOXEL_PALETTE.soilTop,
          size: step
        });
      }

      // (c) Top turf surface (y = -0.8): lush green grass with organic edge stepping
      const angle = Math.atan2(worldZ, worldX);
      const radiusVariation = Math.sin(angle * 4) * 0.4 + Math.cos(angle * 3) * 0.3;
      const effectiveRadius = islandRadius + radiusVariation;

      if (dist <= effectiveRadius) {
        const isPerimeter = dist > effectiveRadius - 0.9;
        let turfColor: string;
        if (isPerimeter) {
          turfColor = VOXEL_PALETTE.grassDark;
        } else if ((gx * 3 + gz * 7) % 5 === 0) {
          turfColor = VOXEL_PALETTE.grassHighlight;
        } else if ((gx + gz) % 2 === 0) {
          turfColor = VOXEL_PALETTE.grassLight;
        } else {
          turfColor = VOXEL_PALETTE.grassMed;
        }

        const isElevatedPatch = !isPerimeter && dist > 1.8 && dist < 3.8 && (gx + gz) % 4 === 0;
        const turfY = isElevatedPatch ? -0.65 : -0.8;

        plinth.push({
          x: worldX,
          y: turfY,
          z: worldZ,
          color: turfColor,
          size: step
        });
      }
    }
  }

  // (d) Decorative Grass Tufts & Natural Field Clumps
  const tuftOffsets: Array<{ x: number; z: number; color: string; size: number }> = [
    { x: -3.8, z: -1.8, color: VOXEL_PALETTE.grassLight, size: 0.45 },
    { x: -3.4, z: 2.2, color: VOXEL_PALETTE.grassHighlight, size: 0.48 },
    { x: 3.6, z: -2.4, color: VOXEL_PALETTE.grassMed, size: 0.46 },
    { x: 3.8, z: 1.8, color: VOXEL_PALETTE.grassLight, size: 0.44 },
    { x: 1.2, z: -4.0, color: VOXEL_PALETTE.grassMed, size: 0.48 },
    { x: -1.6, z: 4.0, color: VOXEL_PALETTE.grassLight, size: 0.44 },
    { x: 2.8, z: 3.2, color: VOXEL_PALETTE.grassDark, size: 0.42 },
    { x: -3.0, z: -3.2, color: VOXEL_PALETTE.grassDark, size: 0.42 },
    { x: 4.2, z: -0.5, color: VOXEL_PALETTE.grassLight, size: 0.4 },
    { x: -4.4, z: 0.4, color: VOXEL_PALETTE.grassHighlight, size: 0.42 },
    { x: 0.4, z: 4.4, color: VOXEL_PALETTE.grassMed, size: 0.44 },
    { x: -0.6, z: -4.4, color: VOXEL_PALETTE.grassDark, size: 0.4 }
  ];

  tuftOffsets.forEach((t) => {
    plinth.push({
      x: t.x,
      y: -0.32,
      z: t.z,
      color: t.color,
      size: t.size
    });
  });

  // -------------------------------------------------------------
  // 2. Tapered, Buttressed Organic Trunk
  // -------------------------------------------------------------
  const roots: VoxelCoord[] = [
    { x: 0.0, y: -0.4, z: 0.0, color: VOXEL_PALETTE.trunkDark, size: 1.55 },
    { x: 0.8, y: -0.5, z: 0.3, color: VOXEL_PALETTE.trunkMed, size: 0.95 },
    { x: -0.8, y: -0.5, z: -0.4, color: VOXEL_PALETTE.trunkDark, size: 0.95 },
    { x: -0.4, y: -0.5, z: 0.8, color: VOXEL_PALETTE.trunkMed, size: 0.9 },
    { x: 0.3, y: -0.5, z: -0.8, color: VOXEL_PALETTE.trunkDark, size: 0.9 },
    { x: 1.4, y: -0.65, z: 0.5, color: VOXEL_PALETTE.trunkDark, size: 0.65 },
    { x: -1.3, y: -0.65, z: -0.8, color: VOXEL_PALETTE.trunkDark, size: 0.65 },
    { x: -0.7, y: -0.65, z: 1.3, color: VOXEL_PALETTE.trunkDark, size: 0.6 }
  ];
  trunk.push(...roots);

  // Stepped, tapered trunk column (y = 0.2 to 5.2)
  trunk.push(
    { x: 0.0, y: 0.2, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.35 },
    { x: 0.45, y: 0.2, z: -0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.75 },
    { x: -0.35, y: 0.2, z: 0.35, color: VOXEL_PALETTE.trunkDark, size: 0.75 }
  );

  trunk.push(
    { x: 0.0, y: 0.9, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.25 },
    { x: -0.2, y: 0.9, z: -0.35, color: VOXEL_PALETTE.trunkDark, size: 0.7 },
    { x: 0.35, y: 0.9, z: 0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.7 }
  );

  trunk.push(
    { x: -0.05, y: 1.6, z: 0.05, color: VOXEL_PALETTE.trunkHighlight, size: 1.15 },
    { x: 0.3, y: 1.6, z: -0.2, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -0.3, y: 1.6, z: 0.2, color: VOXEL_PALETTE.trunkDark, size: 0.65 }
  );

  trunk.push(
    { x: 0.0, y: 2.3, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.05 },
    { x: 0.25, y: 2.3, z: 0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.6 },
    { x: -0.25, y: 2.3, z: -0.25, color: VOXEL_PALETTE.trunkDark, size: 0.6 }
  );

  trunk.push(
    { x: 0.05, y: 3.0, z: -0.05, color: VOXEL_PALETTE.trunkMed, size: 0.98 },
    { x: -0.3, y: 3.0, z: 0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.58 }
  );

  trunk.push(
    { x: 0.0, y: 3.7, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 0.92 },
    { x: 0.2, y: 3.7, z: -0.2, color: VOXEL_PALETTE.trunkDark, size: 0.55 }
  );

  trunk.push(
    { x: 0.0, y: 4.4, z: 0.05, color: VOXEL_PALETTE.trunkMed, size: 0.85 },
    { x: -0.15, y: 4.4, z: -0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: 0.0, y: 5.1, z: 0.0, color: VOXEL_PALETTE.trunkHighlight, size: 0.8 }
  );

  // -------------------------------------------------------------
  // 3. Hierarchical Connected Branches
  // -------------------------------------------------------------
  // (a) Category: System (Front-Left Canopy, y ~ 2.6 to 4.2)
  branches.system.push(
    { x: -0.5, y: 2.6, z: 0.35, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: -1.0, y: 2.9, z: 0.75, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -1.5, y: 3.3, z: 1.2, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    { x: -1.9, y: 3.6, z: 1.6, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: -2.3, y: 3.8, z: 1.9, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: -1.6, y: 3.7, z: 0.8, color: VOXEL_PALETTE.trunkMed, size: 0.48 },
    { x: -2.0, y: 4.0, z: 0.7, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (b) Category: Terminal (Back-Right Canopy, y ~ 3.0 to 4.6)
  branches.terminal.push(
    { x: 0.45, y: 3.0, z: -0.45, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: 1.0, y: 3.4, z: -0.9, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: 1.6, y: 3.8, z: -1.35, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    { x: 2.1, y: 4.1, z: -1.7, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: 2.5, y: 4.3, z: -1.5, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: 1.8, y: 4.2, z: -0.9, color: VOXEL_PALETTE.trunkMed, size: 0.48 },
    { x: 2.2, y: 4.5, z: -0.8, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (c) Category: Development Runtimes (Towering Crown Canopy, y ~ 5.2 to 7.8)
  branches.development.push(
    { x: 0.05, y: 5.8, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 0.72 },
    { x: -0.1, y: 6.4, z: -0.1, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: 0.25, y: 7.0, z: 0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.58 },
    { x: -0.3, y: 7.1, z: -0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.55 },
    { x: 0.4, y: 7.6, z: 0.35, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: -0.45, y: 7.7, z: -0.4, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: 0.0, y: 8.0, z: -0.1, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (d) Category: Infrastructure / Cloud (Mid-Right Canopy, y ~ 4.0 to 6.0)
  branches.infrastructure.push(
    { x: 0.55, y: 4.0, z: 0.45, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: 1.2, y: 4.5, z: 0.95, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: 1.8, y: 5.0, z: 1.4, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    { x: 2.3, y: 5.4, z: 1.7, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: 2.7, y: 5.7, z: 1.5, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: 2.1, y: 5.5, z: 0.9, color: VOXEL_PALETTE.trunkMed, size: 0.48 },
    { x: 2.6, y: 5.9, z: 0.8, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (e) Category: Editors & Apps (Upper-Left Canopy, y ~ 4.2 to 6.4)
  branches.editors.push(
    { x: -0.5, y: 4.2, z: -0.45, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: -1.1, y: 4.7, z: -0.95, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -1.7, y: 5.2, z: -1.4, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    { x: -2.2, y: 5.6, z: -1.75, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: -2.6, y: 5.9, z: -1.5, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: -1.9, y: 5.7, z: -0.85, color: VOXEL_PALETTE.trunkMed, size: 0.48 },
    { x: -2.4, y: 6.1, z: -0.7, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  return { plinth, trunk, branches };
}

/**
 * Spatial centers and bounds for category foliage canopies
 */
export const CATEGORY_CENTERS: Record<string, { x: number; y: number; z: number }> = {
  system: { x: -2.0, y: 4.2, z: 1.8 },
  terminal: { x: 2.4, y: 4.5, z: -1.6 },
  development: { x: 0.0, y: 8.2, z: 0.0 },
  infrastructure: { x: 2.6, y: 6.0, z: 1.6 },
  editors: { x: -2.5, y: 6.2, z: -1.5 }
};

/**
 * Deterministic generator for per-module foliage clusters.
 *
 * Foliage Connectivity & Canopy Quality Engine:
 * - Directly anchored to supporting branch nodes.
 * - Multi-scale cube hierarchy:
 *   Macro core blocks (0.85 - 1.05) establish dense, cohesive foliage masses.
 *   Medium boundary blocks (0.62 - 0.76) wrap around supporting branches.
 *   Micro edge blocks (0.42 - 0.54) produce organic silhouette irregularities.
 * - Distance-constrained envelope (max distance < 2.3 from branch anchors) completely
 *   eliminates detached or floating outlier cubes.
 * - Deterministic natural green palette assignment based on height, depth, and sunlight exposure.
 */
export function getModuleFoliageClusters(): Record<string, ModuleVoxelCluster> {
  const clusters: Record<string, ModuleVoxelCluster> = {};

  // Anchor branch hubs for each category
  const CATEGORY_BRANCH_HUBS: Record<string, Array<{ x: number; y: number; z: number }>> = {
    system: [
      { x: -1.5, y: 3.3, z: 1.2 },
      { x: -2.0, y: 4.0, z: 1.6 },
      { x: -1.8, y: 4.2, z: 1.0 }
    ],
    terminal: [
      { x: 1.6, y: 3.8, z: -1.35 },
      { x: 2.3, y: 4.3, z: -1.5 },
      { x: 2.0, y: 4.4, z: -0.9 }
    ],
    development: [
      { x: 0.0, y: 7.0, z: 0.0 },
      { x: 0.25, y: 7.6, z: 0.2 },
      { x: -0.3, y: 7.6, z: -0.25 },
      { x: 0.0, y: 8.1, z: 0.0 }
    ],
    infrastructure: [
      { x: 1.8, y: 5.0, z: 1.4 },
      { x: 2.5, y: 5.6, z: 1.5 },
      { x: 2.2, y: 5.8, z: 0.9 }
    ],
    editors: [
      { x: -1.7, y: 5.2, z: -1.4 },
      { x: -2.4, y: 5.8, z: -1.5 },
      { x: -2.1, y: 5.9, z: -0.8 }
    ]
  };

  const MODULE_SPECS: Record<
    string,
    { category: string; seed: number; hubIndex: number; localOffset: { x: number; y: number; z: number }; count: number }
  > = {
    // Category: System (1 module: system) -> dense lush lower-front canopy
    system: { category: 'system', seed: 101, hubIndex: 1, localOffset: { x: 0.0, y: 0.2, z: 0.0 }, count: 32 },

    // Category: Terminal (1 module: zsh) -> dense lush lower-right canopy
    zsh: { category: 'terminal', seed: 202, hubIndex: 1, localOffset: { x: 0.0, y: 0.2, z: 0.0 }, count: 32 },

    // Category: Development (4 modules: git, node, python, java) -> overarching towering crown canopy
    git: { category: 'development', seed: 303, hubIndex: 0, localOffset: { x: -0.4, y: 0.0, z: 0.3 }, count: 26 },
    node: { category: 'development', seed: 304, hubIndex: 1, localOffset: { x: 0.4, y: 0.2, z: -0.3 }, count: 28 },
    python: { category: 'development', seed: 305, hubIndex: 2, localOffset: { x: -0.3, y: 0.3, z: -0.3 }, count: 28 },
    java: { category: 'development', seed: 306, hubIndex: 3, localOffset: { x: 0.3, y: 0.1, z: 0.4 }, count: 26 },

    // Category: Infrastructure (2 modules: docker, gcloud) -> mid-right canopy
    docker: { category: 'infrastructure', seed: 401, hubIndex: 0, localOffset: { x: -0.2, y: 0.2, z: -0.2 }, count: 28 },
    gcloud: { category: 'infrastructure', seed: 402, hubIndex: 1, localOffset: { x: 0.3, y: 0.3, z: 0.2 }, count: 28 },

    // Category: Editors (2 modules: vscode, chrome) -> upper-left canopy
    vscode: { category: 'editors', seed: 501, hubIndex: 0, localOffset: { x: 0.2, y: 0.2, z: -0.2 }, count: 28 },
    chrome: { category: 'editors', seed: 502, hubIndex: 1, localOffset: { x: -0.3, y: 0.3, z: 0.2 }, count: 28 }
  };

  const latticeStep = 0.52;

  for (const [moduleId, info] of Object.entries(MODULE_SPECS)) {
    const hubs = CATEGORY_BRANCH_HUBS[info.category] || [CATEGORY_CENTERS[info.category]];
    const primaryHub = hubs[info.hubIndex % hubs.length];

    const rand = seededRandom(info.seed);
    const voxels: VoxelCoord[] = [];

    const originX = primaryHub.x + info.localOffset.x;
    const originY = primaryHub.y + info.localOffset.y;
    const originZ = primaryHub.z + info.localOffset.z;

    const occupied = new Set<string>();

    for (let i = 0; i < info.count; i++) {
      // Clustered radius around branch hub (capped at 1.45 to prevent detached floating cubes)
      const rawRadius = (rand() * 0.7 + rand() * 0.7); // smooth triangle distribution ~ [0, 1.4]
      const theta = 2.0 * Math.PI * rand();

      const rawDx = rawRadius * Math.cos(theta);
      const rawDz = rawRadius * Math.sin(theta);
      const rawDy = (rand() - 0.45) * 1.35;
      // Snap to consistent lattice grid preventing coplanar artifacts
      const gx = Math.round(rawDx / latticeStep);
      const gy = Math.round(rawDy / latticeStep);
      const gz = Math.round(rawDz / latticeStep);

      const key = `${gx},${gy},${gz}`;
      if (occupied.has(key)) {
        continue;
      }
      occupied.add(key);

      const dx = gx * latticeStep;
      const dy = gy * latticeStep;
      const dz = gz * latticeStep;

      const posX = Number((originX + dx).toFixed(3));
      const posY = Number((originY + dy).toFixed(3));
      const posZ = Number((originZ + dz).toFixed(3));

      const distFromHub = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Natural green color grading:
      // High Y and outer sun-facing faces -> #A6D95A (sunlit) / #95CD41 (fresh highlight)
      // Mid canopy body -> #78BD43 (primary leaf green) / #438D35 (mid-depth)
      // Lower and shaded interior -> #245C2C (deep foliage green) / #1E4A25 (inner shade)
      let leafColor: string;
      if (dy > 0.45 && (posX + posZ > 0 || rand() > 0.4)) {
        leafColor = rand() > 0.5 ? VOXEL_PALETTE.leafSunlit : VOXEL_PALETTE.leafBright;
      } else if (dy < -0.35 || (distFromHub < 0.55 && dy <= 0)) {
        leafColor = rand() > 0.4 ? VOXEL_PALETTE.leafDeep : VOXEL_PALETTE.leafShadow;
      } else if (distFromHub > 1.1) {
        leafColor = rand() > 0.5 ? VOXEL_PALETTE.leafBright : VOXEL_PALETTE.leafPrimary;
      } else {
        leafColor = rand() > 0.5 ? VOXEL_PALETTE.leafPrimary : VOXEL_PALETTE.leafMid;
      }

      // Hierarchy of cube sizes:
      // Macro core blocks (0.85 - 1.05) form the dense foliage volume
      // Medium filler blocks (0.64 - 0.78) blend clusters
      // Micro edge blocks (0.42 - 0.55) create natural silhouette leaf edges
      let voxelSize: number;
      if (distFromHub < 0.75) {
        voxelSize = 0.88 + rand() * 0.14; // Macro: >= 0.82
      } else if (distFromHub > 1.12) {
        voxelSize = 0.44 + rand() * 0.12; // Micro: < 0.60
      } else {
        voxelSize = 0.66 + rand() * 0.12; // Medium: 0.60 - 0.80
      }
      voxels.push({
        x: posX,
        y: posY,
        z: posZ,
        color: leafColor,
        size: Number(voxelSize.toFixed(3))
      });
    }

    clusters[moduleId] = {
      moduleId,
      categoryId: info.category,
      voxels
    };
  }

  return clusters;
}
