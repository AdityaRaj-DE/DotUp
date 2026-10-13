import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getStaticTreeVoxels,
  getModuleFoliageClusters,
  CATEGORY_CENTERS,
  VOXEL_PALETTE
} from '../lib/voxelTreeData.ts';
import { MODULES, CATEGORIES } from '../lib/modules.ts';

test('VoxelTree Visual Refinement: Grassy island pedestal replaces grey plinth', () => {
  const { plinth } = getStaticTreeVoxels();

  assert.ok(plinth.length >= 30, 'Island pedestal contains sufficient voxel layers');

  // Verify grass colors and earthy bedrock exist in the palette
  assert.ok(VOXEL_PALETTE.grassLight, 'Sunlit turf color defined');
  assert.ok(VOXEL_PALETTE.grassMed, 'Lush turf color defined');
  assert.ok(VOXEL_PALETTE.soilTop, 'Soil substrate color defined');

  const colors = new Set(plinth.map((p) => p.color));
  assert.ok(colors.has(VOXEL_PALETTE.grassLight) || colors.has(VOXEL_PALETTE.grassMed), 'Pedestal contains green turf voxels');
  assert.ok(colors.has(VOXEL_PALETTE.soilTop) || colors.has(VOXEL_PALETTE.soilBase), 'Pedestal contains earthy soil voxels');
});

test('VoxelTree Visual Refinement: Trunk has organic buttressed taper and warm bark palette', () => {
  const { trunk } = getStaticTreeVoxels();

  assert.ok(trunk.length >= 15, 'Trunk contains stepped voxel structure');
  assert.ok(VOXEL_PALETTE.trunkHighlight, 'Warm highlight bark defined');
  assert.ok(VOXEL_PALETTE.trunkMed, 'Primary warm brown bark defined');

  // Check base wider than top:
  const baseVoxels = trunk.filter((t) => t.y <= 0.2);
  const topVoxels = trunk.filter((t) => t.y >= 4.0);

  assert.ok(baseVoxels.length > 0, 'Base voxels present');
  assert.ok(topVoxels.length > 0, 'Top voxels present');

  const maxBaseSize = Math.max(...baseVoxels.map((b) => b.size || 0));
  const minTopSize = Math.min(...topVoxels.map((t) => t.size || 1));
  assert.ok(maxBaseSize > minTopSize, 'Trunk base is wider than the tapered top');
});

test('VoxelTree Visual Refinement: Natural green canopy palette with spatial color depth', () => {
  const clusters = getModuleFoliageClusters();

  // Natural green palette keys
  assert.ok(VOXEL_PALETTE.leafSunlit, 'Lime sunlit color defined');
  assert.ok(VOXEL_PALETTE.leafBright, 'Fresh leaf green defined');
  assert.ok(VOXEL_PALETTE.leafPrimary, 'Primary green defined');
  assert.ok(VOXEL_PALETTE.leafDeep, 'Deep forest green defined');

  // Check that modules have multi-scale voxels and natural green tones
  Object.values(clusters).forEach((cluster) => {
    const sizes = cluster.voxels.map((v) => v.size || 0.6);
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);

    assert.ok(maxSize > minSize, 'Foliage clusters use multi-scale cube sizes for layered canopy');

    // All voxels must use colors from the natural green palette
    const validGreens = new Set([
      VOXEL_PALETTE.leafSunlit,
      VOXEL_PALETTE.leafBright,
      VOXEL_PALETTE.leafPrimary,
      VOXEL_PALETTE.leafMid,
      VOXEL_PALETTE.leafDeep,
      VOXEL_PALETTE.leafShadow
    ]);

    cluster.voxels.forEach((v) => {
      assert.ok(
        v.color && validGreens.has(v.color),
        `Foliage voxel in ${cluster.moduleId} must use a coordinated natural green tone, got ${v.color}`
      );
    });
  });
});

test('VoxelTree Visual Refinement: Branch hierarchy connects smoothly into category canopy regions', () => {
  const { branches } = getStaticTreeVoxels();

  CATEGORIES.forEach((cat) => {
    const branchVoxels = branches[cat.id];
    assert.ok(branchVoxels.length >= 6, `Category ${cat.id} has primary and secondary branch structure`);

    // Verify branch progression (near trunk to outer canopy)
    const yVals = branchVoxels.map((b) => b.y);
    assert.ok(Math.max(...yVals) > Math.min(...yVals), 'Branch ascends naturally towards canopy');
  });
});
