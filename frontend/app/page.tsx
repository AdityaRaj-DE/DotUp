export const dynamic = "force-dynamic";

import SetupGenerator from '../components/SetupGenerator';

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
  } catch (error) {
    backendStatus = "unavailable";
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '5rem' }}>
      {/* Top Navbar Matching Stitch Design */}
      <header
        style={{
          borderBottom: '1px solid #eef2f6',
          backgroundColor: '#ffffff',
          padding: '0.85rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Logo icon */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            DotUp
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 500,
              fontFamily: 'monospace',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px'
            }}
          >
            v3.0
          </span>
        </div>

        {/* System Status Indicators with Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              color: '#475569'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block'
              }}
            />
            Frontend: <strong style={{ color: '#0f172a' }}>ok</strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              color: '#475569'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: backendStatus === 'ok' ? '#10b981' : '#f59e0b',
                display: 'inline-block'
              }}
            />
            Backend: <strong style={{ color: '#0f172a' }}>{backendStatus}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              color: '#475569'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: databaseStatus === 'ok' ? '#10b981' : '#f59e0b',
                display: 'inline-block'
              }}
            />
            Database: <strong style={{ color: '#0f172a' }}>{databaseStatus}</strong>
          </div>
        </div>
      </header>

      {/* Main Setup Generator UI */}
      <SetupGenerator />
    </main>
  );
}
