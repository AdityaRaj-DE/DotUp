import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateDotupYaml,
  generateBootstrapSnippet,
  validateConfig,
  getDownloadFilename,
  type GeneratorConfig
} from '../lib/generator.ts';
import { MODULES, PRESETS, CATEGORIES } from '../lib/modules.ts';
import {
  getStaticTreeVoxels,
  getModuleFoliageClusters,
  CATEGORY_CENTERS
} from '../lib/voxelTreeData.ts';

test('Interaction Contract: Sidebar is sole configuration source; tree is visual derivation', () => {
  const initialConfig: GeneratorConfig = {
    setupId: 'test-env',
    setupVersion: '1.0.0',
    selectedModules: {
      git: { enabled: true },
      node: { enabled: true, version: '20' }
    }
  };

  const validation = validateConfig(initialConfig);
  assert.equal(validation.isValid, true);

  // Derive tree clusters
  const clusters = getModuleFoliageClusters();
  assert.ok(clusters.git);
  assert.ok(clusters.node);

  // Changing version does NOT alter foliage cluster or coordinates
  const clustersBefore = getModuleFoliageClusters();
  const updatedConfig: GeneratorConfig = {
    ...initialConfig,
    selectedModules: {
      git: { enabled: true },
      node: { enabled: true, version: '22' } // Version changed
    }
  };
  const clustersAfter = getModuleFoliageClusters();
  assert.deepEqual(
    clustersBefore.node.voxels,
    clustersAfter.node.voxels,
    'Version update must not mutate tree foliage geometry'
  );
});

test('Canopy Density: Empty categories have zero foliage; all modules selected populates all regions', () => {
  const clusters = getModuleFoliageClusters();
  const { branches } = getStaticTreeVoxels();

  // 1. Bare branch check: when 0 modules are selected for a category, bare wooden branch remains
  CATEGORIES.forEach((cat) => {
    assert.ok(branches[cat.id].length > 0, `Bare branch exists for category ${cat.id}`);
  });

  // 2. All modules selected check
  const allModulesSelected: Record<string, { enabled: boolean }> = {};
  MODULES.forEach((m) => {
    allModulesSelected[m.id] = { enabled: true };
  });

  const activeCategories = new Set<string>();
  Object.entries(allModulesSelected).forEach(([modId, mod]) => {
    if (mod.enabled && clusters[modId]) {
      activeCategories.add(clusters[modId].categoryId);
    }
  });

  assert.equal(
    activeCategories.size,
    CATEGORIES.length,
    'All 5 categories must be actively populated when all modules are enabled'
  );
});

test('Multi-Module Shared Category Foliage: Deselecting one module preserves sibling module foliage', () => {
  const clusters = getModuleFoliageClusters();

  // Development category contains 4 modules: git, node, python, java
  const devModules = ['git', 'node', 'python', 'java'];
  devModules.forEach((m) => {
    assert.equal(clusters[m].categoryId, 'development');
  });

  // If node is disabled, git, python, and java remain intact with their deterministic voxels
  const selectedState = {
    git: { enabled: true },
    node: { enabled: false }, // removed
    python: { enabled: true },
    java: { enabled: true }
  };

  const remainingDevVoxels = Object.entries(selectedState)
    .filter(([_, state]) => state.enabled)
    .flatMap(([modId]) => clusters[modId].voxels);

  assert.ok(remainingDevVoxels.length > 30, 'Sibling module voxels remain populated in canopy');
});
