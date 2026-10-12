export interface ModuleDefinition {
  id: string;
  name: string;
  category: 'system' | 'terminal' | 'development' | 'editors' | 'infrastructure' | 'applications';
  description: string;
  supportsVersion?: boolean;
  defaultVersion?: string;
  versionPlaceholder?: string;
  icon?: string;
}

export const MODULES: ModuleDefinition[] = [
  // System
  {
    id: 'system',
    name: 'System Base',
    category: 'system',
    description: 'Core system packages, curl, build essentials, and package manager base',
    icon: '⚙️'
  },
  // Terminal
  {
    id: 'zsh',
    name: 'Zsh & Oh My Zsh',
    category: 'terminal',
    description: 'Zsh shell with customized prompt, auto-suggestions, and plugins',
    icon: '🐚'
  },
  // Development
  {
    id: 'git',
    name: 'Git',
    category: 'development',
    description: 'Modern version control system and configuration',
    icon: '🐙'
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'development',
    description: 'Node.js runtime environment and npm package manager',
    supportsVersion: true,
    defaultVersion: '20',
    versionPlaceholder: '20, 22, lts',
    icon: '🟢'
  },
  {
    id: 'python',
    name: 'Python',
    category: 'development',
    description: 'Python interpreter, pip, and virtual environment support',
    supportsVersion: true,
    defaultVersion: '3.11',
    versionPlaceholder: '3.11, 3.12',
    icon: '🐍'
  },
  {
    id: 'java',
    name: 'Java (OpenJDK)',
    category: 'development',
    description: 'OpenJDK development kit and runtime environment',
    supportsVersion: true,
    defaultVersion: '17',
    versionPlaceholder: '17, 21',
    icon: '☕'
  },
  // Editors
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'editors',
    description: 'Visual Studio Code editor with essential dev extensions',
    icon: '💻'
  },
  {
    id: 'antigravity',
    name: 'Antigravity IDE',
    category: 'editors',
    description: 'Agentic AI-first IDE and workspace tools',
    icon: '🚀'
  },
  // Infrastructure
  {
    id: 'docker',
    name: 'Docker',
    category: 'infrastructure',
    description: 'Docker container runtime, Docker CLI, and Docker Compose',
    icon: '🐳'
  },
  {
    id: 'gcloud',
    name: 'Google Cloud SDK',
    category: 'infrastructure',
    description: 'gcloud CLI and Google Cloud developer tools',
    icon: '☁️'
  },
  // Applications
  {
    id: 'chrome',
    name: 'Google Chrome',
    category: 'applications',
    description: 'Google Chrome web browser for testing and development',
    icon: '🌐'
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
    description: 'Docker, GCloud, Git, and enhanced terminal environment',
    modules: ['system', 'git', 'zsh', 'docker', 'gcloud']
  },
  {
    id: 'full',
    name: 'Full Suite',
    description: 'All development runtimes, editors, and infrastructure tools',
    modules: ['system', 'git', 'zsh', 'node', 'python', 'java', 'docker', 'gcloud', 'vscode', 'chrome', 'antigravity']
  }
];

export const CATEGORIES: { id: ModuleDefinition['category']; label: string; icon: string }[] = [
  { id: 'system', label: 'System', icon: '⚙️' },
  { id: 'terminal', label: 'Terminal', icon: '🐚' },
  { id: 'development', label: 'Development Runtimes', icon: '📦' },
  { id: 'editors', label: 'Editors & IDEs', icon: '📝' },
  { id: 'infrastructure', label: 'Infrastructure & Cloud', icon: '☁️' },
  { id: 'applications', label: 'Applications', icon: '🌐' }
];

