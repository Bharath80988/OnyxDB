import { useEffect, useState } from 'react';

interface ServerStats {
  status: string;
  uptime: number;
}

import VisualQueryBuilder from './VisualQueryBuilder';

function App() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('{"action": "select"}');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'visual'>('json');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/stats`);
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Cannot connect to OnyxDB Engine');
      }
    };
    fetchStats();
  }, []);

  const handleQuery = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedQuery = JSON.parse(query);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedQuery)
      });
      const data = await response.json();
      setQueryResult(data);
    } catch (e) {
      setQueryResult({ status: "error", message: "Invalid JSON format or network error" });
    } finally {
      setLoading(false);
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

        {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Omni-Channel Query Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'json' ? 'bg-onyx-600 text-white' : 'bg-onyx-800 text-onyx-400 hover:bg-onyx-700'}`}
            onClick={() => setActiveTab('json')}
          >
            JSON REST Payload
          </button>
          <button 
            className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'visual' ? 'bg-onyx-600 text-white' : 'bg-onyx-800 text-onyx-400 hover:bg-onyx-700'}`}
            onClick={() => setActiveTab('visual')}
          >
            Visual Builder (Beta)
          </button>
        </div>

        {activeTab === 'json' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-onyx-800 rounded-lg p-6 border border-onyx-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Query Console</h2>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-48 bg-onyx-950 text-green-400 p-4 rounded font-mono text-sm border border-onyx-600 focus:outline-none focus:border-onyx-500 mb-4"
                spellCheck="false"
              />
              <button
                onClick={handleQuery}
                disabled={loading}
                className="w-full bg-onyx-600 hover:bg-onyx-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Executing...' : 'Execute Query'}
              </button>
              {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            </div>

            <div className="bg-onyx-800 rounded-lg p-6 border border-onyx-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Result</h2>
              <div className="bg-onyx-950 rounded p-4 h-64 overflow-y-auto border border-onyx-600">
                <pre className="text-sm font-mono text-blue-400">
                  {queryResult ? JSON.stringify(queryResult, null, 2) : '// No results yet'}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <VisualQueryBuilder />
        )}
      </main>

      </div>
    </div>
  );
}

export default App;
