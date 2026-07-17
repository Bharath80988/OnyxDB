import { useEffect, useState } from 'react';

interface ServerStats {
  status: string;
  uptime: number;
}

function App() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('{"action": "select"}');
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
    try {
      const parsedQuery = JSON.parse(query);
      fetch('http://localhost:8080/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedQuery)
      })
      .then(res => res.json())
      .then(data => setQueryResult(data))
      .catch(err => console.error(err));
    } catch (e) {
      setQueryResult({ status: "error", message: "Invalid JSON format" });
    }
  };

  return (
    <div className="min-h-screen bg-base-300">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-8">
        <div className="flex-1 flex items-center">
          <img src="/logo.png" alt="OnyxDB Logo" className="w-8 h-8 mr-3 object-contain rounded invert brightness-200" />
          <a className="btn btn-ghost normal-case text-xl text-primary p-0">OnyxDB</a>
        </div>
        <div className="flex-none">
          {error ? (
             <div className="badge badge-error gap-2">Disconnected</div>
          ) : stats ? (
             <div className="badge badge-success gap-2">Online</div>
          ) : (
             <div className="badge badge-warning gap-2">Connecting...</div>
          )}
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-sm uppercase text-gray-500">Navigation</h2>
              <ul className="menu bg-base-200 rounded-box">
                <li><a className="active">Query Console</a></li>
                <li><a>Storage Explorer</a></li>
                <li><a>Transactions</a></li>
                <li><a>Settings</a></li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-sm uppercase text-gray-500">Engine Stats</h2>
              {stats && !error && (
                <div className="stats stats-vertical shadow mt-2">
                  <div className="stat">
                    <div className="stat-title">Uptime</div>
                    <div className="stat-value text-lg">{new Date(stats.uptime).toLocaleTimeString()}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Pages Loaded</div>
                    <div className="stat-value text-lg">0</div>
                  </div>
                </div>
              )}
              {error && <p className="text-error text-sm">{error}</p>}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body flex flex-col h-[400px]">
              <h2 className="card-title text-sm uppercase text-gray-500">JSON Query</h2>
              <textarea 
                className="textarea textarea-bordered flex-grow font-mono text-sm resize-none focus:outline-none bg-base-200"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='{"action": "select"}'
              ></textarea>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary" onClick={handleQuery}>Execute</button>
              </div>
            </div>
          </div>

          {queryResult && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-sm uppercase text-gray-500">Result</h2>
                <div className="mockup-code bg-base-300 text-primary-content">
                  <pre data-prefix=">"><code>{JSON.stringify(queryResult, null, 2)}</code></pre>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
