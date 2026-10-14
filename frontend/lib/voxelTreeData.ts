/**
 * Voxel Tree Geometry & Island Generator
 *
 * Visually calibrated to match the stylized game-art voxel reference:
 * 1. Cohesive, Rounded Canopy Dome:
 *    - Continuous, interlocking cubic foliage clusters that form a full, rounded canopy.
 *    - Multi-scale cube hierarchy:
 *      * Macro core blocks (0.85 - 1.05) establishing solid, opaque foliage bodies.
 *      * Medium boundary blocks (0.62 - 0.78) shaping organic cluster contours.
 *      * Micro leaf accents (0.44 - 0.54) providing refined stylized silhouette variation.
 *    - Anchored directly to category branch geometry (distance <= 2.2 units),
 *      completely eliminating detached or floating outlier cubes.
 * 2. Natural Multi-Tone Green Palette:
 *    - Sunlit upper / outer surfaces: #A6D95A (sunlit lime) & #95CD41 (fresh highlight).
 *    - Main canopy volume: #78BD43 (primary leaf green) & #438D35 (mid-depth green).
 *    - Underside & interior core: #245C2C (deep forest green) & #1E4A25 (interior shadow).
 * 3. Floating Square Grass Island:
 *    - Isometric square lawn (11x11, span >= 8.2 units) with continuous vibrant green turf.
 *    - Inverted stepped bedrock / subsoil underside tapering down to a single keel point.
 *    - Enriched with micro-vegetation: tiny grass tufts and miniature colorful flower accents.
 * 4. Sturdy Warm-Timber Trunk:
 *    - Buttressed root base spreading onto the turf, tapered upward progression.
 *    - Visible branches ascending and disappearing cleanly into the foliage canopy.
 * 5. Strict determinism: zero z-fighting, zero coplanar duplicate coordinates.
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
  leafBright: '#95CD41',     // Fresh sunny highlights

  // Stylized Flower Accents
  flowerCoral: '#ff7043',    // Stylized flower accent coral
  flowerYellow: '#ffd54f',   // Stylized flower accent yellow
  flowerWhite: '#f5f5f5',    // Stylized flower accent white
  flowerRed: '#ef5350'       // Stylized flower accent red
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
 * Generate the static trunk, branches, and floating square grass island
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
  // 1. Floating Square Grass Island with Tapered Bedrock Underside
  // -------------------------------------------------------------
  const step = 0.82; // 11 grid blocks -> span = 10 * 0.82 = 8.20 units (>= 8.0)

  // (a) Top turf lawn surface (y = -0.80): 11x11 continuous lush green lawn
  for (let gx = -5; gx <= 5; gx++) {
    for (let gz = -5; gz <= 5; gz++) {
      const worldX = Number((gx * step).toFixed(3));
      const worldZ = Number((gz * step).toFixed(3));

      const isPerimeter = Math.abs(gx) === 5 || Math.abs(gz) === 5;
      const isSunlitSide = gx + gz <= -2 || (gx < 0 && gz <= 0);

      let turfColor: string;
      if (isPerimeter) {
        turfColor = (gx + gz) % 2 === 0 ? VOXEL_PALETTE.grassDark : VOXEL_PALETTE.grassMed;
      } else if (isSunlitSide) {
        turfColor = (gx * 3 + gz * 7) % 4 === 0 ? VOXEL_PALETTE.grassHighlight : VOXEL_PALETTE.grassLight;
      } else if ((gx + gz) % 2 === 0) {
        turfColor = VOXEL_PALETTE.grassLight;
      } else {
        turfColor = VOXEL_PALETTE.grassMed;
      }

      plinth.push({
        x: worldX,
        y: -0.8,
        z: worldZ,
        color: turfColor,
        size: Number((step * 1.002).toFixed(3))
      });
    }
  }

  // (b) Subsoil earth rim layer (y = -1.50): 9x9 stepped earth collar
  for (let gx = -4; gx <= 4; gx++) {
    for (let gz = -4; gz <= 4; gz++) {
      const worldX = Number((gx * step).toFixed(3));
      const worldZ = Number((gz * step).toFixed(3));
      const isRim = Math.abs(gx) === 4 || Math.abs(gz) === 4;

      plinth.push({
        x: worldX,
        y: -1.5,
        z: worldZ,
        color: isRim ? VOXEL_PALETTE.soilTop : VOXEL_PALETTE.soilBase,
        size: Number((step * 1.002).toFixed(3))
      });
    }
  }

  // (c) Bedrock tier 1 layer (y = -2.20): 7x7 tapered bedrock
  for (let gx = -3; gx <= 3; gx++) {
    for (let gz = -3; gz <= 3; gz++) {
      const worldX = Number((gx * step).toFixed(3));
      const worldZ = Number((gz * step).toFixed(3));
      const isRim = Math.abs(gx) === 3 || Math.abs(gz) === 3;

      plinth.push({
        x: worldX,
        y: -2.2,
        z: worldZ,
        color: isRim ? VOXEL_PALETTE.soilBase : VOXEL_PALETTE.soilDark,
        size: Number((step * 1.002).toFixed(3))
      });
    }
  }

  // (d) Bedrock tier 2 layer (y = -2.90): 5x5 deep underside
  for (let gx = -2; gx <= 2; gx++) {
    for (let gz = -2; gz <= 2; gz++) {
      const worldX = Number((gx * step).toFixed(3));
      const worldZ = Number((gz * step).toFixed(3));

      plinth.push({
        x: worldX,
        y: -2.9,
        z: worldZ,
        color: VOXEL_PALETTE.soilDark,
        size: Number((step * 1.002).toFixed(3))
      });
    }
  }

  // (e) Bedrock tier 3 spire (y = -3.55): 3x3 underside tip
  for (let gx = -1; gx <= 1; gx++) {
    for (let gz = -1; gz <= 1; gz++) {
      const worldX = Number((gx * step).toFixed(3));
      const worldZ = Number((gz * step).toFixed(3));

      plinth.push({
        x: worldX,
        y: -3.55,
        z: worldZ,
        color: VOXEL_PALETTE.soilDark,
        size: Number((step * 1.002).toFixed(3))
      });
    }
  }

  // (f) Deepest keel block (y = -4.10): single center point
  plinth.push({
    x: 0.0,
    y: -4.1,
    z: 0.0,
    color: VOXEL_PALETTE.soilDark,
    size: Number((step * 1.002).toFixed(3))
  });

  // (g) Decorative Grass Tufts & Field Micro-accents on Turf (y = -0.34)
  const grassTufts: Array<{ x: number; z: number; color: string; size: number }> = [
    { x: -2.8, z: 1.8, color: VOXEL_PALETTE.grassHighlight, size: 0.44 },
    { x: 2.8, z: -1.8, color: VOXEL_PALETTE.grassLight, size: 0.44 },
    { x: -3.2, z: -2.6, color: VOXEL_PALETTE.grassHighlight, size: 0.42 },
    { x: 3.2, z: 2.6, color: VOXEL_PALETTE.grassMed, size: 0.42 },
    { x: 1.6, z: 3.2, color: VOXEL_PALETTE.grassLight, size: 0.45 },
    { x: -1.6, z: -3.2, color: VOXEL_PALETTE.grassLight, size: 0.45 },
    { x: 3.5, z: 0.5, color: VOXEL_PALETTE.grassMed, size: 0.42 },
    { x: -3.5, z: -0.5, color: VOXEL_PALETTE.grassHighlight, size: 0.42 },
    { x: 0.8, z: -3.6, color: VOXEL_PALETTE.grassDark, size: 0.40 },
    { x: -0.8, z: 3.6, color: VOXEL_PALETTE.grassLight, size: 0.40 },
    { x: 2.2, z: -3.0, color: VOXEL_PALETTE.grassLight, size: 0.42 },
    { x: -2.2, z: 3.0, color: VOXEL_PALETTE.grassMed, size: 0.42 }
  ];

  grassTufts.forEach((t) => {
    plinth.push({
      x: t.x,
      y: -0.34,
      z: t.z,
      color: t.color,
      size: t.size
    });
  });

  // (h) Miniature Flower Accents on Turf (y = -0.36)
  const flowerAccents: Array<{ x: number; z: number; color: string; size: number }> = [
    { x: -2.5, z: -1.8, color: VOXEL_PALETTE.flowerCoral, size: 0.32 },
    { x: 2.5, z: 1.8, color: VOXEL_PALETTE.flowerCoral, size: 0.32 },
    { x: -1.8, z: 2.8, color: VOXEL_PALETTE.flowerYellow, size: 0.30 },
    { x: 1.8, z: -2.8, color: VOXEL_PALETTE.flowerYellow, size: 0.30 },
    { x: 3.2, z: -1.2, color: VOXEL_PALETTE.flowerWhite, size: 0.28 },
    { x: -3.2, z: 1.2, color: VOXEL_PALETTE.flowerWhite, size: 0.28 },
    { x: -2.8, z: 3.2, color: VOXEL_PALETTE.flowerCoral, size: 0.30 },
    { x: 2.8, z: -3.2, color: VOXEL_PALETTE.flowerYellow, size: 0.30 }
  ];

  flowerAccents.forEach((f) => {
    plinth.push({
      x: f.x,
      y: -0.36,
      z: f.z,
      color: f.color,
      size: f.size
    });
  });

  // -------------------------------------------------------------
  // 2. Sturdy Tapered Trunk with Flared Buttress Roots
  // -------------------------------------------------------------
  const roots: VoxelCoord[] = [
    { x: 0.0, y: -0.4, z: 0.0, color: VOXEL_PALETTE.trunkDark, size: 1.6 },
    { x: 0.8, y: -0.5, z: 0.3, color: VOXEL_PALETTE.trunkMed, size: 0.95 },
    { x: -0.8, y: -0.5, z: -0.4, color: VOXEL_PALETTE.trunkDark, size: 0.95 },
    { x: -0.4, y: -0.5, z: 0.8, color: VOXEL_PALETTE.trunkMed, size: 0.9 },
    { x: 0.3, y: -0.5, z: -0.8, color: VOXEL_PALETTE.trunkDark, size: 0.9 },
    { x: 1.4, y: -0.65, z: 0.5, color: VOXEL_PALETTE.trunkDark, size: 0.65 },
    { x: -1.3, y: -0.65, z: -0.8, color: VOXEL_PALETTE.trunkDark, size: 0.65 },
    { x: -0.7, y: -0.65, z: 1.3, color: VOXEL_PALETTE.trunkDark, size: 0.6 },
    { x: 0.6, y: -0.65, z: -1.3, color: VOXEL_PALETTE.trunkDark, size: 0.6 }
  ];
  trunk.push(...roots);

  // Stepped, tapered trunk column (y = 0.2 to 5.1)
  trunk.push(
    { x: 0.0, y: 0.2, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.4 },
    { x: 0.45, y: 0.2, z: -0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.75 },
    { x: -0.35, y: 0.2, z: 0.35, color: VOXEL_PALETTE.trunkDark, size: 0.75 }
  );

  trunk.push(
    { x: 0.0, y: 0.9, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.3 },
    { x: -0.2, y: 0.9, z: -0.35, color: VOXEL_PALETTE.trunkDark, size: 0.7 },
    { x: 0.35, y: 0.9, z: 0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.7 }
  );

  trunk.push(
    { x: -0.05, y: 1.6, z: 0.05, color: VOXEL_PALETTE.trunkHighlight, size: 1.2 },
    { x: 0.3, y: 1.6, z: -0.2, color: VOXEL_PALETTE.trunkMed, size: 0.65 },
    { x: -0.3, y: 1.6, z: 0.2, color: VOXEL_PALETTE.trunkDark, size: 0.65 }
  );

  trunk.push(
    { x: 0.0, y: 2.3, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 1.1 },
    { x: 0.25, y: 2.3, z: 0.25, color: VOXEL_PALETTE.trunkHighlight, size: 0.6 },
    { x: -0.25, y: 2.3, z: -0.25, color: VOXEL_PALETTE.trunkDark, size: 0.6 }
  );

  trunk.push(
    { x: 0.05, y: 3.0, z: -0.05, color: VOXEL_PALETTE.trunkMed, size: 1.0 },
    { x: -0.3, y: 3.0, z: 0.2, color: VOXEL_PALETTE.trunkHighlight, size: 0.58 }
  );

  trunk.push(
    { x: 0.0, y: 3.7, z: 0.0, color: VOXEL_PALETTE.trunkMed, size: 0.92 },
    { x: 0.2, y: 3.7, z: -0.2, color: VOXEL_PALETTE.trunkDark, size: 0.55 }
  );

  trunk.push(
    { x: 0.0, y: 4.4, z: 0.05, color: VOXEL_PALETTE.trunkMed, size: 0.86 },
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

  // (c) Category: Development Runtimes (Towering Crown Canopy, y ~ 5.5 to 8.0)
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

  // (e) Category: Editors & Apps (Upper-Left Canopy, y ~ 4.2 to 6.2)
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
 * Cohesive Canopy & Voxel Quality Engine:
 * - Directly anchored to supporting branch nodes (max distance <= 2.15 units).
 * - Multi-scale cube hierarchy:
 *   * Macro core blocks (0.85 - 1.05) establish dense, interlocking foliage volumes.
 *   * Medium boundary blocks (0.62 - 0.78) wrap smoothly around clusters.
 *   * Micro edge blocks (0.44 - 0.54) produce stylized silhouette leaves without noise.
 * - Spatially coherent natural green color grading calibrated to upper-left sunlight.
 * - Strict determinism with zero duplicate coordinates per module cluster.
 */
