/**
 * Refined Deterministic Voxel Tree Data & Geometry Generator
 *
 * Visual Enhancements:
 * 1. Grassy Island: Rich green multi-tone turf, organic soil perimeter, and corner grass tufts.
 * 2. Natural Tapered Trunk: Wide buttressed root flare, layered organic taper, and warm wood palette.
 * 3. Connected Branch Hierarchy: Primary boughs, secondary fork arms, and terminal twigs with no floating cubes.
 * 4. Coordinated Natural Green Canopy:
 *    - Light lime/sunlit green for outer & upper canopy
 *    - Fresh leaf green for primary body
 *    - Medium emerald for depth
 *    - Dark forest green for shaded undercanopy
 * 5. Multi-Scale Layered Foliage:
 *    - Macro volume cubes (0.85 - 1.05)
 *    - Medium filler cubes (0.60 - 0.75)
 *    - Micro edge cubes (0.40 - 0.55) to soften silhouettes
 * 6. Deterministic, spatially coherent, zero-randomness across renders.
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

// Coordinated Natural Palettes
export const VOXEL_PALETTE = {
  // Wood / Bark Palette (warm natural timber)
  trunkHighlight: '#8d6e63', // Sunlit bark edges
  trunkMed: '#6d4c41',       // Primary warm brown trunk
  trunkDark: '#4e342e',      // Crevices, roots, branch forks
  trunkShadow: '#3e2723',    // Underside shading

  // Island / Grassy Base Palette
  grassLight: '#689f38',     // Sunlit grassy upper surface
  grassMed: '#558b2f',       // Primary lush turf
  grassDark: '#33691e',      // Shaded turf / edge accents
  soilTop: '#5d4037',        // Earthy upper soil rim
  soilBase: '#3e2723',       // Dark substrate bedrock / floating base
  soilDark: '#271915',       // Deep underplate shadow

  // Coordinated Natural Green Canopy Palette
  // Spatially layered from sunlit highlights to deep shaded interior
  leafSunlit: '#84cc16',     // Lime / sunlit outer tip (lime-500)
  leafBright: '#4ade80',     // Fresh vibrant leaf (green-400)
  leafPrimary: '#22c55e',    // Primary canopy body (green-500)
  leafMid: '#16a34a',        // Intermediate emerald depth (green-600)
  leafDeep: '#15803d',       // Forest green undercanopy (green-700)
  leafShadow: '#14532d'      // Deep inner shade (green-900)
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
 * Generate the static trunk, branches, and grassy island base
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
  // 1. Grassy Floating Island Base
  // -------------------------------------------------------------
  // Multi-tier earthy pedestal with lush grass upper surface and tufts
  const islandRadius = 3.6;

  // Subterranean soil layers (y = -2.1 to -1.5)
  for (let x = -4; x <= 4; x++) {
    for (let z = -4; z <= 4; z++) {
      const dist = Math.sqrt(x * x + z * z);
      // Bottom bedrock disc (tapered floating island underside)
      if (dist <= 2.8) {
        plinth.push({
          x: x * 0.85,
          y: -2.0,
          z: z * 0.85,
          color: (x + z) % 2 === 0 ? VOXEL_PALETTE.soilDark : VOXEL_PALETTE.soilBase,
          size: 0.84
        });
      }
      // Mid soil layer
      if (dist <= 3.4) {
        plinth.push({
          x: x * 0.88,
          y: -1.4,
          z: z * 0.88,
          color: dist > 2.8 ? VOXEL_PALETTE.soilBase : VOXEL_PALETTE.soilTop,
          size: 0.86
        });
      }
      // Top turf grass surface (y = -0.8)
      if (dist <= islandRadius) {
        const isBorder = dist > 2.9;
        const grassShade =
          isBorder
            ? VOXEL_PALETTE.grassDark
            : (x + z) % 3 === 0
            ? VOXEL_PALETTE.grassLight
            : VOXEL_PALETTE.grassMed;

        plinth.push({
          x: x * 0.9,
          y: -0.8,
          z: z * 0.9,
          color: grassShade,
          size: 0.88
        });
      }
    }
  }

  // Small perimeter grass tufts and earthy pebbles to break mechanical boundaries
  const grassTufts: Array<{ x: number; z: number; color: string; size: number }> = [
    { x: -2.7, z: -1.2, color: VOXEL_PALETTE.grassLight, size: 0.42 },
    { x: -2.5, z: 1.6, color: VOXEL_PALETTE.grassLight, size: 0.45 },
    { x: 2.4, z: -1.8, color: VOXEL_PALETTE.grassMed, size: 0.44 },
    { x: 2.6, z: 1.3, color: VOXEL_PALETTE.grassLight, size: 0.42 },
    { x: 0.8, z: -2.8, color: VOXEL_PALETTE.grassMed, size: 0.45 },
    { x: -1.2, z: 2.7, color: VOXEL_PALETTE.grassLight, size: 0.4 },
    { x: 1.9, z: 2.2, color: VOXEL_PALETTE.grassDark, size: 0.42 },
    { x: -2.0, z: -2.3, color: VOXEL_PALETTE.grassDark, size: 0.38 }
  ];

  grassTufts.forEach((t) => {
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
  // Buttressed root flare spreading into the grassy base
  const roots: VoxelCoord[] = [
    { x: 0.0, y: -0.4, z: 0.0, color: VOXEL_PALETTE.trunkDark, size: 1.55 },
    { x: 0.8, y: -0.5, z: 0.3, color: VOXEL_PALETTE.trunkMed, size: 0.95 },
    { x: -0.8, y: -0.5, z: -0.4, color: VOXEL_PALETTE.trunkDark, size: 0.95 },
    { x: -0.4, y: -0.5, z: 0.8, color: VOXEL_PALETTE.trunkMed, size: 0.9 },
    { x: 0.3, y: -0.5, z: -0.8, color: VOXEL_PALETTE.trunkDark, size: 0.9 },
    // Extended root flairs meeting turf
    { x: 1.4, y: -0.65, z: 0.5, color: VOXEL_PALETTE.trunkDark, size: 0.65 },
    { x: -1.3, y: -0.65, z: -0.8, color: VOXEL_PALETTE.trunkDark, size: 0.65 },
    { x: -0.7, y: -0.65, z: 1.3, color: VOXEL_PALETTE.trunkDark, size: 0.6 }
  ];
  trunk.push(...roots);

  // Stepped, tapered trunk column (y = 0.2 to 5.4)
  // Layer y = 0.2
  trunk.push(
    { x: 0.0, y: 0.2, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.35 },
    { x: 0.45, y: 0.2, z: -0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.75 },
    { x: -0.35, y: 0.2, z: 0.35, color: VOXEL_PALETTE.trunkDark, size: 0.75 }
  );

  // Layer y = 0.9
  trunk.push(
    { x: 0.0, y: 0.9, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.25 },
    { x: -0.2, y: 0.9, z: -0.35, color: VOXEL_PALETTE.trunkDark, size: 0.7 },
    { x: 0.35, y: 0.9, z: 0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.7 }
  );

  // Layer y = 1.6
  trunk.push(
    { x: -0.05, y: 1.6, z: 0.05, color: VOXEL_PALETTE.trunkHighlight, size: 1.15 },
    { x: 0.3, y: 1.6, z: -0.2, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -0.3, y: 1.6, z: 0.2, color: VOXEL_PALETTE.trunkDark, size: 0.65 }
  );

  // Layer y = 2.3
  trunk.push(
    { x: 0.0, y: 2.3, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.05 },
    { x: 0.25, y: 2.3, z: 0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.6 },
    { x: -0.25, y: 2.3, z: -0.25, color: VOXEL_PALETTE.trunkDark, size: 0.6 }
  );

  // Layer y = 3.0 (Primary bough junction area)
  trunk.push(
    { x: 0.05, y: 3.0, z: -0.05, color: VOXEL_PALETTE.trunkMed, size: 0.98 },
    { x: -0.3, y: 3.0, z: 0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.58 }
  );

  // Layer y = 3.7
  trunk.push(
    { x: 0.0, y: 3.7, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 0.92 },
    { x: 0.2, y: 3.7, z: -0.2, color: VOXEL_PALETTE.trunkDark, size: 0.55 }
  );

  // Upper trunk fork (y = 4.4 to 5.2)
  trunk.push(
    { x: 0.0, y: 4.4, z: 0.05, color: VOXEL_PALETTE.trunkMed, size: 0.85 },
    { x: -0.15, y: 4.4, z: -0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: 0.0, y: 5.1, z: 0.0, color: VOXEL_PALETTE.trunkHighlight, size: 0.8 }
  );

  // -------------------------------------------------------------
  // 3. Hierarchical Connected Branches
  // -------------------------------------------------------------
  // Primary boughs, secondary fork arms, and terminal twigs leading smoothly
  // to the 5 spatial category canopies with no floating disjoint cubes.

  // (a) Category: System (Front-Left Canopy, y ~ 2.6 to 4.2)
  branches.system.push(
    // Primary bough collar (connected to trunk at y = 2.6)
    { x: -0.5, y: 2.6, z: 0.35, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: -1.0, y: 2.9, z: 0.75, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -1.5, y: 3.3, z: 1.2, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    // Secondary fork 1
    { x: -1.9, y: 3.6, z: 1.6, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: -2.3, y: 3.8, z: 1.9, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    // Secondary fork 2 (side arm)
    { x: -1.6, y: 3.7, z: 0.8, color: VOXEL_PALETTE.trunkMed, size: 0.48 },
    { x: -2.0, y: 4.0, z: 0.7, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (b) Category: Terminal (Back-Right Canopy, y ~ 3.0 to 4.6)
  branches.terminal.push(
    // Primary bough collar (connected to trunk at y = 3.0)
    { x: 0.45, y: 3.0, z: -0.45, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: 1.0, y: 3.4, z: -0.9, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: 1.6, y: 3.8, z: -1.35, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    // Secondary fork 1
    { x: 2.1, y: 4.1, z: -1.7, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: 2.5, y: 4.3, z: -1.5, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    // Secondary fork 2 (side arm)
    { x: 1.8, y: 4.2, z: -0.9, color: VOXEL_PALETTE.trunkMed, size: 0.48 },
    { x: 2.2, y: 4.5, z: -0.8, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (c) Category: Development Runtimes (Towering Crown Canopy, y ~ 5.2 to 7.8)
  branches.development.push(
    // Central leader trunk extension
    { x: 0.05, y: 5.8, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 0.72 },
    { x: -0.1, y: 6.4, z: -0.1, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    // Crown primary forks
    { x: 0.25, y: 7.0, z: 0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.58 },
    { x: -0.3, y: 7.1, z: -0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.55 },
    // Terminal upper twigs
    { x: 0.4, y: 7.6, z: 0.35, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: -0.45, y: 7.7, z: -0.4, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    { x: 0.0, y: 8.0, z: -0.1, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (d) Category: Infrastructure / Cloud (Mid-Right Canopy, y ~ 4.0 to 6.0)
  branches.infrastructure.push(
    // Primary bough collar (connected to trunk at y = 4.0)
    { x: 0.55, y: 4.0, z: 0.45, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: 1.2, y: 4.5, z: 0.95, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: 1.8, y: 5.0, z: 1.4, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    // Secondary fork 1
    { x: 2.3, y: 5.4, z: 1.7, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: 2.7, y: 5.7, z: 1.5, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    // Secondary fork 2
    { x: 2.1, y: 5.5, z: 0.9, color: VOXEL_PALETTE.trunkMed, size: 0.48 },
    { x: 2.6, y: 5.9, z: 0.8, color: VOXEL_PALETTE.trunkHighlight, size: 0.42 }
  );

  // (e) Category: Editors & Apps (Upper-Left Canopy, y ~ 4.2 to 6.4)
  branches.editors.push(
    // Primary bough collar (connected to trunk at y = 4.2)
    { x: -0.5, y: 4.2, z: -0.45, color: VOXEL_PALETTE.trunkDark, size: 0.72 },
    { x: -1.1, y: 4.7, z: -0.95, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -1.7, y: 5.2, z: -1.4, color: VOXEL_PALETTE.trunkMed, size: 0.58 },
    // Secondary fork 1
    { x: -2.2, y: 5.6, z: -1.75, color: VOXEL_PALETTE.trunkHighlight, size: 0.52 },
    { x: -2.6, y: 5.9, z: -1.5, color: VOXEL_PALETTE.trunkHighlight, size: 0.45 },
    // Secondary fork 2
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
 * Visual improvements:
 * - Natural green palette with spatially coherent depth:
 *   Upper/outer faces receive sunlit & bright greens, central body receives primary/mid green,
 *   and inner undercanopy receives deep forest green.
 * - Multi-scale cubes (macro volume blocks + micro edge fillers).
 * - Tightly clustered, lush organic volume without excessive density obscuring the trunk.
 */
