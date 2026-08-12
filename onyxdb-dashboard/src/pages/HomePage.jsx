import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import BackgroundVideo from '../components/BackgroundVideo';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Footer from '../components/Footer';
import { onyxSubsystems, defaultHeroData } from '../data/onyxData';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Server, Cpu, Database, Network, ShieldCheck, ArrowRight, Zap, Play, Terminal, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ARCH_FLOW_STEPS = [
  {
    step: "01",
    title: "Dual Protocol Connection",
    desc: "Clients connect via HTTP REST (port 8080) or zero-copy 9-byte binary Onyx Wire Protocol (OWP) over TCP (port 8081).",
    icon: Server,
    color: "text-emerald-400"
  },
  {
    step: "02",
    title: "Multi-Reactor Dispatch",
    desc: "Acceptor thread receives socket connections and balances worker threads using Round-Robin event loop execution.",
    icon: Network,
    color: "text-cyan-400"
  },
  {
    step: "03",
    title: "mmap OS Memory Engine",
    desc: "MmapStorageManager maps 8KB slotted page storage files directly into OS virtual memory page cache without JVM GC pauses.",
    icon: Database,
    color: "text-amber-400"
  },
  {
    step: "04",
    title: "B+ Tree & HNSW Vector Engine",
    desc: "Executes O(log N) primary key binary slot searches and native Cosine Similarity KNN vector embedding graphs.",
    icon: Cpu,
    color: "text-purple-400"
  }
];

export default function HomePage() {
  const [activeSubsystemIdx, setActiveSubsystemIdx] = useState(0);
  const navigate = useNavigate();

  const currentSubsystem = onyxSubsystems[activeSubsystemIdx] || onyxSubsystems[0];

  return (
    <div className="relative min-h-screen w-full bg-black text-white antialiased flex flex-col justify-between font-sans">
      {/* Background Video */}
      <BackgroundVideo />

      {/* Unified Apple Navbar */}
      <AppNavbar />

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-[clamp(14px,3vw,32px)] py-8">
        <Hero
          heroData={defaultHeroData}
          subsystems={onyxSubsystems}
          activeSubsystemIdx={activeSubsystemIdx}
          onChangeSubsystem={setActiveSubsystemIdx}
          onOpenStudio={() => navigate('/studio')}
          onOpenDocs={() => navigate('/docs')}
        />
      </main>

      {/* Technical Operational Stats */}
      <div className="relative z-10 px-[clamp(14px,3vw,32px)] pb-12">
        <Stats stats={currentSubsystem.stats} />
      </div>

      {/* Handcrafted Human Developer Architecture Flow Section */}
      <section className="relative z-10 border-t border-white/10 bg-black/90 backdrop-blur-2xl py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-400 text-xs font-mono mb-4 border border-white/10">
              <Layers className="w-3.5 h-3.5" /> Handcrafted Java Core Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              How OnyxDB Executes <span className="text-white/60">Queries</span>
            </h2>
            <p className="text-base text-white/60 leading-relaxed">
              An authentic look into OnyxDB's zero-copy memory pipeline from client socket initialization to on-disk B+ Tree commits.
            </p>
          </div>

          {/* Architecture Flow Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {ARCH_FLOW_STEPS.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#121214] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${step.color}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white/30">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">{step.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
                </div>

                <div className="pt-4 mt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Pipeline Phase {idx + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Architecture Callout Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#121214] to-black border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div>
              <h3 className="text-xl font-bold mb-2">Deep Dive Into System Architecture</h3>
              <p className="text-sm text-white/60 max-w-2xl">
                Inspect Java class implementations for `MmapStorageManager`, `BTreeManager`, `HnswIndex`, and `WriteAheadLog`.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                to="/architecture"
                className="px-6 py-3 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all shadow-md"
              >
                Explore Architecture &rarr;
              </Link>
              <Link
                to="/examples"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                View Query Playground
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Page Footer */}
      <Footer />
    </div>
  );
}
