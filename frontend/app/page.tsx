import SetupBuilder from '../components/SetupBuilder';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'DotUp - Workstation Setup & Dotfiles Configurator',
  description: 'Build and customize your Linux workstation stack visually in seconds. Instant declarative command generation with zero dependencies.',
};

export default function Home() {
  return (
    <div className="app-shell">
      {/* Top Navbar with horizontal navigation */}
      <Navbar />

      {/* Main Setup Builder Experience */}
      <main className="main-content">
        <SetupBuilder />
      </main>
    </div>
  );
}