export function getModuleFoliageClusters(): Record<string, ModuleVoxelCluster> {
  const clusters: Record<string, ModuleVoxelCluster> = {};
  const { branches } = getStaticTreeVoxels();

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
    system: { category: 'system', seed: 101, hubIndex: 1, localOffset: { x: 0.0, y: 0.15, z: 0.0 }, count: 32 },

    // Category: Terminal (1 module: zsh) -> dense lush lower-right canopy
    zsh: { category: 'terminal', seed: 202, hubIndex: 1, localOffset: { x: 0.0, y: 0.15, z: 0.0 }, count: 32 },

    // Category: Development (4 modules: git, node, python, java) -> overarching towering crown canopy
    git: { category: 'development', seed: 303, hubIndex: 0, localOffset: { x: -0.35, y: 0.0, z: 0.25 }, count: 26 },
    node: { category: 'development', seed: 304, hubIndex: 1, localOffset: { x: 0.35, y: 0.2, z: -0.25 }, count: 28 },
    python: { category: 'development', seed: 305, hubIndex: 2, localOffset: { x: -0.25, y: 0.25, z: -0.25 }, count: 28 },
    java: { category: 'development', seed: 306, hubIndex: 3, localOffset: { x: 0.25, y: 0.1, z: 0.35 }, count: 26 },

    // Category: Infrastructure (2 modules: docker, gcloud) -> mid-right canopy
    docker: { category: 'infrastructure', seed: 401, hubIndex: 0, localOffset: { x: -0.2, y: 0.15, z: -0.15 }, count: 28 },
    gcloud: { category: 'infrastructure', seed: 402, hubIndex: 1, localOffset: { x: 0.25, y: 0.25, z: 0.2 }, count: 28 },

    // Category: Editors (2 modules: vscode, chrome) -> upper-left canopy
    vscode: { category: 'editors', seed: 501, hubIndex: 0, localOffset: { x: 0.2, y: 0.15, z: -0.15 }, count: 28 },
    chrome: { category: 'editors', seed: 502, hubIndex: 1, localOffset: { x: -0.25, y: 0.25, z: 0.2 }, count: 28 }
  };

  const latticeStep = 0.52;

  for (const [moduleId, info] of Object.entries(MODULE_SPECS)) {
    const hubs = CATEGORY_BRANCH_HUBS[info.category] || [CATEGORY_CENTERS[info.category]];
    const primaryHub = hubs[info.hubIndex % hubs.length];
    const categoryBranches = branches[info.category] || [];

    const rand = seededRandom(info.seed);
    const voxels: VoxelCoord[] = [];

    const originX = primaryHub.x + info.localOffset.x;
    const originY = primaryHub.y + info.localOffset.y;
    const originZ = primaryHub.z + info.localOffset.z;

    const occupied = new Set<string>();

    // Generate candidates with smooth spherical/dome distribution centered on anchor hub
    let attempts = 0;
    while (voxels.length < info.count && attempts < 180) {
      attempts++;

      const rawRadius = (rand() * 0.65 + rand() * 0.65); // Smooth distribution ~ [0, 1.3]
      const theta = 2.0 * Math.PI * rand();
      const phi = Math.PI * (rand() * 0.85 + 0.05); // Dome bias

      const rawDx = rawRadius * Math.sin(phi) * Math.cos(theta);
      const rawDz = rawRadius * Math.sin(phi) * Math.sin(theta);
      const rawDy = (rawRadius * Math.cos(phi) * 0.9) + (rand() - 0.4) * 0.5;

      // Snap to consistent lattice grid preventing coplanar artifacts
      const gx = Math.round(rawDx / latticeStep);
      const gy = Math.round(rawDy / latticeStep);
      const gz = Math.round(rawDz / latticeStep);

      const key = `${gx},${gy},${gz}`;
      if (occupied.has(key)) {
        continue;
      }

      const dx = gx * latticeStep;
      const dy = gy * latticeStep;
      const dz = gz * latticeStep;

      const posX = Number((originX + dx).toFixed(3));
      const posY = Number((originY + dy).toFixed(3));
      const posZ = Number((originZ + dz).toFixed(3));

      // Connectivity verification: candidate MUST be within 2.2 units of a category branch
      let minDistanceToBranch = Infinity;
      for (let b = 0; b < categoryBranches.length; b++) {
        const br = categoryBranches[b];
        const dist = Math.sqrt((posX - br.x) ** 2 + (posY - br.y) ** 2 + (posZ - br.z) ** 2);
        if (dist < minDistanceToBranch) {
          minDistanceToBranch = dist;
        }
      }

      // Reject any candidate exceeding safety distance threshold
      if (minDistanceToBranch > 2.2) {
        continue;
      }

      occupied.add(key);

      const distFromHub = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Natural green color grading:
      // High Y and sun-facing faces (sun from upper-left [-16, 26, 14]) -> sunlit lime & fresh bright highlights
      // Mid canopy body -> primary leaf green & mid-depth green
      // Lower and shaded interior -> deep foliage green & inner shadow
      let leafColor: string;
      const sunFacing = (-posX * 0.4 + posY * 0.8 + posZ * 0.3) > 3.8;

      if (posY > 7.2 || (dy > 0.4 && sunFacing)) {
        leafColor = rand() > 0.45 ? VOXEL_PALETTE.leafSunlit : VOXEL_PALETTE.leafBright;
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
      // Micro edge blocks (0.44 - 0.54) create natural stylized leaf edges
      let voxelSize: number;
      if (distFromHub < 0.72) {
        voxelSize = 0.88 + rand() * 0.14; // Macro: >= 0.82
      } else if (distFromHub > 1.15) {
        voxelSize = 0.45 + rand() * 0.11; // Micro: < 0.60
      } else {
        voxelSize = 0.65 + rand() * 0.12; // Medium: 0.60 - 0.80
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
