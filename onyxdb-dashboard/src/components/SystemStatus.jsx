import React, { useState, useEffect, useRef } from 'react';

export default function SystemStatus({ className = '' }) {
  const [timeStr, setTimeStr] = useState('');
  const formatterRef = useRef(
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  );

  useEffect(() => {
    const updateClock = () => {
      setTimeStr(formatterRef.current.format(new Date()));
    };
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={`flex items-center gap-3 text-xs tracking-tight font-medium text-white/70 ${className}`}>
      <div className="flex items-center gap-1.5 bg-[#28282a]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-mono tracking-wider text-white/90 uppercase">ONYXDB / ONLINE</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-white/60">
        <span>SYSTEM</span>
        <span className="text-white/90 tabular-nums">{timeStr || '12:00:00'}</span>
      </div>
    </div>
  );
}
