import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Coffee, BookOpen, LayoutDashboard, Palette, ChevronDown } from 'lucide-react';

const THEMES = [
  { id: 'light', label: 'Light', isDark: false },
  { id: 'dark', label: 'Dark', isDark: true },
  { id: 'synthwave', label: 'Purple (Synthwave)', isDark: true },
  { id: 'aqua', label: 'Ocean (Aqua)', isDark: false },
  { id: 'forest', label: 'Forest', isDark: true },
  { id: 'sunset', label: 'Sunset', isDark: true },
  { id: 'valentine', label: 'Rose (Valentine)', isDark: false },
  { id: 'night', label: 'Midnight (Night)', isDark: true },
  { id: 'coffee', label: 'Coffee', isDark: true },
  { id: 'emerald', label: 'Mint (Emerald)', isDark: false }
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState(THEMES[1]); // Default dark
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedThemeId = localStorage.getItem('theme');
    const theme = THEMES.find(t => t.id === storedThemeId) || THEMES[1];
    applyTheme(theme);
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTheme = (theme: typeof THEMES[0]) => {
    document.documentElement.setAttribute('data-theme', theme.id);
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme.id);
    setCurrentTheme(theme);
    setIsDropdownOpen(false);
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
            
            {/* Theme Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-onyx-700 transition-colors text-sm text-gray-600 dark:text-onyx-100"
              >
                <Palette className="w-4 h-4" />
                {currentTheme.label}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-onyx-800 border border-gray-200 dark:border-onyx-600 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${currentTheme.id === theme.id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-onyx-100 hover:bg-gray-100 dark:hover:bg-onyx-700'}`}
                    >
                      {theme.label}
                      {currentTheme.id === theme.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
