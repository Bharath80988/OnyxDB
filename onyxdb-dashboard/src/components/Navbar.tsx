import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Database, Coffee, BookOpen, LayoutDashboard, Moon, Sun, LogIn, LogOut, ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true); // Default dark
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const initDark = storedTheme ? storedTheme === 'dark' : true;
    setIsDark(initDark);
    applyTheme(initDark);

    // Read session auth
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

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(newDark);
  };

  const applyTheme = (dark: boolean) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary' : 'text-gray-600 dark:text-onyx-100 hover:text-primary dark:hover:text-primary';
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-gray-200 dark:border-onyx-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1 group-hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="OnyxDB Logo" className="w-8 h-8 object-contain rounded-md shadow-sm" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">OnyxDB</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 font-sans font-medium">
            <Link to="/docs" className={`flex items-center gap-2 transition-colors ${isActive('/docs')}`}>
              <BookOpen className="w-4 h-4" />
              Docs
            </Link>
            <Link to="/app" className={`flex items-center gap-2 transition-colors ${isActive('/app')}`}>
              <LayoutDashboard className="w-4 h-4" />
              App
            </Link>
            <Link to="/status" className={`flex items-center gap-2 transition-colors ${isActive('/status')}`}>
              <Database className="w-4 h-4" />
              Status
            </Link>

            {/* Auth Session Status & Actions */}
            {userRole ? (
              <div className="flex items-center space-x-3 bg-onyx-800/40 px-3 py-1.5 rounded-full border border-onyx-700/60">
                <div className="flex items-center space-x-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">{username}</span>
                  <span className="text-gray-400">({userRole})</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full transition-colors text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}

            {/* Simple Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-onyx-700 transition-colors text-gray-600 dark:text-onyx-100"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <a 
              href="https://buymeacoffee.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-onyx-700 hover:bg-gray-200 dark:hover:bg-onyx-600 border border-gray-300 dark:border-onyx-600 rounded-full transition-all hover:border-primary/50 text-sm text-gray-800 dark:text-onyx-100"
            >
              <Coffee className="w-4 h-4 text-secondary" />
              Buy me a Coffee
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
