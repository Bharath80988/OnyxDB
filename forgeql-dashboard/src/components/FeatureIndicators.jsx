import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureIndicators({ indicators = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono font-bold tracking-wider text-white my-3"
    >
      {indicators.map((ind, i) => (
        <span
          key={i}
          className="bg-white/10 border border-white/20 px-3 py-1 rounded-full hover:bg-white/20 transition-colors duration-200 cursor-default select-none shadow-sm"
        >
          {ind}
        </span>
      ))}
    </motion.div>
  );
}
