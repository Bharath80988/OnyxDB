import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { queryExamples } from '../data/examplesData';
import { useNavigate } from 'react-router-dom';
import { Code, Copy, Check, Play, Layers, ArrowRight, Database, Sparkles, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExamplesPage() {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'AI & Vector Search', 'Relational Engine', 'Storage Engine', 'Indexing', 'Query Optimizer', 'Networking', 'Security', 'Observability'];

  const filteredExamples = selectedCategory === 'All'
    ? queryExamples
    : queryExamples.filter(q => q.category === selectedCategory);

  const copyPayload = (payload, id) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openInStudio = (ex) => {
    sessionStorage.setItem('forge_studio_preset', JSON.stringify(ex.payload));
    navigate('/studio');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-orange-400 text-xs font-mono mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> ForgeQL Query Playground &amp; Complex Challenges
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            Advanced Query <span className="text-white/60">Examples &amp; Diagrams</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Explore 15 production query challenges covering HNSW hybrid vector search, CBO EXPLAIN plans, foreign key cascades, and OWP wire protocol.
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Query Examples Cards */}
        <div className="space-y-8 mb-20">
          {filteredExamples.map((ex) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#121214] border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 transition-all shadow-xl"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                      {ex.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      ex.difficulty === 'Hard' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}>
                      {ex.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{ex.title}</h3>
                </div>

                <button
                  onClick={() => openInStudio(ex)}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-black" /> Open in Studio
                </button>
              </div>

              {/* Description & Engine Explanation */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-white/40 mb-2">Problem Statement</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{ex.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-white/40 mb-2">Engine Mechanics</h4>
                  <p className="text-sm text-white/60 leading-relaxed">{ex.explanation}</p>
                </div>
              </div>

              {/* Code Payload Box & Visual Node Flow Preview */}
              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Left: JSON Payload Code Block */}
                <div className="bg-black/80 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-white/5 px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-white/50">JSON Query Payload</span>
                    <button
                      onClick={() => copyPayload(ex.payload, ex.id)}
                      className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                    >
                      {copiedId === ex.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-orange-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-orange-400 overflow-x-auto flex-1">
                    {JSON.stringify(ex.payload, null, 2)}
                  </pre>
                </div>

                {/* Right: Visual Node Diagram Flow Preview */}
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div className="text-xs font-mono font-bold uppercase text-white/40 mb-3 flex items-center justify-between">
                    <span>Visual Node Diagram Flow</span>
                    <span className="text-[10px] text-orange-400">Node Graph</span>
                  </div>

                  {/* Simulated Flow Node Preview */}
                  <div className="flex items-center justify-center gap-2 py-4 px-2 overflow-x-auto">
                    {ex.nodes.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <div className="bg-[#18181c] border border-white/20 rounded-xl p-3 text-center min-w-[130px] shadow-lg">
                          <div className="text-[10px] font-mono text-orange-400 font-bold uppercase mb-1">
                            {node.type === 'selectNode' ? 'Select Node' : node.type === 'filterNode' ? 'Filter Node' : 'FQL Node'}
                          </div>
                          <div className="text-xs font-semibold text-white truncate">
                            {node.data.table || node.data.field || node.data.query}
                          </div>
                        </div>
                        {i < ex.nodes.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-white/40 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
                    <span>FQL: {ex.fqlEquivalent.substring(0, 32)}...</span>
                    <button
                      onClick={() => openInStudio(ex)}
                      className="text-orange-400 hover:underline"
                    >
                      Drag &amp; Drop in Studio &rarr;
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
