import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function CountUpValue({ target, decimals = 0, suffix = '' }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrame = null;
    const duration = 1500;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      setCurrent(easedProgress * target);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animationFrame = requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [target]);

  return (
    <span ref={ref} className="font-mono text-white text-xl sm:text-3xl tracking-tight tabular-nums font-extrabold drop-shadow-sm">
      {current.toFixed(decimals)}
      <span className="text-white/90 font-bold ml-1">{suffix}</span>
    </span>
  );
}

export default function Stats({ stats = [] }) {
  return (
    <div className="w-full max-w-[960px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-white/15 shrink-0 z-10">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.id || idx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 hover:border-white/30 transition-all shadow-xl"
        >
          <div className="font-display text-white text-2xl sm:text-3xl mb-1 font-bold">
            {stat.iconGlyph}
          </div>
          <CountUpValue target={stat.target} decimals={stat.decimals} suffix={stat.suffix} />
          <span className="text-xs sm:text-sm text-white/80 font-semibold mt-1 font-sans">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
