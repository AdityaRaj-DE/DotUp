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
      <SetupBuilder
        initialBackendStatus={backendStatus}
        initialDatabaseStatus={databaseStatus}
      />
    </div>
  );
}
