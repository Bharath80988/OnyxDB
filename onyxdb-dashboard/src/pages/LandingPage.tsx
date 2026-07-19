import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Play, ArrowRight, Zap, Globe, Database } from 'lucide-react';
import { MockEngine } from '../lib/MockEngine';

const DEFAULT_QUERY = `{
  "action": "insert",
  "table": "users",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "role": "Admin"
  }
}`;

const LandingPage: React.FC = () => {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleRunMock = async () => {
    setLoading(true);
    setResult('Executing...');
    try {
      const res = await MockEngine.execute(query);
      setResult(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Value Proposition */}
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border-primary/30 text-primary-100 text-sm font-medium">
              <Zap className="w-4 h-4 text-secondary" />
              <span>v0.2.0 is now live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              The Multi-Table <br />
              <span className="text-gradient">Omni-Channel</span> <br />
              Database
            </h1>
            
            <p className="text-xl text-onyx-100/70 max-w-lg font-sans">
              OnyxDB is a lightning-fast, local-first database built on B+ Trees. Fully offline capable, natively concurrent, and visual by design.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <Link to="/app" className="glow-button px-8 py-4 bg-primary text-white rounded-xl font-bold flex items-center gap-2">
                Open Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/docs" className="px-8 py-4 glass-panel rounded-xl font-bold hover:bg-onyx-700/50 transition-colors">
                Read the Docs
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-12">
              <div className="space-y-2">
                <Globe className="w-6 h-6 text-secondary" />
                <h3 className="font-bold text-lg">Offline First</h3>
                <p className="text-sm text-onyx-100/60">Works without internet, perfect for local dev environments.</p>
              </div>
              <div className="space-y-2">
                <Database className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg">Multi-Table</h3>
                <p className="text-sm text-onyx-100/60">Dynamically routes payloads to independent B+ Trees.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Glassmorphism Terminal */}
          <div className="relative z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-20 animate-pulse" />
            <div className="glass-card overflow-hidden relative">
              {/* Terminal Header */}
              <div className="bg-onyx-900/50 px-4 py-3 border-b border-onyx-600/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 text-xs text-onyx-100/50 font-mono">
                  <Terminal className="w-3 h-3" />
                  Try it Offline (Local Storage)
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-4 grid grid-rows-2 gap-4 h-[400px]">
                <div className="relative h-full">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-full bg-onyx-900/40 text-green-400 font-mono p-4 rounded-xl border border-onyx-600/30 focus:outline-none focus:border-primary/50 resize-none text-sm"
                    spellCheck={false}
                  />
                  <button 
                    onClick={handleRunMock}
                    disabled={loading}
                    className="absolute bottom-4 right-4 bg-primary hover:bg-primary/80 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold shadow-glow-primary"
                  >
                    <Play className="w-4 h-4" /> {loading ? 'Running...' : 'Run Query'}
                  </button>
                </div>
                
                <div className="bg-onyx-900/80 border border-onyx-600/30 rounded-xl p-4 font-mono text-sm overflow-auto text-onyx-100/80">
                  {result || '// Query results will appear here...'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;
