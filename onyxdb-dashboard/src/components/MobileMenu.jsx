import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';

export default function MobileMenu({ isOpen, onClose, links, activeLink, onSelectLink, onOpenStudio }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 720 && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleResize);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Menu Sheet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 left-4 right-4 z-50 rounded-[28px] bg-[#1a1a1c] border border-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Header in sheet */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1">
                  <img src="/assets/logo.webp" alt="OnyxDB" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-base tracking-tight">OnyxDB</span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#28282a] flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links Stagger */}
            <div className="flex flex-col gap-2 py-2">
              {links.map((link, idx) => {
                const isActive = activeLink === link.id;
                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    onClick={() => {
                      onSelectLink(link.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-left text-base font-medium transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white/40'}`} />
                  </motion.button>
                );
              })}
            </div>

            {/* CTA in Drawer */}
            <div className="pt-4 mt-2 border-t border-white/10">
              <button
                onClick={() => {
                  onOpenStudio();
                  onClose();
                }}
                className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg"
              >
                Open Onyx Studio
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
