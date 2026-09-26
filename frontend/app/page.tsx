export const dynamic = "force-dynamic";

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
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>DotUp V3</h1>
      <p>Platform is running.</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', maxWidth: '300px' }}>
        <h2>System Status</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ margin: '0.5rem 0' }}>
            <strong>Frontend:</strong> { "ok" }
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <strong>Backend:</strong> { backendStatus }
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <strong>Database:</strong> { databaseStatus }
          </li>
        </ul>
      </div>
    </main>
  );
}
