import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Sliders, School, Sparkles, Rocket, Compass, Award } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useProgress } from '../../context/ProgressContext';

/**
 * BeanMachineNav — Top navigation bar with BeanMachine visual aesthetic,
 * fully dedicated to Junior Astronaut Artemis STEM Missions.
 *
 * Layout:
 *   Left:   Home | Missions ▾ | Curriculum ▾
 *   Center: [🚀] Junior Astronaut
 *   Right:  Badges | Telemetry | Cadet Status Pill | Settings | [Launch Mission]
 */

interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const leftLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  {
    label: 'Missions',
    href: '#missions',
    children: [
      { label: 'Rocket Launch', href: '#missions' },
      { label: 'Space Station Ops', href: '#missions' },
      { label: 'Lunar Base', href: '#missions' },
      { label: 'Mars Rover Coding', href: '#missions' },
      { label: 'Satellite Design', href: '#missions' },
      { label: 'Asteroid Deflection', href: '#missions' },
    ],
  },
  {
    label: 'Curriculum',
    href: '#disciplines',
    children: [
      { label: 'NGSS Science Standards', href: '#disciplines' },
      { label: 'Flight Physics Engine', href: '#disciplines' },
      { label: 'Educator Flight Deck', href: '#disciplines' },
    ],
  },
];

const rightLinks: NavLink[] = [
  { label: 'Badges', href: '#badges' },
  { label: 'Flight Log', href: '#missions' },
];

interface BeanMachineNavProps {
  onOpenSettings?: () => void;
  onOpenProfileSetup?: () => void;
  onBackToHome?: () => void;
  showBackToHome?: boolean;
}

