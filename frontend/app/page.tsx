export const dynamic = "force-dynamic";

import SetupBuilder from '../components/SetupBuilder';

export default async function Home() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  let backendStatus = "failed";
  let databaseStatus = "failed";

  try {
    const res = await fetch(`${backendUrl}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    });

    if (res.ok) {
      const data = await res.json();
      backendStatus = data.status === "ok" ? "ok" : "failed";
      databaseStatus = data.database === "ok" ? "ok" : "failed";
    }
  } catch {
    backendStatus = "unavailable";
  }

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="brand-title">DotUp</span>
          <span className="brand-version-pill">v3.0</span>
        </div>

        {/* System Health Indicators */}
        <div className="navbar-status-group" aria-label="System status">
          <div className="status-pill-nav">
            <span className="status-nav-dot status-nav-dot-green" />
            <span>Frontend: <strong>ok</strong></span>
          </div>

          <div className="status-pill-nav">
            <span
              className={`status-nav-dot ${
                backendStatus === 'ok' ? 'status-nav-dot-green' : 'status-nav-dot-amber'
              }`}
            />
            <span>Backend: <strong>{backendStatus}</strong></span>
          </div>

          <div className="status-pill-nav">
            <span
              className={`status-nav-dot ${
                databaseStatus === 'ok' ? 'status-nav-dot-green' : 'status-nav-dot-amber'
              }`}
            />
            <span>Database: <strong>{databaseStatus}</strong></span>
          </div>
        </div>
      </header>

      {/* Main Setup Builder Experience */}
      <main className="main-content">
        <div className="hero-banner">
          <span className="hero-badge">
            <span className="status-dot-green" />
            V3 Reproducible Environment Engine
          </span>
          <h1 className="hero-title">Declarative Setup Configurator</h1>
          <p className="hero-subtitle">
            Configure runtimes, developer tools, and system packages into an idempotent,
            self-contained installation specification ready for Linux and macOS.
          </p>
        </div>

        <SetupBuilder
          initialBackendStatus={backendStatus}
          initialDatabaseStatus={databaseStatus}
        />
      </main>
    </div>
  );
}
