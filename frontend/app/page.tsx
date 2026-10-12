export const dynamic = "force-dynamic";

import SetupGenerator from '../components/SetupGenerator';

export default async function Home() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  
  let backendStatus = "failed";
  let databaseStatus = "failed";

  try {
    const res = await fetch(`${backendUrl}/health`, { 
      cache: 'no-store',
      // Small timeout for health checks
      signal: AbortSignal.timeout(3000) 
    });
    
    if (res.ok) {
      const data = await res.json();
      backendStatus = data.status === "ok" ? "ok" : "failed";
      databaseStatus = data.database === "ok" ? "ok" : "failed";
    }
  } catch (error) {
    // backend unavailable
    backendStatus = "unavailable";
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '4rem' }}>
      {/* Top Navbar / Header */}
      <header
        style={{
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          padding: '0.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>DotUp</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#e2e8f0',
              color: '#475569',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px'
            }}
          >
            v3.0
          </span>
        </div>

        {/* System Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block'
              }}
            />
            Frontend: <strong>ok</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: backendStatus === 'ok' ? '#10b981' : '#f59e0b',
                display: 'inline-block'
              }}
            />
            Backend: <strong>{backendStatus}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: databaseStatus === 'ok' ? '#10b981' : '#f59e0b',
                display: 'inline-block'
              }}
            />
            Database: <strong>{databaseStatus}</strong>
          </span>
        </div>
      </header>

      {/* Main Setup Generator UI */}
      <SetupGenerator />
    </main>
  );
}
