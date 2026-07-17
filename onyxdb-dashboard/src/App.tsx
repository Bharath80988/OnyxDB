import { useEffect, useState } from 'react';

interface ServerStats {
  status: string;
  uptime: number;
}

function App() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [queryResult, setQueryResult] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => {
        console.error(err);
        setError('Cannot connect to OnyxDB Engine');
      });
  }, []);

  const handleQuery = () => {
    fetch('http://localhost:8080/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    .then(res => res.json())
    .then(data => setQueryResult(data))
    .catch(err => console.error(err));
  };

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 border-b border-onyx-700 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">OnyxDB</h1>
        <p className="text-onyx-600 mt-1">Local-first embeddable relational database</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Status and Navigation */}
        <aside className="space-y-6">
          <div className="bg-onyx-800 border border-onyx-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Engine Status</h2>
            {error ? (
              <div className="text-red-400 text-sm">{error}</div>
            ) : stats ? (
              <div className="space-y-2 text-sm text-onyx-100">
                <div className="flex justify-between">
                  <span className="text-onyx-600">Status</span>
                  <span className="text-emerald-400 capitalize">{stats.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onyx-600">Uptime</span>
                  <span>{new Date(stats.uptime).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-onyx-600 text-sm">Connecting...</div>
            )}
          </div>

          <nav className="bg-onyx-800 border border-onyx-700 rounded-lg p-4">
            <ul className="space-y-2 text-sm">
              <li><button className="w-full text-left px-3 py-2 bg-onyx-700 rounded text-onyx-100">Query Console</button></li>
              <li><button className="w-full text-left px-3 py-2 text-onyx-600 hover:text-onyx-100">Storage Explorer</button></li>
              <li><button className="w-full text-left px-3 py-2 text-onyx-600 hover:text-onyx-100">Transactions</button></li>
              <li><button className="w-full text-left px-3 py-2 text-onyx-600 hover:text-onyx-100">Settings</button></li>
            </ul>
          </nav>
        </aside>

        {/* Right Column: Query Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-onyx-800 border border-onyx-700 rounded-lg p-6 flex flex-col h-[300px]">
            <h2 className="text-lg font-semibold mb-4">Query Console</h2>
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow bg-onyx-900 border border-onyx-700 rounded p-4 font-mono text-sm resize-none focus:outline-none focus:border-onyx-600"
            />
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleQuery}
                className="bg-onyx-100 text-onyx-900 px-4 py-2 rounded text-sm font-semibold hover:bg-white transition-colors"
              >
                Run Query
              </button>
            </div>
          </div>

          {queryResult && (
            <div className="bg-onyx-800 border border-onyx-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Result</h2>
              <pre className="bg-onyx-900 p-4 rounded text-sm font-mono overflow-auto border border-onyx-700 text-emerald-400">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
