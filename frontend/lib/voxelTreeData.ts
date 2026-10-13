/**
 * Voxel Tree Geometry & Island Generator
 *
 * Ground, Grass & Voxel Geometry Integrity:
 * 1. Enlarged Grassy Island Base:
 *    - Radius expanded from 3.6 to 5.4, filling the 3D viewport balancedly.
 *    - Strict uniform grid spacing (step = 0.85) to eliminate floating-point gaps and seams.
 *    - Multi-layer substrate: bedrock (-2.4), earthy subsoil (-1.6), top soil (-0.85),
 *      and lush green turf surface with organic edge steps and relief.
 * 2. Detailed Grass & Vegetation Tufts:
 *    - Surface grass variations, elevated patches, and edge tufts.
 *    - Stepped natural island perimeter avoiding mechanical square borders.
 * 3. Seam & Gap Elimination:
 *    - Ground, trunk, and foliage geometry calibrated to seamless voxel grid alignments.
 *    - Voxel scale set to 1.002 to eliminate subpixel seam gaps and background bleeding.
 * 4. Intersection & Z-Fighting Prevention:
 *    - Avoid identical coplanar coordinates.
 *    - Non-intersecting lattice offsets for foliage clusters.
 * 5. Deterministic, zero-randomness across renders.
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
  grassHighlight: '#7cb342', // Vibrant grass patch accent
  soilTop: '#5d4037',        // Earthy upper soil rim
  soilBase: '#3e2723',       // Dark substrate bedrock / floating base
  soilDark: '#271915',       // Deep underplate shadow

  // Coordinated Natural Green Canopy Palette
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
  // Grid step = 0.85; grid bounds = -6 to +6 (span = ~10.2 units wide & deep)
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
      // Irregular perimeter to avoid mechanical circular or square silhouette
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

        // Slight surface height relief on interior patches
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

  // (d) Decorative Grass Tufts & Field Micro-blocks
  // Concentrated towards edges and open fields, leaving trunk base clear
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

  // Stepped, tapered trunk column (y = 0.2 to 5.2)
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
 * Seam & Z-Fighting Prevention:
 * - Lattice step = 0.52 avoids coplanar overlapping faces.
 * - Multi-scale cubes (macro volume blocks + micro edge fillers).
 */
export function getModuleFoliageClusters(): Record<string, ModuleVoxelCluster> {
  const clusters: Record<string, ModuleVoxelCluster> = {};

  const MODULE_SPECS: Record<
    string,
    { category: string; seed: number; offset: { x: number; y: number; z: number }; count: number }
  > = {
    system: { category: 'system', seed: 101, offset: { x: 0, y: 0, z: 0 }, count: 28 },
    zsh: { category: 'terminal', seed: 202, offset: { x: 0, y: 0, z: 0 }, count: 28 },
    git: { category: 'development', seed: 303, offset: { x: -0.7, y: -0.6, z: 0.5 }, count: 22 },
    node: { category: 'development', seed: 304, offset: { x: 0.7, y: 0.3, z: -0.5 }, count: 24 },
    python: { category: 'development', seed: 305, offset: { x: -0.5, y: 0.5, z: -0.5 }, count: 24 },
    java: { category: 'development', seed: 306, offset: { x: 0.6, y: -0.4, z: 0.7 }, count: 22 },
    docker: { category: 'infrastructure', seed: 401, offset: { x: -0.5, y: -0.2, z: -0.4 }, count: 24 },
    gcloud: { category: 'infrastructure', seed: 402, offset: { x: 0.5, y: 0.4, z: 0.5 }, count: 24 },
    vscode: { category: 'editors', seed: 501, offset: { x: 0.4, y: -0.3, z: -0.4 }, count: 24 },
    chrome: { category: 'editors', seed: 502, offset: { x: -0.5, y: 0.4, z: 0.5 }, count: 24 }
  };

  const foliageLattice = 0.52;

  for (const [moduleId, info] of Object.entries(MODULE_SPECS)) {
    const center = CATEGORY_CENTERS[info.category];
    const rand = seededRandom(info.seed);
    const voxels: VoxelCoord[] = [];

    const baseCenterX = center.x + info.offset.x;
    const baseCenterY = center.y + info.offset.y;
    const baseCenterZ = center.z + info.offset.z;

    const occupied = new Set<string>();

    for (let i = 0; i < info.count; i++) {
      const rawDx = (rand() - 0.5) * 2.5;
      const rawDy = (rand() - 0.5) * 2.2;
      const rawDz = (rand() - 0.5) * 2.5;

      // Snap to consistent lattice grid to prevent coplanar micro-intersections
      const gx = Math.round((rawDx * 1.3) / foliageLattice);
      const gy = Math.round((rawDy * 1.3) / foliageLattice);
      const gz = Math.round((rawDz * 1.3) / foliageLattice);

      const key = `${gx},${gy},${gz}`;
      if (occupied.has(key)) {
        continue;
      }
      occupied.add(key);

      const dx = gx * foliageLattice;
      const dy = gy * foliageLattice;
      const dz = gz * foliageLattice;

      const posX = Number((baseCenterX + dx).toFixed(3));
      const posY = Number((baseCenterY + dy).toFixed(3));
      const posZ = Number((baseCenterZ + dz).toFixed(3));

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

      let voxelSize: number;
      if (distFromCenter < 0.7) {
        voxelSize = 0.82 + rand() * 0.12;
      } else if (distFromCenter > 1.3) {
        voxelSize = 0.46 + rand() * 0.12;
      } else {
        voxelSize = 0.64 + rand() * 0.14;
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
