import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white pt-16 pb-12 font-sans shrink-0 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <Logo size={24} />
              <span className="text-sm font-bold tracking-tight text-white group-hover:text-white/90">OnyxDB</span>
            </Link>
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              A high-performance B+ Tree operational database with mmap OS virtual memory mapping, multi-reactor TCP networking, and HNSW vector search.
            </p>
            <div className="text-[10px] font-mono text-emerald-400">
              v4.0.0 Stable • Zero External Setup
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><Link to="/platform" className="hover:text-white transition-colors">Distribution Packages</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Core Capabilities</Link></li>
              <li><Link to="/architecture" className="hover:text-white transition-colors">System Architecture</Link></li>
              <li><Link to="/cli" className="hover:text-white transition-colors">Terminal REPL CLI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider mb-4">
              Developer Tools
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><Link to="/studio" className="hover:text-white transition-colors">Onyx Studio IDE</Link></li>
              <li><Link to="/examples" className="hover:text-white transition-colors">Query Playground</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Studio Auth Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider mb-4">
              Package Managers
            </h4>
            <ul className="space-y-2 text-xs text-white/60 font-mono">
              <li><a href="https://pypi.org/project/onyxdb/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">pip install onyxdb</a></li>
              <li><a href="https://www.npmjs.com/package/onyxdb" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">npx onyxdb</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Maven onyxdb-core</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider mb-4">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">B+ Tree 8KB Pages</a></li>
              <li><a href="#" className="hover:text-white transition-colors">HNSW Vector Graph</a></li>
              <li><a href="#" className="hover:text-white transition-colors">OWP TCP Socket (8081)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">WAL Crash Durability</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <div>&copy; 2026 OnyxDB, Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link to="/platform" className="hover:text-white transition-colors">SDKs</Link>
            <Link to="/studio" className="hover:text-white transition-colors">Studio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
