import React, { useEffect, useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { frameworks } from '../data/docsContent';
import { BookOpen, Zap, Server, Code2, FileJson } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach((section) => {
        const top = section.offsetTop;
        if (window.scrollY >= top - 150) {
          current = section.getAttribute('id') || '';
        }
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <AppNavbar />

      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row relative z-10 pt-8 pb-32 px-4 sm:px-6 lg:px-8">
        
        {/* Sticky Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 pr-0 md:pr-8 mb-8 md:mb-0">
          <div className="sticky top-24 bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-xl max-h-[calc(100vh-8rem)] overflow-y-auto">
            
            <div className="space-y-6">
              {/* Getting Started */}
              <div>
                <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider mb-3">
                  Getting Started
                </h3>
                <div className="space-y-1">
                  <button 
                    onClick={() => scrollToSection('intro')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeSection === 'intro' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Introduction
                  </button>
                  <button 
                    onClick={() => scrollToSection('philosophy')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeSection === 'philosophy' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Philosophy &amp; Architecture
                  </button>
                </div>
              </div>

              {/* Frameworks */}
              <div>
                <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider mb-3">
                  Framework Integrations
                </h3>
                {frameworks.map((framework) => (
                  <div key={framework.id} className="mb-4">
                    <h4 className="text-xs font-semibold text-white/80 mb-2 px-3 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" /> {framework.title}
                    </h4>
                    <div className="space-y-0.5 border-l border-white/10 ml-4">
                      {framework.chapters.map((chapter) => {
                        const sectionId = `${framework.id}-${chapter.id}`;
                        return (
                          <button
                            key={chapter.id}
                            onClick={() => scrollToSection(sectionId)}
                            className={`w-full text-left px-3 py-1.5 rounded-r-lg text-xs transition-colors ${
                              activeSection === sectionId ? 'text-emerald-400 font-bold bg-emerald-400/10' : 'text-white/50 hover:text-white'
                            }`}
                          >
                            {chapter.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <section id="intro" className="mb-16 pt-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Welcome to <span className="text-emerald-400">OnyxDB Documentation</span>
              </h1>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                OnyxDB is an operational document-oriented database built on B+ Trees, mmap zero-copy memory, and HNSW vector search. It speaks native JSON over HTTP (port 8080) and zero-copy OWP binary over TCP (port 8081).
              </p>
              
              <div className="bg-[#121214] border border-white/10 rounded-2xl p-8 shadow-xl grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" /> Why OnyxDB?
                  </h3>
                  <ul className="space-y-3 text-xs text-white/60">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      OS-Level memory mapping (`mmap`) bypassing JVM GC pauses
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      B+ Tree 8KB slotted page storage operating in O(log N) time
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      Native HNSW AI vector embedding search with Cosine Similarity
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      Relational foreign key rules (`RESTRICT` and `CASCADE`)
                    </li>
                  </ul>
                </div>

                <div className="bg-black/80 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-2 text-white/30"><FileJson className="w-4 h-4"/></div>
                  {`{\n  "action": "insert",\n  "table": "heroes",\n  "data": {\n    "id": 1,\n    "name": "Grace Hopper",\n    "location": {\n      "city": "Arlington"\n    }\n  }\n}`}
                </div>
              </div>
            </section>

            <section id="philosophy" className="mb-24 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Philosophy &amp; Architecture</h2>
              <div className="space-y-4 text-sm text-white/70 leading-relaxed">
                <p>
                  OnyxDB combines low-level operating system optimizations with modern vector AI capabilities.
                </p>
                <p>
                  We built OnyxDB on top of <strong>B+ Trees</strong> to ensure that direct lookups operate in logarithmic time, while disk I/O is minimized through `MmapStorageManager` and direct off-heap direct byte buffers.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
                  <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2"><Server className="w-5 h-5"/> Multi-Reactor TCP &amp; REST Server</h4>
                  <p className="text-xs text-white/70">OnyxDB runs as an independent executable or embedded dependency. It listens on port 8080 for HTTP REST queries and port 8081 for zero-copy TCP socket framing.</p>
                </div>
              </div>
            </section>

            {/* Framework Integrations */}
            <div className="space-y-24">
              {frameworks.map((framework) => (
                <div key={framework.id} className="pt-8">
                  <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                    <Code2 className="w-7 h-7 text-emerald-400" /> {framework.title}
                  </h2>
                  <div className="space-y-16">
                    {framework.chapters.map((chapter) => (
                      <section 
                        key={chapter.id} 
                        id={`${framework.id}-${chapter.id}`} 
                        className="scroll-mt-24"
                      >
                        <h3 className="text-xl font-bold mb-4 text-white/90">{chapter.title}</h3>
                        <div className="text-sm text-white/70">
                          {chapter.content}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
