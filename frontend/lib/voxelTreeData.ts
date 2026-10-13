/**
 * Deterministic Voxel Tree Data & Geometry Generator
 * Defines:
 * 1. Base trunk, branches, and plinth voxel positions.
 * 2. Shared category foliage regions.
 * 3. Deterministic per-module voxel clusters mapped into the category's shared canopy region.
 * 4. Palette colors for wood, leaves, ground, and accents.
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

// Visual color palette inspired by minimalist developer aesthetic and tree.icqr.com
export const VOXEL_PALETTE = {
  trunkDark: '#3e2723',
  trunkMed: '#5d4037',
  trunkLight: '#795548',
  groundPlinth: '#1e293b',
  groundGrid: '#334155',
  groundAccent: '#0f172a',
  // Category foliage palettes (subtle tone variations per category)
  system: ['#10b981', '#059669', '#34d399', '#047857'], // Emerald
  terminal: ['#06b6d4', '#0891b2', '#22d3ee', '#0e7490'], // Cyan
  development: ['#6366f1', '#4f46e5', '#818cf8', '#4338ca'], // Indigo
  infrastructure: ['#f59e0b', '#d97706', '#fbbf24', '#b45309'], // Amber
  editors: ['#ec4899', '#db2777', '#f472b6', '#be185d'], // Pink/Rose
  leafHighlight: '#a7f3d0'
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
 * Generate the static trunk, branches, and ground pedestal
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

  // 1. Floating Ground Pedestal (7x7 rounded disc at y = -1.5)
  for (let x = -3; x <= 3; x++) {
    for (let z = -3; z <= 3; z++) {
      const dist = Math.sqrt(x * x + z * z);
      if (dist <= 3.4) {
        const isBorder = dist > 2.7;
        plinth.push({
          x: x * 0.9,
          y: -1.5,
          z: z * 0.9,
          color: isBorder ? VOXEL_PALETTE.groundAccent : VOXEL_PALETTE.groundPlinth,
          size: 0.88
        });
      }
    }
  }

  // Plinth accent stones / roots
  plinth.push({ x: 1.8, y: -0.9, z: 0.8, color: VOXEL_PALETTE.trunkDark, size: 0.7 });
  plinth.push({ x: -1.7, y: -0.9, z: -1.1, color: VOXEL_PALETTE.trunkDark, size: 0.65 });
  plinth.push({ x: 0.5, y: -0.9, z: -2.0, color: VOXEL_PALETTE.trunkDark, size: 0.65 });

  // 2. Trunk Column (y from -0.8 up to 5.5, with organic tapering & buttresses)
  // Roots / Base
  trunk.push({ x: 0, y: -0.8, z: 0, color: VOXEL_PALETTE.trunkDark, size: 1.4 });
  trunk.push({ x: 0.6, y: -0.8, z: 0.2, color: VOXEL_PALETTE.trunkDark, size: 0.9 });
  trunk.push({ x: -0.5, y: -0.8, z: -0.4, color: VOXEL_PALETTE.trunkDark, size: 0.9 });
  trunk.push({ x: -0.3, y: -0.8, z: 0.6, color: VOXEL_PALETTE.trunkDark, size: 0.8 });

  // Lower Trunk
  for (let y = 0; y <= 4; y += 0.8) {
    const isMid = y >= 1.6 && y <= 3.2;
    trunk.push({
      x: 0,
      y,
      z: 0,
      color: isMid ? VOXEL_PALETTE.trunkLight : VOXEL_PALETTE.trunkMed,
      size: 1.2 - y * 0.08
    });
    // Slight organic offset blocks
    if (y === 0.8) trunk.push({ x: 0.4, y, z: -0.2, color: VOXEL_PALETTE.trunkMed, size: 0.75 });
    if (y === 1.6) trunk.push({ x: -0.3, y, z: 0.3, color: VOXEL_PALETTE.trunkMed, size: 0.7 });
    if (y === 2.4) trunk.push({ x: 0.2, y, z: 0.3, color: VOXEL_PALETTE.trunkLight, size: 0.65 });
    if (y === 3.2) trunk.push({ x: -0.2, y, z: -0.2, color: VOXEL_PALETTE.trunkLight, size: 0.65 });
  }

  // Upper Trunk Fork
  trunk.push({ x: 0, y: 4.8, z: 0, color: VOXEL_PALETTE.trunkMed, size: 0.9 });
  trunk.push({ x: 0, y: 5.6, z: 0, color: VOXEL_PALETTE.trunkLight, size: 0.8 });

  // 3. Category Branches (Leading to the 5 designated spatial canopy regions)
  // (a) System: Lower Base Canopy (front-center-left, y ~ 2.8 - 4.0)
  branches.system.push(
    { x: -0.8, y: 2.8, z: 0.6, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -1.5, y: 3.3, z: 1.2, color: VOXEL_PALETTE.trunkMed, size: 0.6 },
    { x: -2.1, y: 3.7, z: 1.7, color: VOXEL_PALETTE.trunkLight, size: 0.55 },
    { x: -1.7, y: 3.9, z: 2.2, color: VOXEL_PALETTE.trunkLight, size: 0.5 }
  );

  // (b) Terminal: Lower-Right / Back-Right Branch (y ~ 3.2 - 4.5)
  branches.terminal.push(
    { x: 0.7, y: 3.0, z: -0.7, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: 1.4, y: 3.5, z: -1.3, color: VOXEL_PALETTE.trunkMed, size: 0.6 },
    { x: 2.1, y: 4.0, z: -1.8, color: VOXEL_PALETTE.trunkLight, size: 0.55 },
    { x: 2.6, y: 4.3, z: -1.4, color: VOXEL_PALETTE.trunkLight, size: 0.5 }
  );

  // (c) Development Runtimes: Top Crown Central Branch (y ~ 5.6 - 7.5)
  branches.development.push(
    { x: 0.1, y: 6.2, z: 0.1, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -0.3, y: 6.8, z: -0.2, color: VOXEL_PALETTE.trunkMed, size: 0.6 },
    { x: 0.4, y: 7.3, z: 0.3, color: VOXEL_PALETTE.trunkLight, size: 0.55 },
    { x: 0.0, y: 7.8, z: -0.1, color: VOXEL_PALETTE.trunkLight, size: 0.5 }
  );

  // (d) Infrastructure / Cloud: Mid-Right Branch (x > 0, z > 0, y ~ 4.2 - 5.8)
  branches.infrastructure.push(
    { x: 0.8, y: 4.2, z: 0.8, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: 1.6, y: 4.8, z: 1.4, color: VOXEL_PALETTE.trunkMed, size: 0.6 },
    { x: 2.3, y: 5.3, z: 1.8, color: VOXEL_PALETTE.trunkLight, size: 0.55 },
    { x: 2.9, y: 5.7, z: 1.4, color: VOXEL_PALETTE.trunkLight, size: 0.5 }
  );

  // (e) Editors & Apps: Upper-Left Branch (x < 0, z < 0, y ~ 4.4 - 6.2)
  branches.editors.push(
    { x: -0.8, y: 4.4, z: -0.7, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -1.6, y: 5.0, z: -1.3, color: VOXEL_PALETTE.trunkMed, size: 0.6 },
    { x: -2.3, y: 5.6, z: -1.7, color: VOXEL_PALETTE.trunkLight, size: 0.55 },
    { x: -2.7, y: 6.0, z: -1.2, color: VOXEL_PALETTE.trunkLight, size: 0.5 }
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
 * Every module has a deterministic seed and generates a cohesive cluster
 * nestled inside its category's shared canopy region.
 */
