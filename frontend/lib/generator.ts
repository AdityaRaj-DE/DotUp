export interface GeneratorConfig {
  profileName: string;
  profileDescription?: string;
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  repoUrl?: string;
}

/**
 * Generates the clean dotup.yaml schema_version: 1 content
 */
export function generateDotupYaml(config: GeneratorConfig): string {
  const lines: string[] = [];
  lines.push('schema_version: 1');
  lines.push('profile:');
  lines.push(`  name: ${config.profileName.trim() || 'my-setup'}`);
  if (config.profileDescription?.trim()) {
    lines.push(`  description: "${config.profileDescription.trim().replace(/"/g, '\\"')}"`);
  }
  lines.push('modules:');

  const enabledKeys = Object.keys(config.selectedModules).filter(
    (key) => config.selectedModules[key]?.enabled
  );

  if (enabledKeys.length === 0) {
    lines.push('  system: {}');
  } else {
    for (const key of enabledKeys) {
      const mod = config.selectedModules[key];
      if (mod.version && mod.version.trim() !== '') {
        lines.push(`  ${key}:`);
        lines.push(`    version: "${mod.version.trim()}"`);
      } else {
        lines.push(`  ${key}: {}`);
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

