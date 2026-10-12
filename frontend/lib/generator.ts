export interface GeneratorConfig {
  setupId: string;
  setupVersion?: string;
  setupDescription?: string;
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  repoUrl?: string;
}

export interface ValidationError {
  field: 'setupId' | 'setupVersion' | 'modules' | 'version';
  moduleId?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates setup identifier, version, and module selections
 */
export function validateConfig(config: GeneratorConfig): ValidationResult {
  const errors: ValidationError[] = [];

  const trimmedId = (config.setupId || '').trim();
  if (!trimmedId) {
    errors.push({
      field: 'setupId',
      message: 'Setup identifier is required.'
    });
  } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedId)) {
    errors.push({
      field: 'setupId',
      message: 'Identifier may only contain letters, numbers, hyphens, and underscores.'
    });
  }

  const trimmedVer = (config.setupVersion || '').trim();
  if (!trimmedVer) {
    errors.push({
      field: 'setupVersion',
      message: 'Setup version is required (e.g. 1.0.0).'
    });
  }

  const enabledModules = Object.keys(config.selectedModules).filter(
    (key) => config.selectedModules[key]?.enabled
  );

  if (enabledModules.length === 0) {
    errors.push({
      field: 'modules',
      message: 'Select at least one module to include in your environment.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Derives a clean filename for download based on setup ID
 */
export function getDownloadFilename(setupId: string): string {
  const safeId = (setupId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return safeId ? `${safeId}.yaml` : 'dotup.yaml';
}

/**
 * Generates canonical DotUp V3 YAML configuration
 * Follows canonical format:
 * schemaVersion: "1"
 * setup:
 *   id: <id>
 *   version: "1.0.0"
 *   description: "..."
 * components:
 *   - id: <id>
 *     options:
 *       version: "..."
 */
export function generateDotupYaml(config: GeneratorConfig): string {
  const lines: string[] = [];
  lines.push('schemaVersion: "1"');
  lines.push('');
  lines.push('setup:');

  const safeId = config.setupId.trim() || 'my-setup';
  lines.push(`  id: ${safeId}`);
  lines.push(`  version: "${(config.setupVersion || '1.0.0').trim()}"`);

  if (config.setupDescription?.trim()) {
    const escapedDesc = config.setupDescription.trim().replace(/"/g, '\\"');
    lines.push(`  description: "${escapedDesc}"`);
  }

  lines.push('');
  lines.push('components:');

  const enabledKeys = Object.keys(config.selectedModules).filter(
    (key) => config.selectedModules[key]?.enabled
  );

  if (enabledKeys.length === 0) {
    // If none enabled, canonical fallback is system component
    lines.push('  - id: system');
  } else {
    for (const key of enabledKeys) {
      const mod = config.selectedModules[key];
      lines.push(`  - id: ${key}`);
      if (mod.version && mod.version.trim() !== '') {
        lines.push('    options:');
        lines.push(`      version: "${mod.version.trim()}"`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generates the complete copy-pasteable bootstrap command snippet
 */
export function generateBootstrapSnippet(config: GeneratorConfig): string {
  const yaml = generateDotupYaml(config);
  const rawUrl =
    config.repoUrl ||
    'https://raw.githubusercontent.com/AdityaRaj-DE/DotUp/main/bootstrap.sh';

  return `cat << 'EOF' > setup.yaml
${yaml}
EOF
curl -fsSL ${rawUrl} | bash -s -- --config "$PWD/setup.yaml"`;
}
