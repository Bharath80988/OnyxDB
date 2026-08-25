import React from 'react';
import { motion } from 'framer-motion';

export default function ProductSwitcher({ subsystems, activeIndex, onChangeIndex }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-3 z-10">
      {subsystems.map((sub, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={sub.id}
            onClick={() => onChangeIndex(idx)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
              isActive
                ? 'bg-white text-black font-semibold shadow-md scale-105'
                : 'bg-[#28282a]/70 hover:bg-[#323234] text-white/70 hover:text-white border border-white/10'
            }`}
          >
            <span className={`text-[9px] font-bold ${isActive ? 'text-black/60' : 'text-white/40'}`}>
              0{idx + 1}
            </span>
            <span>{sub.shortName}</span>
            {isActive && (
              <motion.div
                layoutId="activeSubsystemPill"
                className="absolute inset-0 rounded-full bg-white -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
