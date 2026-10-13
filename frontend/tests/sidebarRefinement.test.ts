import assert from 'node:assert/strict';
import test from 'node:test';
import { MODULES, CATEGORIES, PRESETS } from '../lib/modules.ts';

test('Sidebar UX Refinement: Category items cover all defined categories', () => {
  // Ensure 'all' + 5 categories = 6 items
  const categoryIds = ['all', ...CATEGORIES.map((c) => c.id)];
  assert.equal(categoryIds.length, 6);
  assert.ok(categoryIds.includes('system'));
  assert.ok(categoryIds.includes('terminal'));
  assert.ok(categoryIds.includes('development'));
  assert.ok(categoryIds.includes('infrastructure'));
  assert.ok(categoryIds.includes('editors'));
});

test('Sidebar UX Refinement: Module rows have name and descriptions', () => {
  MODULES.forEach((mod) => {
    assert.ok(mod.id);
    assert.ok(mod.name);
    assert.ok(mod.description && mod.description.length > 10);
    if (mod.supportsVersion) {
      assert.ok(mod.versionOptions && mod.versionOptions.length > 0);
    }
  });
});

test('Sidebar UX Refinement: Presets retain clean module mappings', () => {
  assert.equal(PRESETS.length, 5);
  PRESETS.forEach((preset) => {
    assert.ok(preset.id);
    assert.ok(preset.name);
    assert.ok(preset.modules.length > 0);
    preset.modules.forEach((modId) => {
      assert.ok(
        MODULES.some((m) => m.id === modId),
        `Preset ${preset.id} references unknown module ${modId}`
      );
    });
  });
});