export const BeanMachineNav: React.FC<BeanMachineNavProps> = ({
  onOpenSettings,
  onOpenProfileSetup,
  onBackToHome,
  showBackToHome = false,
}) => {
  const { profile, isTeacherMode, setTeacherMode } = useUser();
  const { totalXp, rankTitle } = useProgress();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Track scroll for navbar background transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpenDropdown(null);
      setMobileOpen(false);
    }
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(prev => (prev === label ? null : label));
  };

  const handleLinkClick = (href: string) => {
    if (onBackToHome && showBackToHome) {
      onBackToHome();
    }
    const target = href.replace('#', '');
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderNavLink = (link: NavLink) => {
    const hasChildren = link.children && link.children.length > 0;

    if (hasChildren) {
      return (
        <div key={link.label} className="relative" ref={dropdownRef}>
          <button
            onClick={() => toggleDropdown(link.label)}
            onKeyDown={handleKeyDown}
            className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors py-2 px-1 font-medium cursor-pointer"
            aria-expanded={openDropdown === link.label}
            aria-haspopup="true"
            data-testid={`nav-dropdown-${link.label.toLowerCase()}`}
          >
            {link.label}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                openDropdown === link.label ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openDropdown === link.label && (
            <div
              className="absolute top-full left-0 mt-2 w-52 bg-[#12153f]/95 backdrop-blur-xl border border-[#2e336d]/70 rounded-xl shadow-2xl shadow-black/50 py-2 z-50 animate-fadeIn"
              role="menu"
              data-testid={`dropdown-menu-${link.label.toLowerCase()}`}
            >
              {link.children!.map(child => (
                <a
                  key={child.label}
                  href={child.href}
                  role="menuitem"
                  className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => {
                    handleLinkClick(child.href);
                    setOpenDropdown(null);
                  }}
                >
                  {child.label}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a
        key={link.label}
        href={link.href}
        onClick={e => {
          if (link.href.startsWith('#')) {
            e.preventDefault();
            handleLinkClick(link.href);
          }
        }}
        className="text-sm text-slate-300 hover:text-white transition-colors py-2 px-1 font-medium"
      >
        {link.label}
      </a>
    );
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0b2e]/90 backdrop-blur-xl shadow-lg shadow-black/40 border-b border-[#1f245c]/50'
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
      data-testid="beanmachine-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left nav links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            {leftLinks.map(link => renderNavLink(link))}
          </div>

          {/* Center: Junior Astronaut Logo */}
          <div className="flex items-center gap-2.5" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <a
              href="#home"
              onClick={() => onBackToHome?.()}
              className="flex items-center gap-1.5 text-white font-bold text-lg tracking-wide hover:opacity-90 transition-opacity"
            >
              <span>Junior</span>
              <span className="text-purple-300">Astronaut</span>
            </a>
          </div>

          {/* Right nav links & Cadet controls — desktop */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5">
            {rightLinks.map(link => renderNavLink(link))}

            {/* Cadet Status Pill */}
            {profile && onOpenProfileSetup && (
              <button
                onClick={onOpenProfileSetup}
                className="flex items-center gap-2 bg-[#12153f]/80 hover:bg-[#1a1e5a] border border-[#2e336d]/60 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer group"
                title={`Cadet: ${profile.nickname} (${rankTitle})`}
              >
                <span className="text-sm group-hover:scale-110 transition-transform">{profile.avatar || '👨‍🚀'}</span>
                <span className="font-semibold text-slate-200 hidden lg:inline">{profile.nickname}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  {totalXp} XP
                </span>
              </button>
            )}

            {/* Educator Toggle */}
            <button
              onClick={() => setTeacherMode(!isTeacherMode)}
              className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                isTeacherMode
                  ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                  : 'bg-[#12153f]/80 border-[#2e336d]/60 text-slate-400 hover:text-white'
              }`}
              title="Toggle Educator Roster View"
            >
              <School className="w-4 h-4" />
            </button>

            {/* Settings button */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 bg-[#12153f]/80 hover:bg-[#1a1e5a] text-slate-300 hover:text-white rounded-lg border border-[#2e336d]/60 transition-colors cursor-pointer"
                title="Accessibility Settings"
                aria-label="Open Accessibility Panel"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Launch Mission CTA */}
            <a
              href="#missions"
              onClick={e => {
                e.preventDefault();
                handleLinkClick('#missions');
              }}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-space-950 text-sm font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
              data-testid="nav-contact-btn"
            >
              Launch Mission
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {profile && onOpenProfileSetup && (
              <button
                onClick={onOpenProfileSetup}
                className="p-1.5 bg-[#12153f] rounded-lg border border-[#2e336d]/60 text-sm"
              >
                {profile.avatar || '👨‍🚀'}
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              data-testid="mobile-menu-toggle"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          className="md:hidden bg-[#0a0b2e]/98 backdrop-blur-2xl border-t border-[#1f245c]/50 animate-fadeIn"
          data-testid="mobile-menu"
          onKeyDown={handleKeyDown}
        >
          <div className="px-4 py-4 space-y-2">
            {[...leftLinks, ...rightLinks].map(link => (
              <div key={link.label}>
                {link.children ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(link.label)}
                      className="w-full flex items-center justify-between text-sm text-slate-300 hover:text-white py-2 font-medium"
                      aria-expanded={openDropdown === link.label}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openDropdown === link.label && (
                      <div className="pl-4 space-y-1 animate-fadeIn">
                        {link.children.map(child => (
                          <a
                            key={child.label}
                            href={child.href}
                            className="block text-sm text-slate-400 hover:text-white py-1.5"
                            onClick={() => {
                              handleLinkClick(child.href);
                              setOpenDropdown(null);
                              setMobileOpen(false);
                            }}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={link.href}
                    className="block text-sm text-slate-300 hover:text-white py-2 font-medium"
                    onClick={() => {
                      handleLinkClick(link.href);
                      setMobileOpen(false);
                    }}
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}

            {/* Mobile actions */}
            <div className="pt-3 border-t border-[#1f245c]/50 flex items-center gap-3">
              <button
                onClick={() => { setTeacherMode(!isTeacherMode); setMobileOpen(false); }}
                className="flex-1 py-2 text-xs font-semibold bg-[#12153f] border border-[#2e336d]/60 rounded-lg text-slate-300 text-center"
              >
                {isTeacherMode ? "Cadet View" : "Teacher Hub"}
              </button>
              {onOpenSettings && (
                <button
                  onClick={() => { onOpenSettings(); setMobileOpen(false); }}
                  className="p-2 bg-[#12153f] border border-[#2e336d]/60 rounded-lg text-slate-300"
                  aria-label="Settings"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              )}
            </div>

            <a
              href="#missions"
              className="block w-full text-center mt-3 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-space-950 text-sm font-bold rounded-lg transition-colors"
              onClick={() => {
                handleLinkClick('#missions');
                setMobileOpen(false);
              }}
            >
              Launch Mission
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
