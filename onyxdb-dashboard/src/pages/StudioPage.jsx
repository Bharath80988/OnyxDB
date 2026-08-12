import React, { useState, useEffect } from 'react';
import AppNavbar from '../components/AppNavbar';
import VisualQueryBuilder from '../VisualQueryBuilder';
import { executeRawQuery, getMetrics } from '../lib/api';
import { MockEngine } from '../lib/MockEngine';
import { Play, Database, Plus, Layers, RefreshCw, Activity, Check, Table, Server } from 'lucide-react';
import { motion } from 'framer-motion';

const PRESET_QUERIES = [
  { label: 'Insert Record', payload: '{\n  "action": "insert",\n  "table": "users",\n  "data": {\n    "id": 101,\n    "name": "Satoshi Nakamoto",\n    "role": "ADMIN",\n    "email": "satoshi@onyx.db"\n  }\n}' },
  { label: 'OQS Point Select', payload: '{\n  "oqs": "GET users 101"\n}' },
  { label: 'HNSW Vector Search', payload: '{\n  "action": "vector_search",\n  "table": "embeddings",\n  "vector": [0.12, 0.85, 0.43, -0.21],\n  "k": 5\n}' },
  { label: 'EXPLAIN CBO Profiler', payload: '{\n  "oqs": "EXPLAIN FIND users WHERE role = ADMIN"\n}' },
];

