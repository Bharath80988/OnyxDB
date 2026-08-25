import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, FileText, Cpu, Check, Copy, Play, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeatureDetailModal({ feature, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !feature) return null;

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInStudio = () => {
    if (feature.examplePayload) {
      sessionStorage.setItem('forge_studio_preset', JSON.stringify(feature.examplePayload));
    }
    onClose();
    navigate('/studio');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-[#0e0e11] border border-white/20 p-6 sm:p-8 shadow-2xl text-white z-10 flex flex-col"
        >
          {/* Subtle Glow Background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  {feature.tag || "Core Engine Specification"}
                </span>
                {feature.file && (
                  <span className="text-[10px] font-mono text-white/50 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-orange-400" /> {feature.file}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{feature.title}</h2>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            
            {/* Deep Explanation */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40 mb-2">
                Technical Specification &amp; Implementation Details
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {feature.longDesc || feature.desc}
              </p>
            </div>

            {/* Source Reference & Specs Grid */}
            {feature.specs && (
              <div className="grid sm:grid-cols-2 gap-4">
                {feature.specs.map((spec, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                    <div className="text-[10px] font-mono text-white/40 uppercase mb-1">{spec.label}</div>
                    <div className="text-xs font-mono font-bold text-orange-400">{spec.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Code / Payload Example */}
            {feature.codeExample && (
              <div className="bg-black/80 border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-white/5 px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/50">{feature.codeTitle || "Example Query / Configuration"}</span>
                  <button
                    onClick={() => copyCode(feature.codeExample)}
                    className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-orange-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-orange-400 overflow-x-auto whitespace-pre-wrap">
                  {feature.codeExample}
                </pre>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-white/40">ForgeQL v4.0.0 Architecture</span>
            <div className="flex gap-3">
              <button
                onClick={openInStudio}
                className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> Try in Forge Studio
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