export function getModuleFoliageClusters(): Record<string, ModuleVoxelCluster> {
  const clusters: Record<string, ModuleVoxelCluster> = {};

  // Module configuration mapping
  const MODULE_SEEDS: Record<
    string,
    { category: string; seed: number; offset: { x: number; y: number; z: number }; count: number }
  > = {
    // Category: System (1 module: system)
    system: { category: 'system', seed: 101, offset: { x: 0, y: 0, z: 0 }, count: 18 },

    // Category: Terminal (1 module: zsh)
    zsh: { category: 'terminal', seed: 202, offset: { x: 0, y: 0, z: 0 }, count: 18 },

    // Category: Development (4 modules: git, node, python, java)
    // All 4 nest harmoniously into the towering top crown canopy
    git: { category: 'development', seed: 303, offset: { x: -0.6, y: -0.6, z: 0.5 }, count: 14 },
    node: { category: 'development', seed: 304, offset: { x: 0.6, y: 0.2, z: -0.5 }, count: 15 },
    python: { category: 'development', seed: 305, offset: { x: -0.5, y: 0.5, z: -0.4 }, count: 15 },
    java: { category: 'development', seed: 306, offset: { x: 0.5, y: -0.4, z: 0.6 }, count: 14 },

    // Category: Infrastructure (2 modules: docker, gcloud)
    docker: { category: 'infrastructure', seed: 401, offset: { x: -0.4, y: -0.2, z: -0.3 }, count: 16 },
    gcloud: { category: 'infrastructure', seed: 402, offset: { x: 0.4, y: 0.3, z: 0.4 }, count: 16 },

    // Category: Editors (2 modules: vscode, chrome)
    vscode: { category: 'editors', seed: 501, offset: { x: 0.3, y: -0.2, z: -0.3 }, count: 16 },
    chrome: { category: 'editors', seed: 502, offset: { x: -0.4, y: 0.3, z: 0.4 }, count: 16 }
  };

  for (const [moduleId, info] of Object.entries(MODULE_SEEDS)) {
    const center = CATEGORY_CENTERS[info.category];
    const rand = seededRandom(info.seed);
    const voxels: VoxelCoord[] = [];
    const categoryColors = VOXEL_PALETTE[info.category as keyof typeof VOXEL_PALETTE];
    const colorPalette = Array.isArray(categoryColors) ? categoryColors : VOXEL_PALETTE.system;

    const baseCenterX = center.x + info.offset.x;
    const baseCenterY = center.y + info.offset.y;
    const baseCenterZ = center.z + info.offset.z;

    // Generate tightly clustered voxels on a semi-regular grid around the center
    const occupied = new Set<string>();

    for (let i = 0; i < info.count; i++) {
      // Deterministic offset within radius ~ 1.4
      const dx = Math.round((rand() - 0.5) * 2.8 * 1.5) * 0.55;
      const dy = Math.round((rand() - 0.5) * 2.2 * 1.5) * 0.55;
      const dz = Math.round((rand() - 0.5) * 2.8 * 1.5) * 0.55;

      const key = `${Math.round(dx * 10)},${Math.round(dy * 10)},${Math.round(dz * 10)}`;
      if (occupied.has(key)) {
        continue;
      }
      occupied.add(key);

      const colorIndex = Math.floor(rand() * colorPalette.length);
      const voxelColor = colorPalette[colorIndex];
      const voxelSize = 0.58 + rand() * 0.14;

      voxels.push({
        x: Number((baseCenterX + dx).toFixed(3)),
        y: Number((baseCenterY + dy).toFixed(3)),
        z: Number((baseCenterZ + dz).toFixed(3)),
        color: voxelColor,
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