export default function StudioPage() {
  const [tab, setTab] = useState('visual'); // 'visual' | 'json' | 'create' | 'browser'
  const [query, setQuery] = useState(PRESET_QUERIES[0].payload);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Form for Table Creation
  const [tableName, setTableName] = useState('');
  const [pkField, setPkField] = useState('id');
  const [fkTable, setFkTable] = useState('');
  const [fkField, setFkField] = useState('');
  const [fkPolicy, setFkPolicy] = useState('CASCADE');
  const [createMsg, setCreateMsg] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch {
      setMetrics({
        status: "running",
        version: "4.0.0",
        table_count: 4,
        jvm_memory_used_mb: 128,
        active_indexes: ["primary_btree", "secondary_btree", "hnsw_vector"]
      });
    }
  };

  const handleRunQuery = async (queryPayload) => {
    setLoading(true);
    setResult('Executing payload against OnyxDB engine...');
    try {
      const data = await executeRawQuery(queryPayload);
      setResult(JSON.stringify(data, null, 2));
    } catch {
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

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    setLoading(true);
    setCreateMsg('');
    try {
      // Step 1: Insert initial schema record
      const initPayload = JSON.stringify({
        action: "insert",
        table: tableName.trim(),
        data: { [pkField]: 1, _initialized: true, created_at: new Date().toISOString() }
      });
      await handleRunQuery(initPayload);

      // Step 2: If FK defined, create foreign key
      if (fkTable.trim() && fkField.trim()) {
        const fkPayload = JSON.stringify({
          action: "create_foreign_key",
          table: tableName.trim(),
          field: fkField.trim(),
          parent_table: fkTable.trim(),
          parent_field: "id",
          on_delete: fkPolicy
        });
        await handleRunQuery(fkPayload);
      }

      setCreateMsg(`Successfully initialized table '${tableName}' in B+ Tree storage!`);
      setTableName('');
    } catch (err) {
      setCreateMsg(`Error creating table: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Studio Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" /> Onyx Studio <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">v4.0.0 IDE</span>
            </h1>
            <p className="text-xs text-white/50">Visual Node Builder, JSON Query Console, Schema Manager &amp; Database Creator</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#121214] border border-white/10 p-1 rounded-full text-xs">
            <button
              onClick={() => setTab('visual')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                tab === 'visual' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              Visual Builder
            </button>
            <button
              onClick={() => setTab('json')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                tab === 'json' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              JSON Console
            </button>
            <button
              onClick={() => setTab('create')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                tab === 'create' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              Create Table / DB
            </button>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 min-h-[600px] border border-white/10 rounded-2xl bg-[#08080a] flex overflow-hidden shadow-2xl">
          
          {/* Left Sidebar: Telemetry & Samples */}
          <div className="w-60 border-r border-white/10 p-4 bg-black/40 flex flex-col gap-6 shrink-0 hidden md:flex">
            <div>
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 mb-3">
                Sample Payloads
              </h3>
              <div className="space-y-1">
                {PRESET_QUERIES.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(p.payload);
                      setTab('json');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 truncate"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="mt-auto border-t border-white/10 pt-4">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 mb-2">
                Live Telemetry
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-white/40">Status:</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">HTTP API:</span>
                  <span className="text-white/70">8080</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">OWP TCP:</span>
                  <span className="text-white/70">8081</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Memory:</span>
                  <span className="text-white/70">mmap OS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Workspace */}
          <div className="flex-1 relative flex flex-col overflow-hidden">
            
            {/* TAB 1: VISUAL BUILDER */}
            {tab === 'visual' && (
              <div className="h-full w-full relative">
                <VisualQueryBuilder onRun={handleRunQuery} />
                {result && (
                  <div className="absolute bottom-4 right-4 w-96 bg-black/90 border border-white/15 rounded-xl p-4 max-h-56 overflow-auto z-50 text-xs shadow-2xl">
                    <div className="text-[10px] font-mono font-bold text-white/40 uppercase mb-1">Execution Result</div>
                    <pre className="font-mono text-white/80 whitespace-pre-wrap">{result}</pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: JSON CONSOLE */}
            {tab === 'json' && (
              <div className="p-6 h-full flex flex-col gap-4 overflow-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white/90">JSON Query Payload</h3>
                  <button
                    onClick={() => handleRunQuery(query)}
                    disabled={loading}
                    className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    {loading ? 'Executing...' : 'Execute Payload'}
                  </button>
                </div>

                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='{"action": "insert", "table": "users", "data": {"id": 1, "name": "OnyxDB"}}'
                  className="w-full h-56 bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-white/30 resize-none"
                  spellCheck={false}
                />

                <div className="flex-1 bg-black/80 border border-white/10 rounded-xl p-4 font-mono text-xs overflow-auto">
                  <div className="text-[10px] font-mono font-bold uppercase text-white/40 mb-2">
                    Result Output
                  </div>
                  <pre className="text-white/80 whitespace-pre-wrap">
                    {result || '// Query results will appear here...'}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: CREATE TABLE / DATABASE */}
            {tab === 'create' && (
              <div className="p-8 max-w-2xl mx-auto w-full flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" /> Create New Table &amp; Relational Schema
                </h3>
                <p className="text-xs text-white/60 mb-6">
                  Initializes a new B+ Tree storage file (`&lt;table_name&gt;.db`) with primary key and foreign key constraint rules.
                </p>

                {createMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400 mb-6">
                    {createMsg}
                  </div>
                )}

                <form onSubmit={handleCreateTable} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-white/40 mb-1">
                      Table Name
                    </label>
                    <input
                      type="text"
                      required
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      placeholder="e.g. orders, products, audit_logs"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-white/40 mb-1">
                      Primary Key Field Name
                    </label>
                    <input
                      type="text"
                      required
                      value={pkField}
                      onChange={(e) => setPkField(e.target.value)}
                      placeholder="id"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase text-white/70 mb-3">
                      Optional Foreign Key Constraint
                    </h4>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                          Parent Table
                        </label>
                        <input
                          type="text"
                          value={fkTable}
                          onChange={(e) => setFkTable(e.target.value)}
                          placeholder="users"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                          Child FK Field
                        </label>
                        <input
                          type="text"
                          value={fkField}
                          onChange={(e) => setFkField(e.target.value)}
                          placeholder="user_id"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">
                        On Delete Cascade Rule
                      </label>
                      <select
                        value={fkPolicy}
                        onChange={(e) => setFkPolicy(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="CASCADE" className="bg-black">CASCADE (Purge child records on parent delete)</option>
                        <option value="RESTRICT" className="bg-black">RESTRICT (Block parent delete if child records exist)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-all shadow-md mt-4 disabled:opacity-50"
                  >
                    {loading ? 'Initializing Table...' : 'Initialize Table'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
