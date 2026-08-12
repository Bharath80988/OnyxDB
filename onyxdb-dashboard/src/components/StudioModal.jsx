import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Database, Activity, Code, Layers, Server, Terminal, ShieldCheck } from 'lucide-react';
import VisualQueryBuilder from '../VisualQueryBuilder';
import { executeRawQuery, getStats, getMetrics } from '../lib/api';
import { MockEngine } from '../lib/MockEngine';

const SAMPLE_QUERIES = [
  { label: 'Insert Record', payload: '{\n  "action": "insert",\n  "table": "users",\n  "data": {\n    "id": 101,\n    "name": "Satoshi Nakamoto",\n    "role": "ADMIN",\n    "email": "satoshi@onyx.db"\n  }\n}' },
  { label: 'OQS Point Select', payload: '{\n  "oqs": "GET users 101"\n}' },
  { label: 'HNSW Vector Search', payload: '{\n  "action": "vector_search",\n  "table": "embeddings",\n  "vector": [0.12, 0.85, 0.43, -0.21],\n  "k": 5\n}' },
  { label: 'EXPLAIN Profiler', payload: '{\n  "oqs": "EXPLAIN FIND users WHERE status = ACTIVE"\n}' },
];

export default function StudioModal({ isOpen, onClose }) {
  const [view, setView] = useState('json');
  const [query, setQuery] = useState(SAMPLE_QUERIES[0].payload);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchMetrics();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fetchMetrics = async () => {
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch {
      // Mock metrics
      setMetrics({
        status: "running",
        version: "4.0.0",
        table_count: 5,
        jvm_memory_used_mb: 128,
        active_indexes: ["primary_btree", "secondary_btree", "hnsw_vector"]
      });
    }
  };

  const handleRunQuery = async (queryPayload) => {
    setLoading(true);
    setResult('Executing query against OnyxDB engine...');
    try {
      const data = await executeRawQuery(queryPayload);
      setResult(JSON.stringify(data, null, 2));
    } catch {
      // Fallback to MockEngine for local browser testing
      try {
        const mockResult = await MockEngine.execute(queryPayload);
        setResult(JSON.stringify(mockResult, null, 2));
      } catch (e) {
        setResult(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-6xl h-[90vh] rounded-[24px] bg-[#0c0c0e] border border-white/15 flex flex-col overflow-hidden shadow-2xl text-white"
          >
            {/* ── Modal Top Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1">
                  <img src="/assets/logo.webp" alt="OnyxDB" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="font-bold text-base tracking-tight flex items-center gap-2">
                    Onyx Studio <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">v4.0.0 LIVE</span>
                  </h2>
                  <p className="text-xs text-white/50">Visual Node Builder &amp; JSON Engine Console</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switcher */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                  <button
                    onClick={() => setView('json')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      view === 'json' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    JSON Console
                  </button>
                  <button
                    onClick={() => setView('visual')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      view === 'visual' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Visual Pipeline
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar: Presets & Metrics */}
              <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-6 bg-black/30 shrink-0 hidden md:flex">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-3">
                    Sample Payloads
                  </h3>
                  <div className="space-y-1">
                    {SAMPLE_QUERIES.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(sample.payload);
                          setView('json');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 truncate"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="mt-auto">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-3">
                    System Telemetry
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40">Status:</span>
                      <span className="text-emerald-400 font-mono">ONLINE (Port 8080)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40">OWP TCP:</span>
                      <span className="text-white/80 font-mono">Port 8081</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40">Page Block:</span>
                      <span className="text-white/80 font-mono">8KB Slotted</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40">Memory:</span>
                      <span className="text-white/80 font-mono">mmap Zero-Copy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console / Builder View */}
              <div className="flex-1 relative flex flex-col bg-[#050505] overflow-hidden">
                {view === 'json' ? (
                  <div className="p-6 flex-1 flex flex-col gap-4 overflow-auto">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white/90">JSON Payload Editor</h3>
                      <button
                        onClick={() => handleRunQuery(query)}
                        disabled={loading}
                        className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        {loading ? 'Running...' : 'Execute Query'}
                      </button>
                    </div>

                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder='{"action": "insert", "table": "users", "data": {"id": 1, "name": "OnyxDB"}}'
                      className="w-full h-48 bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-white/30 resize-none"
                      spellCheck={false}
                    />

                    <div className="flex-1 min-h-[160px] bg-black/80 border border-white/10 rounded-xl p-4 font-mono text-xs overflow-auto">
                      <div className="text-[10px] uppercase font-semibold text-white/40 mb-2">
                        Query Execution Result
                      </div>
                      <pre className="text-white/80 whitespace-pre-wrap">
                        {result || '// Execute a query payload to view the live JSON response...'}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full relative">
                    <VisualQueryBuilder onRun={handleRunQuery} />
                    {result && (
                      <div className="absolute bottom-4 right-4 w-96 bg-black/90 border border-white/15 rounded-xl p-4 max-h-48 overflow-auto z-50 text-xs shadow-2xl">
                        <div className="text-[10px] font-semibold text-white/40 uppercase mb-1">Pipeline Result</div>
                        <pre className="font-mono text-white/80">{result}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
