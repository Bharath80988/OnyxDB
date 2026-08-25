import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { Terminal, Play, Copy, Check, Code, Server, Zap } from 'lucide-react';
import { executeRawQuery } from '../lib/api';

const FQL_COMMANDS = [
  { cmd: 'GET <table> <id>', desc: 'Point lookup by primary key', example: 'GET users 101' },
  { cmd: 'FIND <table> WHERE <field> = <val>', desc: 'Filtered table search', example: 'FIND users WHERE status = ACTIVE' },
  { cmd: 'EXPLAIN <query>', desc: 'CBO plan and I/O estimate', example: 'EXPLAIN FIND users WHERE status = ACTIVE' },
  { cmd: 'INSERT INTO <table> <json>', desc: 'Insert a record', example: 'INSERT INTO users {"id": 101, "name": "Satoshi"}' },
  { cmd: 'UPDATE <table> <id> SET <field> = <val>', desc: 'Update record field', example: 'UPDATE users 101 SET status = INACTIVE' },
  { cmd: 'DELETE <table> <id>', desc: 'Delete a record', example: 'DELETE users 101' },
  { cmd: 'INDEX <table> ON <field>', desc: 'Create secondary B+ Tree index', example: 'INDEX users ON email' },
];

export default function CliPage() {
  const [inputCmd, setInputCmd] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'sys', text: 'ForgeQL Terminal REPL v4.0.0' },
    { type: 'sys', text: 'Connected to localhost:8080 (REST) and port 8081 (OWP TCP)' },
    { type: 'sys', text: 'Type any FQL query (e.g. GET users 101) or SQL command.' },
    { type: 'sys', text: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleRunCmd = async (e) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;

    const cmd = inputCmd.trim();
    setInputCmd('');
    setLoading(true);

    const newLogs = [...terminalOutput, { type: 'cmd', text: `forgeql> ${cmd}` }];
    setTerminalOutput(newLogs);

    const startTime = performance.now();
    try {
      const res = await executeRawQuery(cmd);
      const executionTime = (performance.now() - startTime).toFixed(2);
      setTerminalOutput(prev => [
        ...prev,
        { type: 'res', text: JSON.stringify(res, null, 2) },
        { type: 'bench', text: `[Benchmark: Executed in ${executionTime}ms]` },
        { type: 'sys', text: '' }
      ]);
    } catch (err) {
      setTerminalOutput(prev => [
        ...prev,
        { type: 'err', text: `Error: ${err.message}` },
        { type: 'sys', text: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-orange-400 text-xs font-mono mb-4 border border-white/10">
            <Terminal className="w-3.5 h-3.5" /> Forge Interactive Terminal CLI
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            Command-Line <span className="text-white/60">REPL Shell</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Execute FQL queries, inspect Cost-Based Optimizer execution plans, and benchmark engine queries in real-time.
          </p>
        </div>

        {/* Terminal REPL Window */}
        <div className="bg-[#08080a] border border-white/15 rounded-2xl overflow-hidden shadow-2xl mb-16 max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-black/60 px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-white/50 ml-2">forge-cli — v4.0.0</span>
            </div>
            <span className="text-[10px] font-mono text-orange-400 uppercase">Interactive Shell</span>
          </div>

          {/* Body */}
          <div className="p-6 font-mono text-xs min-h-[360px] max-h-[500px] overflow-y-auto space-y-1 bg-black/90">
            {terminalOutput.map((line, idx) => {
              if (line.type === 'cmd') return <div key={idx} className="text-white font-bold">{line.text}</div>;
              if (line.type === 'res') return <pre key={idx} className="text-orange-400 whitespace-pre-wrap">{line.text}</pre>;
              if (line.type === 'bench') return <div key={idx} className="text-white/40 italic">{line.text}</div>;
              if (line.type === 'err') return <div key={idx} className="text-red-400">{line.text}</div>;
              return <div key={idx} className="text-white/50">{line.text}</div>;
            })}
          </div>

          {/* Input Prompt */}
          <form onSubmit={handleRunCmd} className="border-t border-white/10 bg-black/60 p-3 flex items-center gap-2">
            <span className="text-orange-400 font-mono text-xs font-bold pl-2">forgeql&gt;</span>
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              placeholder="e.g. GET users 101 or EXPLAIN FIND orders WHERE amount > 500"
              className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/30"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Run'}
            </button>
          </form>
        </div>

        {/* FQL Command Reference */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Code className="w-5 h-5 text-orange-400" /> Forge Query Syntax (FQL) Reference
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-white/10 uppercase text-white/40">
                  <th className="py-2.5 px-3">Command Syntax</th>
                  <th className="py-2.5 px-3">Engine Behavior</th>
                  <th className="py-2.5 px-3">Example Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {FQL_COMMANDS.map((c, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-bold text-white">{c.cmd}</td>
                    <td className="py-3 px-3 text-white/60">{c.desc}</td>
                    <td className="py-3 px-3 text-orange-400">{c.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
