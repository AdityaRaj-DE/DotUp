export interface VersionOption {
  value: string;
  label?: string;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  category: 'system' | 'terminal' | 'development' | 'infrastructure' | 'editors';
  description: string;
  supportsVersion?: boolean;
  defaultVersion?: string;
  versionOptions?: VersionOption[];
  iconType?: string;
}

export const MODULES: ModuleDefinition[] = [
  // System
  {
    id: 'system',
    name: 'System Base',
    category: 'system',
    description: 'Core system packages, curl, build essentials, and package manager foundation',
    iconType: 'system'
  },
  // Terminal & Shell
  {
    id: 'zsh',
    name: 'Zsh & Oh My Zsh',
    category: 'terminal',
    description: 'Zsh shell with customized prompt, auto-suggestions, and essential plugins',
    iconType: 'terminal'
  },
  // Development Runtimes
  {
    id: 'git',
    name: 'Git',
    category: 'development',
    description: 'Modern version control system and configuration',
    iconType: 'git'
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'development',
    description: 'Node.js runtime environment and npm package manager via fnm',
    supportsVersion: true,
    defaultVersion: '20',
    versionOptions: [
      { value: '20', label: '20 LTS (Iron)' },
      { value: '22', label: '22 Current (Jod)' },
      { value: '18', label: '18 Maintenance (Hydrogen)' }
    ],
    iconType: 'node'
  },
  {
    id: 'python',
    name: 'Python',
    category: 'development',
    description: 'Python interpreter, pip, venv virtual environment support, and pipx',
    supportsVersion: true,
    defaultVersion: '3.11',
    versionOptions: [
      { value: '3.11', label: '3.11 Standard' },
      { value: '3.12', label: '3.12 Modern' },
      { value: '3.10', label: '3.10 Stable' }
    ],
    iconType: 'python'
  },
  {
    id: 'java',
    name: 'Java JDK',
    category: 'development',
    description: 'OpenJDK development kit and runtime environment',
    supportsVersion: true,
    defaultVersion: '17',
    versionOptions: [
      { value: '17', label: 'OpenJDK 17 LTS' },
      { value: '21', label: 'OpenJDK 21 LTS' },
      { value: '11', label: 'OpenJDK 11 LTS' }
    ],
    iconType: 'java'
  },
  // Cloud & DevOps
  {
    id: 'docker',
    name: 'Docker Engine',
    category: 'infrastructure',
    description: 'Docker container runtime, Docker CLI, and Docker Compose plugin',
    iconType: 'docker'
  },
  {
    id: 'gcloud',
    name: 'Google Cloud SDK',
    category: 'infrastructure',
    description: 'gcloud CLI and Google Cloud developer tools suite',
    iconType: 'gcloud'
  },
  // Editors & Applications
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    category: 'editors',
    description: 'Visual Studio Code editor with essential dev extensions',
    iconType: 'vscode'
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    category: 'editors',
    description: 'Google Chrome browser for web development and automated testing',
    iconType: 'chrome'
  }
];

export interface ProfilePreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  modules: string[];
}

export const PRESETS: ProfilePreset[] = [
  {
    id: 'minimal',
    name: 'Minimal Base',
    tagline: 'Core utilities & shell',
    description: 'Lightweight environment with foundational system tools, Git, and customized Zsh.',
    modules: ['system', 'git', 'zsh']
  },
  {
    id: 'frontend',
    name: 'Frontend Web',
    tagline: 'Modern JS/TS client stack',
    description: 'Node.js runtime, VS Code, Git, Chrome, and Zsh shell configured for rapid frontend dev.',
    modules: ['system', 'git', 'zsh', 'node', 'vscode', 'chrome']
  },
  {
    id: 'backend',
    name: 'Backend Dev',
    tagline: 'Multi-runtime & microservices',
    description: 'Python, Node.js, Java OpenJDK, Docker Engine, and Google Cloud SDK.',
    modules: ['system', 'git', 'zsh', 'node', 'python', 'java', 'docker', 'gcloud']
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    tagline: 'Containers & cloud infrastructure',
    description: 'Docker Engine, Google Cloud SDK, Git version control, and enhanced terminal productivity.',
    modules: ['system', 'git', 'zsh', 'docker', 'gcloud']
  },
  {
    id: 'full',
    name: 'Full Suite',
    tagline: 'All runtimes, tools & editors',
    description: 'Comprehensive setup including all runtimes, editors, and infrastructure tools.',
    modules: ['system', 'git', 'zsh', 'node', 'python', 'java', 'docker', 'gcloud', 'vscode', 'chrome']
  }
];

export const CATEGORIES: { id: ModuleDefinition['category']; label: string; iconType: string; description: string }[] = [
  { id: 'system', label: 'System Foundation', iconType: 'system', description: 'Base packages, compilers, and utilities' },
  { id: 'terminal', label: 'Terminal & Shell', iconType: 'terminal', description: 'Productivity shells and prompts' },
  { id: 'development', label: 'Development Runtimes', iconType: 'code', description: 'Programming languages and interpreters' },
  { id: 'infrastructure', label: 'Cloud & Containers', iconType: 'cloud', description: 'Container engines and cloud tooling' },
  { id: 'editors', label: 'Editors & Apps', iconType: 'window', description: 'IDEs and graphical tools' }
];
