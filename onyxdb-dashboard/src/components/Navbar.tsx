import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Coffee, BookOpen, LayoutDashboard, Moon, Sun } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true); // Default dark

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const initDark = storedTheme ? storedTheme === 'dark' : true;
    setIsDark(initDark);
    applyTheme(initDark);
  }, []);

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
          
          <div className="hidden md:flex items-center space-x-8 font-sans font-medium">
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
