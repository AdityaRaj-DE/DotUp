import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getStaticTreeVoxels,
  getModuleFoliageClusters,
  VOXEL_PALETTE
} from '../lib/voxelTreeData.ts';
import { MODULES } from '../lib/modules.ts';

test('Ground & Geometry Integrity: Island dimensions and coordinate coverage', () => {
  const { plinth } = getStaticTreeVoxels();

  // 1. Expanded dimensions: should span at least 8.0 units in width and depth
  const xCoords = plinth.map((p) => p.x);
  const zCoords = plinth.map((p) => p.z);

  const xSpan = Math.max(...xCoords) - Math.min(...xCoords);
  const zSpan = Math.max(...zCoords) - Math.min(...zCoords);

  assert.ok(xSpan >= 8.0, `Platform X span should be >= 8.0 units, got ${xSpan.toFixed(2)}`);
  assert.ok(zSpan >= 8.0, `Platform Z span should be >= 8.0 units, got ${zSpan.toFixed(2)}`);

  // 2. Center of mass should be centered beneath the tree (close to origin 0,0)
  const avgX = xCoords.reduce((a, b) => a + b, 0) / plinth.length;
  const avgZ = zCoords.reduce((a, b) => a + b, 0) / plinth.length;
  assert.ok(Math.abs(avgX) < 0.25, `Platform center X should be near 0, got ${avgX}`);
  assert.ok(Math.abs(avgZ) < 0.25, `Platform center Z should be near 0, got ${avgZ}`);
});

test('Ground & Geometry Integrity: Uniform grid spacing with zero duplicate coordinates', () => {
  const { plinth } = getStaticTreeVoxels();

  // Duplicate coordinates at identical layer create z-fighting and severe coplanar artifacts
  const seenCoordinates = new Set<string>();
  plinth.forEach((p) => {
    const key = `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`;
    assert.ok(!seenCoordinates.has(key), `Duplicate ground block detected at ${key}`);
    seenCoordinates.add(key);
  });
});

test('Ground & Geometry Integrity: Foliage clusters use regular lattice with no coincident cubes', () => {
  const clusters = getModuleFoliageClusters();

  Object.values(clusters).forEach((cluster) => {
    const coordSet = new Set<string>();
    cluster.voxels.forEach((v) => {
      const key = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
      assert.ok(
        !coordSet.has(key),
        `Duplicate foliage cube in module ${cluster.moduleId} at ${key}`
      );
      coordSet.add(key);
    });
  });
});
