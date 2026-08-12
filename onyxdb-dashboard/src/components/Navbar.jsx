import React from 'react';
import { motion } from 'framer-motion';

export default function Navbar({
  links = [],
  activeLink,
  onSelectLink,
  onOpenStudio,
  onOpenMobileMenu,
  isMobileMenuOpen
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex items-center justify-center shrink-0 z-30"
    >
      {/* ── Desktop Navbar Row ── */}
      <div className="w-full max-w-[720px] hidden min-[721px]:flex items-center justify-between gap-[clamp(18px,2.8vw,28px)]">
        {/* Logo Button */}
        <button
          onClick={() => onSelectLink('home')}
          className="w-[clamp(40px,4.4vw,46px)] h-[clamp(40px,4.4vw,46px)] rounded-full bg-white shadow-nav flex items-center justify-center transition-transform duration-300 hover:scale-[1.04] shrink-0"
          aria-label="OnyxDB Home"
        >
          <img
            src="/assets/logo.webp"
            alt=""
            width="52"
            height="52"
            className="w-[72%] h-[72%] object-contain"
          />
        </button>

        {/* White Nav Pill */}
        <nav
          aria-label="Main Navigation"
          className="flex-1 max-w-[430px] h-[clamp(44px,5.2vw,48px)] rounded-full bg-white shadow-nav px-2 py-1 flex items-center justify-around"
        >
          {links.map((link) => {
            const isActive = activeLink === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectLink(link.id)}
                className={`relative px-3 py-1.5 text-[clamp(13px,1.4vw,15px)] font-medium tracking-tight transition-opacity duration-200 ${
                  isActive ? 'nav-link-active' : 'text-navText opacity-50 hover:opacity-75'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Sign In / Studio Button */}
        <button
          onClick={onOpenStudio}
          className="h-[clamp(44px,5.2vw,48px)] px-5 rounded-full bg-pillDark text-signInText text-[clamp(13px,1.4vw,15px)] font-medium shadow-nav transition-all duration-200 hover:bg-[#323234] hover:text-white hover:-translate-y-[1px] shrink-0"
        >
          Onyx Studio
        </button>
      </div>

      {/* ── Mobile Navbar Row (<=720px) ── */}
      <div className="w-full flex min-[721px]:hidden items-center justify-between px-2">
        {/* Mobile Logo */}
        <button
          onClick={() => onSelectLink('home')}
          className="w-12 h-12 rounded-full bg-white shadow-nav flex items-center justify-center transition-transform hover:scale-[1.04]"
          aria-label="OnyxDB Home"
        >
          <img src="/assets/logo.webp" alt="" className="w-[72%] h-[72%] object-contain" />
        </button>

        {/* Mobile Burger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="w-12 h-12 rounded-full bg-pillDark flex items-center justify-center shadow-nav transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <div className="w-4.5 h-3.5 flex flex-col justify-between items-center">
            <span
              className={`w-4.5 h-[1.5px] bg-white rounded-full transition-transform duration-300 ${
                isMobileMenuOpen ? 'translate-y-[6.5px] rotate-45 !bg-white' : ''
              }`}
            />
            <span
              className={`w-4.5 h-[1.5px] bg-white rounded-full transition-opacity duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-4.5 h-[1.5px] bg-white rounded-full transition-transform duration-300 ${
                isMobileMenuOpen ? '-translate-y-[6.5px] -rotate-45 !bg-white' : ''
              }`}
            />
          </div>
        </button>
      </div>
    </motion.header>
  );
}
