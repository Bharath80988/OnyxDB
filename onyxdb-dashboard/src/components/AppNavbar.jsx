import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, LogIn, LogOut, Terminal, Code2, Database } from 'lucide-react';
import SystemStatus from './SystemStatus';
import Logo from './Logo';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/platform', label: 'Platform' },
  { path: '/features', label: 'Features' },
  { path: '/architecture', label: 'Architecture' },
  { path: '/docs', label: 'Docs' },
  { path: '/studio', label: 'Studio' },
  { path: '/cli', label: 'CLI' },
  { path: '/examples', label: 'Examples' },
];

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    setUserRole(sessionStorage.getItem('onyx_user_role'));
    setUsername(sessionStorage.getItem('onyx_username'));
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('onyx_jwt_token');
    sessionStorage.removeItem('onyx_user_role');
    sessionStorage.removeItem('onyx_username');
    setUserRole(null);
    setUsername(null);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-2xl border-b border-white/10 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo Button */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <Logo size={28} />
            <span className="font-sans font-bold text-base tracking-tight text-white group-hover:text-white/90">
              OnyxDB
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1 shadow-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-1.5 text-xs font-medium tracking-tight transition-colors duration-200 ${
                    isActive ? 'text-black font-semibold' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="appleNavActivePill"
                      className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <SystemStatus className="mr-1" />

            {userRole ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs">
                <span className="font-semibold text-emerald-400 font-mono">{username}</span>
                <span className="text-white/40">({userRole})</span>
                <button
                  onClick={handleLogout}
                  className="ml-1 text-white/40 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            <Link
              to="/studio"
              className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all shadow-sm hover:scale-[1.02]"
            >
              Open Studio
            </Link>
          </div>

          {/* Mobile/Tablet Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="xl:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl overflow-hidden px-6 py-6"
          >
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-white text-black font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-2">
                <Link
                  to="/studio"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-full bg-white text-black font-semibold text-center text-sm shadow-md"
                >
                  Open Studio
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
