import React, { useState } from 'react';
import VisualQueryBuilder from '../VisualQueryBuilder';
import { Activity } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'json' | 'visual'>('json');

  const handleRunQuery = async (queryPayload: string) => {
    setLoading(true);
    setResult('Executing...');
    try {
      const response = await fetch('http://localhost:8080/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: queryPayload
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation (Dashboard internal) */}
      <div className="w-64 bg-onyx-800 border-r border-onyx-600/50 p-4 flex flex-col gap-8">
        <div>
          <h2 className="text-xs font-bold text-onyx-100/50 uppercase tracking-wider mb-4">Navigation</h2>
          <div className="space-y-2">
            <button 
              onClick={() => setView('json')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${view === 'json' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-onyx-700/50 text-onyx-100/80'}`}
            >
              JSON Console
            </button>
            <button 
              onClick={() => setView('visual')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${view === 'visual' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-onyx-700/50 text-onyx-100/80'}`}
            >
              Visual Builder
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xs font-bold text-onyx-100/50 uppercase tracking-wider mb-4">Engine Stats</h2>
          <div className="bg-onyx-900/50 border border-onyx-600/30 rounded-xl p-4 space-y-4">
            <div>
              <div className="text-xs text-onyx-100/50">Status</div>
              <div className="font-mono text-green-400 text-sm flex items-center gap-2">
                <Activity className="w-3 h-3" /> Online
              </div>
            </div>
            <div>
              <div className="text-xs text-onyx-100/50">Host</div>
              <div className="font-mono text-sm text-onyx-100/80">localhost:8080</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 bg-onyx-900 relative">
        {view === 'json' ? (
          <div className="p-8 h-full flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display font-bold">JSON Query Console</h2>
              <button 
                onClick={() => handleRunQuery(query)}
                disabled={loading}
                className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-glow-primary text-sm"
              >
                {loading ? 'Running...' : 'Execute Payload'}
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='{"action": "insert", "table": "users", "data": {"id": 1, "name": "Bharath"}}'
              className="flex-1 glass-card p-6 font-mono text-sm text-green-400 focus:outline-none focus:border-primary/50 resize-none w-full"
              spellCheck={false}
            />
            <div className="h-64 glass-card bg-onyx-900 border-onyx-600/30 p-6 overflow-auto">
              <h3 className="text-xs font-bold text-onyx-100/50 uppercase tracking-wider mb-2">Result</h3>
              <pre className="font-mono text-sm text-onyx-100/80">{result}</pre>
            </div>
          </div>
        ) : (
          <div className="h-full w-full">
            <VisualQueryBuilder onRun={handleRunQuery} />
            {result && (
              <div className="absolute bottom-8 right-8 w-96 glass-panel rounded-xl p-4 max-h-64 overflow-auto z-50">
                 <h3 className="text-xs font-bold text-onyx-100/50 uppercase tracking-wider mb-2">Pipeline Result</h3>
                 <pre className="font-mono text-xs text-onyx-100/80">{result}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
