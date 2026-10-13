import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getStaticTreeVoxels,
  getModuleFoliageClusters,
  CATEGORY_CENTERS,
  VOXEL_PALETTE
} from '../lib/voxelTreeData.ts';
import { MODULES, CATEGORIES } from '../lib/modules.ts';

test('VoxelTreeData: Static tree structure has plinth, trunk, and all category branches', () => {
  const { plinth, trunk, branches } = getStaticTreeVoxels();

  assert.ok(plinth.length > 10, 'Plinth voxels generated');
  assert.ok(trunk.length > 5, 'Trunk voxels generated');

  CATEGORIES.forEach((cat) => {
    assert.ok(branches[cat.id], `Branch exists for category ${cat.id}`);
    assert.ok(branches[cat.id].length > 0, `Branch has voxels for category ${cat.id}`);
  });
});

test('VoxelTreeData: Deterministic per-module foliage clusters for all registered modules', () => {
  const clusters1 = getModuleFoliageClusters();
  const clusters2 = getModuleFoliageClusters();

  MODULES.forEach((mod) => {
    assert.ok(clusters1[mod.id], `Cluster exists for module ${mod.id}`);
    assert.equal(clusters1[mod.id].categoryId, mod.category);
    assert.ok(clusters1[mod.id].voxels.length >= 8, `Cluster has sufficient voxels for ${mod.id}`);

    // Deterministic check between runs
    assert.deepEqual(
      clusters1[mod.id].voxels,
      clusters2[mod.id].voxels,
      `Voxels for ${mod.id} must be strictly deterministic across calls`
    );
  });
});

test('VoxelTreeData: Spatial canopy regions match category centers', () => {
  const clusters = getModuleFoliageClusters();

  Object.entries(clusters).forEach(([modId, cluster]) => {
    const center = CATEGORY_CENTERS[cluster.categoryId];
    assert.ok(center, `Category center exists for ${cluster.categoryId}`);

    // All voxels should be clustered reasonably close to the category center
    cluster.voxels.forEach((v) => {
      const dist = Math.sqrt(
        (v.x - center.x) ** 2 + (v.y - center.y) ** 2 + (v.z - center.z) ** 2
      );
      assert.ok(
        dist < 4.5,
        `Voxel in module ${modId} should be within 4.5 units of category center ${cluster.categoryId}`
      );
    });
  });
});
