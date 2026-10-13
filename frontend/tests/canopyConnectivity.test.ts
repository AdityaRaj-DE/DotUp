import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getStaticTreeVoxels,
  getModuleFoliageClusters,
  VOXEL_PALETTE
} from '../lib/voxelTreeData.ts';
import { MODULES, CATEGORIES } from '../lib/modules.ts';

test('Canopy Connectivity: Foliage cubes are tightly anchored to branch geometry without floating outliers', () => {
  const { branches } = getStaticTreeVoxels();
  const clusters = getModuleFoliageClusters();

  // For every module, every single voxel must be within 2.5 units of at least one branch coordinate
  // in its category. This mathematically proves zero detached or floating outlier cubes.
  Object.values(clusters).forEach((cluster) => {
    const categoryBranches = branches[cluster.categoryId];
    assert.ok(categoryBranches && categoryBranches.length > 0, `Category branches exist for ${cluster.categoryId}`);

    cluster.voxels.forEach((v) => {
      let minDistance = Infinity;
      categoryBranches.forEach((b) => {
        const dist = Math.sqrt((v.x - b.x) ** 2 + (v.y - b.y) ** 2 + (v.z - b.z) ** 2);
        if (dist < minDistance) {
          minDistance = dist;
        }
      });

      assert.ok(
        minDistance <= 2.5,
        `Voxel in module ${cluster.moduleId} at (${v.x}, ${v.y}, ${v.z}) is detached! Min distance to branch is ${minDistance.toFixed(2)} (must be <= 2.5)`
      );
    });
  });
});

test('Canopy Hierarchy: Multi-scale cubes create a layered canopy', () => {
  const clusters = getModuleFoliageClusters();

  // Verify macro core blocks (> 0.82), medium body blocks (0.6 - 0.8), and micro edge blocks (< 0.6)
  let macroCount = 0;
  let mediumCount = 0;
  let microCount = 0;

  Object.values(clusters).forEach((cluster) => {
    cluster.voxels.forEach((v) => {
      const s = v.size || 0.6;
      if (s >= 0.82) macroCount++;
      else if (s >= 0.60) mediumCount++;
      else microCount++;
    });
  });

  assert.ok(macroCount >= 40, `Substantial macro volume blocks exist (${macroCount})`);
  assert.ok(mediumCount >= 40, `Substantial medium body blocks exist (${mediumCount})`);
  assert.ok(microCount >= 40, `Substantial micro edge blocks exist (${microCount})`);
});

test('Canopy Palette: Natural greens match calibrated palette standards', () => {
  const clusters = getModuleFoliageClusters();

  assert.equal(VOXEL_PALETTE.leafSunlit, '#A6D95A');
  assert.equal(VOXEL_PALETTE.leafPrimary, '#78BD43');
  assert.equal(VOXEL_PALETTE.leafMid, '#438D35');
  assert.equal(VOXEL_PALETTE.leafDeep, '#245C2C');

  const validCanopyGreens = new Set([
    VOXEL_PALETTE.leafSunlit,
    VOXEL_PALETTE.leafPrimary,
    VOXEL_PALETTE.leafMid,
    VOXEL_PALETTE.leafDeep,
    VOXEL_PALETTE.leafShadow,
    VOXEL_PALETTE.leafBright
  ]);

  Object.values(clusters).forEach((cluster) => {
    cluster.voxels.forEach((v) => {
      assert.ok(
        v.color && validCanopyGreens.has(v.color),
        `Voxel in ${cluster.moduleId} has invalid non-natural color ${v.color}`
      );
    });
  });
});
