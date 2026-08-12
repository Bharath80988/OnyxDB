import React from 'react';

export default function Logo({ size = 28, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-white transition-transform duration-300 group-hover:scale-105"
      >
        {/* Minimalist Faceted Onyx B+ Tree Emblem */}
        <polygon points="50,10 88,32 88,76 50,98 12,76 12,32" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" fill="rgba(255,255,255,0.03)" />
        <polygon points="50,22 76,37 76,68 50,83 24,68 24,37" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" fill="rgba(255,255,255,0.08)" />
        <polygon points="50,34 64,42 64,61 50,69 36,61 36,42" fill="currentColor" />
        
        {/* Subtle Node Connectors */}
        <circle cx="50" cy="10" r="4" fill="currentColor" />
        <circle cx="88" cy="32" r="4" fill="currentColor" />
        <circle cx="88" cy="76" r="4" fill="currentColor" />
        <circle cx="50" cy="98" r="4" fill="currentColor" />
        <circle cx="12" cy="76" r="4" fill="currentColor" />
        <circle cx="12" cy="32" r="4" fill="currentColor" />
      </svg>
    </div>
  );
}
