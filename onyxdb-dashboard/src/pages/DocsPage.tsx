import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Package, Server, Code2, Zap, FileJson, ChevronRight } from 'lucide-react';
import { frameworks } from '../data/docsContent';
import { motion } from 'framer-motion';

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute('id') || '';
        }
      });
      
      setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-onyx-900 relative transition-colors duration-300">
      
      {/* Background Curves for Aesthetics (Inspired by MongoDB Docs) */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 1440 600" className="absolute top-0 left-0 w-full h-full text-primary/10 dark:text-primary/5 fill-current">
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,240C672,277,768,331,864,330.7C960,331,1056,277,1152,240C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row relative z-10 pt-8 pb-32">
        
        {/* Sticky Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 px-4 md:px-0 md:pr-8 mb-8 md:mb-0">
          <div className="sticky top-24 bg-white/80 dark:bg-onyx-800/80 backdrop-blur-xl border border-gray-200 dark:border-onyx-600/50 rounded-2xl p-6 shadow-xl max-h-[calc(100vh-8rem)] overflow-y-auto">
            
            <div className="space-y-6">
              
              {/* Getting Started */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-onyx-100/50 uppercase tracking-wider mb-3">Getting Started</h3>
                <div className="space-y-1">
                  <button 
                    onClick={() => scrollToSection('intro')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors relative ${activeSection === 'intro' ? 'text-primary font-bold bg-primary/10' : 'text-gray-600 dark:text-onyx-100/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-onyx-700/50'}`}
                  >
                    {activeSection === 'intro' && <div className="absolute left-[-1px] top-1 bottom-1 w-[2px] bg-primary rounded-r-md" />}
                    Introduction
                  </button>
                  <button 
                    onClick={() => scrollToSection('philosophy')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors relative ${activeSection === 'philosophy' ? 'text-primary font-bold bg-primary/10' : 'text-gray-600 dark:text-onyx-100/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-onyx-700/50'}`}
                  >
                    {activeSection === 'philosophy' && <div className="absolute left-[-1px] top-1 bottom-1 w-[2px] bg-primary rounded-r-md" />}
                    Philosophy & Architecture
                  </button>
                </div>
              </div>

              {/* Frameworks */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-onyx-100/50 uppercase tracking-wider mb-3">Framework Integrations</h3>
                {frameworks.map((framework) => (
                  <div key={framework.id} className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-onyx-100 mb-2 px-4 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-primary" /> {framework.title}
                    </h4>
                    <div className="space-y-1 border-l-2 border-gray-100 dark:border-onyx-700 ml-5">
                      {framework.chapters.map((chapter) => {
                        const sectionId = `${framework.id}-${chapter.id}`;
                        return (
                          <button
                            key={chapter.id}
                            onClick={() => scrollToSection(sectionId)}
                            className={`w-full text-left px-4 py-1.5 rounded-r-lg text-sm transition-colors relative ${
                              activeSection === sectionId ? 'text-primary font-bold bg-primary/5' : 'text-gray-500 dark:text-onyx-100/60 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            {activeSection === sectionId && <div className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-primary" />}
                            {chapter.title}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-4 md:px-8 max-w-4xl">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <section id="intro" className="mb-16 pt-4">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 dark:text-white">
                Welcome to the <span className="text-gradient">OnyxDB Docs</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-onyx-100/80 leading-relaxed mb-6 font-sans">
                OnyxDB is a document-oriented, operational database built from the ground up as an alternative to the relational database for modern applications. Unlike traditional databases, OnyxDB speaks pure JSON over HTTP, mapping naturally to the objects you use in your code.
              </p>
              
              <div className="bg-white/60 dark:bg-onyx-800/40 backdrop-blur-xl border border-gray-200 dark:border-onyx-600/50 rounded-2xl p-8 shadow-xl mt-12 grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-secondary" /> Why OnyxDB?
                  </h3>
                  <ul className="space-y-4 text-sm text-gray-600 dark:text-onyx-100/70">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      Lightning fast B+ Tree local storage
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      Native JSON over HTTP—no heavy SDKs required
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      Automatic multithreading for concurrent queries
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-100 dark:bg-onyx-900 p-4 rounded-xl border border-gray-200 dark:border-onyx-700 font-mono text-xs text-green-600 dark:text-green-400 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-2 text-gray-400"><FileJson className="w-4 h-4"/></div>
                  {`{\n  "action": "insert",\n  "table": "heroes",\n  "data": {\n    "id": 1,\n    "name": "Grace Hopper",\n    "location": {\n      "city": "Arlington"\n    }\n  }\n}`}
                </div>
              </div>
            </section>

            <section id="philosophy" className="mb-24 scroll-mt-24">
              <h2 className="text-3xl font-display font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-onyx-700 pb-4">Philosophy & Architecture</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-onyx-100/80">
                <p className="leading-relaxed">
                  The story of OnyxDB begins with a simple realization: modern applications don't always need the overhead of a massive distributed relational database when developing locally or deploying small-scale microservices. 
                </p>
                <p className="leading-relaxed">
                  We built OnyxDB on top of <strong>B+ Trees</strong> to ensure that range queries and direct lookups operate in logarithmic time, while disk I/O is minimized through an advanced LRU Buffer Pool.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Server className="w-5 h-5"/> Standalone Architecture</h4>
                  <p className="text-sm">OnyxDB runs as an independent JAR. It binds to port 8080 and exposes a single `/api/query` endpoint. This means your Python, Java, or PHP apps interact with it exactly the same way.</p>
                </div>
              </div>
            </section>

            {/* Render Framework Integrations */}
            <div className="space-y-24">
              {frameworks.map((framework) => (
                <div key={framework.id} className="pt-8">
                  <h2 className="text-4xl font-display font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                    <Package className="w-8 h-8 text-primary" /> {framework.title}
                  </h2>
                  <div className="space-y-16">
                    {framework.chapters.map((chapter) => (
                      <section 
                        key={chapter.id} 
                        id={`${framework.id}-${chapter.id}`} 
                        className="scroll-mt-24"
                      >
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-onyx-100/90">{chapter.title}</h3>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-onyx-100/80">
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
    </div>
  );
};

export default DocsPage;
