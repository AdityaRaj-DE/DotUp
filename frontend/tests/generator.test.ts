import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateDotupYaml,
  generateBootstrapSnippet,
  validateConfig,
  getDownloadFilename,
  type GeneratorConfig
} from '../lib/generator.ts';
import { MODULES, PRESETS } from '../lib/modules.ts';

test('Generator: Valid Canonical V3 YAML output structure', () => {
  const config: GeneratorConfig = {
    setupId: 'backend-dev',
    setupVersion: '1.0.0',
    setupDescription: 'Standard backend development environment',
    selectedModules: {
      git: { enabled: true },
      node: { enabled: true, version: '20' },
      docker: { enabled: true }
    }
  };

  const yaml = generateDotupYaml(config);

  assert.match(yaml, /^schemaVersion: "1"/m);
  assert.match(yaml, /setup:\n  id: backend-dev\n  version: "1\.0\.0"/);
  assert.match(yaml, /description: "Standard backend development environment"/);
  assert.match(yaml, /components:\n  - id: git\n  - id: node\n    options:\n      version: "20"\n  - id: docker/);
});

test('Generator: Fallback when no modules are enabled', () => {
  const config: GeneratorConfig = {
    setupId: 'empty-setup',
    setupVersion: '1.0.0',
    selectedModules: {}
  };

  const yaml = generateDotupYaml(config);
  assert.match(yaml, /components:\n  - id: system/);
});

test('Generator: Deterministic bootstrap command snippet', () => {
  const config: GeneratorConfig = {
    setupId: 'minimal-setup',
    setupVersion: '1.0.0',
    selectedModules: {
      system: { enabled: true },
      git: { enabled: true }
    }
  };

  const snippet = generateBootstrapSnippet(config);
  assert.match(snippet, /^cat << 'EOF' > setup\.yaml/);
  assert.match(snippet, /schemaVersion: "1"/);
  assert.match(snippet, /setup:\n  id: minimal-setup/);
  assert.match(snippet, /curl -fsSL https:\/\/raw\.githubusercontent\.com\/AdityaRaj-DE\/DotUp\/main\/bootstrap\.sh \| bash -s -- --config "\$PWD\/setup\.yaml"/);
});

test('Validation: Correctly validates setup ID and versions', () => {
  const validConfig: GeneratorConfig = {
    setupId: 'web-prod',
    setupVersion: '1.2.0',
    selectedModules: { git: { enabled: true } }
  };
  const validRes = validateConfig(validConfig);
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.errors.length, 0);

  // Missing setupId
  const missingIdRes = validateConfig({
    setupId: '',
    setupVersion: '1.0.0',
    selectedModules: { git: { enabled: true } }
  });
  assert.equal(missingIdRes.isValid, false);
  assert.ok(missingIdRes.errors.some((e) => e.field === 'setupId'));

  // Invalid characters in setupId
  const invalidIdRes = validateConfig({
    setupId: 'invalid id with spaces!',
    setupVersion: '1.0.0',
    selectedModules: { git: { enabled: true } }
  });
  assert.equal(invalidIdRes.isValid, false);
  assert.ok(invalidIdRes.errors.some((e) => e.field === 'setupId'));

  // No modules selected
  const noModulesRes = validateConfig({
    setupId: 'valid-id',
    setupVersion: '1.0.0',
    selectedModules: {
      git: { enabled: false },
      node: { enabled: false }
    }
  });
  assert.equal(noModulesRes.isValid, false);
  assert.ok(noModulesRes.errors.some((e) => e.field === 'modules'));
});

test('Download Filename: derives safe filename', () => {
  assert.equal(getDownloadFilename('backend-dev'), 'backend-dev.yaml');
  assert.equal(getDownloadFilename('my setup profile!'), 'my-setup-profile.yaml');
  assert.equal(getDownloadFilename(''), 'dotup.yaml');
});

test('Modules Registry: all presets contain known modules', () => {
  const knownModuleMap: Record<string, true> = {};
  for (const m of MODULES) {
    knownModuleMap[m.id] = true;
  }
  for (const preset of PRESETS) {
    for (const modId of preset.modules) {
      assert.ok(
        knownModuleMap[modId],
        `Preset ${preset.id} references unknown module ${modId}`
      );
    }
  }
});
