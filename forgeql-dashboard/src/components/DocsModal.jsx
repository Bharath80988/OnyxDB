import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Terminal, Code2, Zap } from 'lucide-react';
import { frameworks } from '../data/docsContent';

export default function DocsModal({ isOpen, onClose }) {
  const [activeFw, setActiveFw] = useState('spring');

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
            className="w-full max-w-5xl h-[88vh] rounded-[24px] bg-[#0c0c0e] border border-white/15 flex flex-col overflow-hidden shadow-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-orange-400" />
                <h2 className="font-bold text-base tracking-tight">ForgeQL Documentation</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-60 border-r border-white/10 p-4 bg-black/30 overflow-y-auto shrink-0 hidden sm:block">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-3">
                  Framework Integrations
                </h3>
                <div className="space-y-1">
                  {frameworks.map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => setActiveFw(fw.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        activeFw === fw.id
                          ? 'bg-white text-black font-semibold'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {fw.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main doc content */}
              <div className="flex-1 p-6 overflow-y-auto bg-[#050505] space-y-8">
                {frameworks
                  .filter((fw) => fw.id === activeFw)
                  .map((fw) => (
                    <div key={fw.id} className="space-y-6">
                      <h2 className="text-2xl font-bold border-b border-white/10 pb-3">{fw.title} Integration</h2>
                      {fw.chapters.map((ch) => (
                        <div key={ch.id} className="space-y-3">
                          <h3 className="text-lg font-semibold text-white/90">{ch.title}</h3>
                          <div className="text-sm text-white/60">{ch.content}</div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