export function getModuleFoliageClusters(): Record<string, ModuleVoxelCluster> {
  const clusters: Record<string, ModuleVoxelCluster> = {};

  // Module configuration mapping
  const MODULE_SPECS: Record<
    string,
    { category: string; seed: number; offset: { x: number; y: number; z: number }; count: number }
  > = {
    // Category: System (1 module: system) -> lush base canopy
    system: { category: 'system', seed: 101, offset: { x: 0, y: 0, z: 0 }, count: 28 },

    // Category: Terminal (1 module: zsh) -> lower-right branch canopy
    zsh: { category: 'terminal', seed: 202, offset: { x: 0, y: 0, z: 0 }, count: 28 },

    // Category: Development (4 modules: git, node, python, java) -> overarching top crown
    git: { category: 'development', seed: 303, offset: { x: -0.7, y: -0.6, z: 0.5 }, count: 22 },
    node: { category: 'development', seed: 304, offset: { x: 0.7, y: 0.3, z: -0.5 }, count: 24 },
    python: { category: 'development', seed: 305, offset: { x: -0.5, y: 0.5, z: -0.5 }, count: 24 },
    java: { category: 'development', seed: 306, offset: { x: 0.6, y: -0.4, z: 0.7 }, count: 22 },

    // Category: Infrastructure (2 modules: docker, gcloud) -> mid-right canopy
    docker: { category: 'infrastructure', seed: 401, offset: { x: -0.5, y: -0.2, z: -0.4 }, count: 24 },
    gcloud: { category: 'infrastructure', seed: 402, offset: { x: 0.5, y: 0.4, z: 0.5 }, count: 24 },

    // Category: Editors (2 modules: vscode, chrome) -> upper-left canopy
    vscode: { category: 'editors', seed: 501, offset: { x: 0.4, y: -0.3, z: -0.4 }, count: 24 },
    chrome: { category: 'editors', seed: 502, offset: { x: -0.5, y: 0.4, z: 0.5 }, count: 24 }
  };

  for (const [moduleId, info] of Object.entries(MODULE_SPECS)) {
    const center = CATEGORY_CENTERS[info.category];
    const rand = seededRandom(info.seed);
    const voxels: VoxelCoord[] = [];

    const baseCenterX = center.x + info.offset.x;
    const baseCenterY = center.y + info.offset.y;
    const baseCenterZ = center.z + info.offset.z;

    const occupied = new Set<string>();

    for (let i = 0; i < info.count; i++) {
      // Deterministic spread around cluster center
      const rawDx = (rand() - 0.5) * 2.8;
      const rawDy = (rand() - 0.5) * 2.4;
      const rawDz = (rand() - 0.5) * 2.8;

      const dx = Math.round(rawDx * 2.2) * 0.45;
      const dy = Math.round(rawDy * 2.2) * 0.45;
      const dz = Math.round(rawDz * 2.2) * 0.45;

      const key = `${Math.round(dx * 10)},${Math.round(dy * 10)},${Math.round(dz * 10)}`;
      if (occupied.has(key)) {
        continue;
      }
      occupied.add(key);

      const posX = Number((baseCenterX + dx).toFixed(3));
      const posY = Number((baseCenterY + dy).toFixed(3));
      const posZ = Number((baseCenterZ + dz).toFixed(3));

      // Spatially coherent natural green color assignment:
      // Higher y & outer edges receive sunlit/bright green,
      // mid y receives primary/mid green,
      // lower y & inner core receives deep/shadow green.
      const distFromCenter = Math.sqrt(dx * dx + dy * dy + dz * dz);
      let leafColor: string;

      if (dy > 0.4 && (posX + posZ > 0 || rand() > 0.4)) {
        leafColor = rand() > 0.5 ? VOXEL_PALETTE.leafSunlit : VOXEL_PALETTE.leafBright;
      } else if (dy < -0.3 || (distFromCenter < 0.6 && dy <= 0)) {
        leafColor = rand() > 0.4 ? VOXEL_PALETTE.leafDeep : VOXEL_PALETTE.leafShadow;
      } else if (distFromCenter > 1.2) {
        leafColor = rand() > 0.5 ? VOXEL_PALETTE.leafBright : VOXEL_PALETTE.leafPrimary;
      } else {
        leafColor = rand() > 0.5 ? VOXEL_PALETTE.leafPrimary : VOXEL_PALETTE.leafMid;
      }

      // Multi-scale voxel sizing:
      // Macro core blocks (0.82 - 0.95), medium body (0.65 - 0.78), micro edges (0.45 - 0.58)
      let voxelSize: number;
      if (distFromCenter < 0.7) {
        voxelSize = 0.82 + rand() * 0.14;
      } else if (distFromCenter > 1.4) {
        voxelSize = 0.45 + rand() * 0.16;
      } else {
        voxelSize = 0.64 + rand() * 0.16;
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
