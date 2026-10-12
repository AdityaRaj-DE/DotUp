export interface ModuleDefinition {
  id: string;
  name: string;
  category: 'system' | 'terminal' | 'development' | 'infrastructure' | 'editors';
  description: string;
  supportsVersion?: boolean;
  defaultVersion?: string;
  versionOptions?: string[];
  iconType?: string;
}

export const MODULES: ModuleDefinition[] = [
  // System
  {
    id: 'system',
    name: 'System Base',
    category: 'system',
    description: 'Core system packages, curl, build essentials, and package manager base',
    iconType: 'system'
  },
  // Terminal
  {
    id: 'zsh',
    name: 'Zsh & Oh My Zsh',
    category: 'terminal',
    description: 'Zsh shell with customized prompt, auto-suggestions, and plugins',
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
    description: 'Node.js runtime environment and npm package manager',
    supportsVersion: true,
    defaultVersion: '20',
    versionOptions: ['20 LTS', '22 Current', '18 LTS'],
    iconType: 'node'
  },
  {
    id: 'python',
    name: 'Python',
    category: 'development',
    description: 'Python interpreter, pip, and virtual environment support',
    supportsVersion: true,
    defaultVersion: '3.11',
    versionOptions: ['3.11', '3.12', '3.10'],
    iconType: 'python'
  },
  {
    id: 'java',
    name: 'Java',
    category: 'development',
    description: 'OpenJDK development kit and runtime environment',
    supportsVersion: true,
    defaultVersion: '17',
    versionOptions: ['OpenJDK 17', 'OpenJDK 21', 'OpenJDK 11'],
    iconType: 'java'
  },
  // Cloud & DevOps
  {
    id: 'docker',
    name: 'Docker Engine',
    category: 'infrastructure',
    description: 'Docker container runtime, Docker CLI, and Docker Compose',
    iconType: 'docker'
  },
  {
    id: 'gcloud',
    name: 'Google Cloud SDK',
    category: 'infrastructure',
    description: 'gcloud CLI and Google Cloud developer tools',
    iconType: 'gcloud'
  },
  // Editors & Tools
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'editors',
    description: 'Visual Studio Code editor with essential dev extensions',
    iconType: 'vscode'
  },
  {
    id: 'chrome',
    name: 'Chrome',
    category: 'editors',
    description: 'Google Chrome browser for web development and testing',
    iconType: 'chrome'
  }
];

export interface ProfilePreset {
  id: string;
  name: string;
  description: string;
  modules: string[];
}

export const PRESETS: ProfilePreset[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Essential environment with core tools and Zsh',
    modules: ['system', 'git', 'zsh']
  },
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'Node.js, VS Code, Git, Chrome, and shell setup',
    modules: ['system', 'git', 'zsh', 'node', 'vscode', 'chrome']
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Python, Node, Java, Docker, and Google Cloud SDK',
    modules: ['system', 'git', 'zsh', 'node', 'python', 'java', 'docker', 'gcloud']
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    description: 'Docker, GCloud, Git, and enhanced terminal',
    modules: ['system', 'git', 'zsh', 'docker', 'gcloud']
  },
  {
    id: 'full',
    name: 'Full Suite',
    description: 'All development runtimes, editors, and infrastructure tools',
    modules: ['system', 'git', 'zsh', 'node', 'python', 'java', 'docker', 'gcloud', 'vscode', 'chrome']
  }
];

export const CATEGORIES: { id: ModuleDefinition['category']; label: string; iconType: string }[] = [
  { id: 'system', label: 'SYSTEM', iconType: 'system' },
  { id: 'terminal', label: 'TERMINAL & SHELL', iconType: 'terminal' },
  { id: 'development', label: 'DEVELOPMENT RUNTIMES', iconType: 'code' },
  { id: 'infrastructure', label: 'CLOUD & DEVOPS', iconType: 'cloud' },
  { id: 'editors', label: 'EDITORS & TOOLS', iconType: 'window' }
];
