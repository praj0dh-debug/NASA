import React from 'react';
import { StarField } from './StarField';
import { Rocket } from 'lucide-react';

/**
 * HeroSection — Full-viewport hero matching the BeanMachine reference design aesthetic,
 * focused 100% on NASA Junior Astronaut mission training.
 *
 * Visual elements:
 * - Deep cosmic blue-purple gradient background with procedural star field
 * - Pure CSS/SVG illustrated planet, mountains, floating islands, and spacecraft
 * - Mission headline: "Train Like a NASA Astronaut. Master the Cosmos."
 * - Subtitle: "Authentic aerospace engineering simulators & STEM challenges for future explorers"
 * - Mint-green "Launch Mission" CTA button
 */

interface HeroSectionProps {
  onLaunchProject?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchProject }) => {
  const handleLaunchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLaunchProject) {
      onLaunchProject();
    } else {
      const el = document.getElementById('missions');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-start pt-32 sm:pt-40 overflow-hidden"
      aria-label="Hero section"
      data-testid="hero-section"
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b2e] via-[#12153f] to-[#1a1050]" />

      {/* Star field */}
      <StarField count={150} />

      {/* Atmospheric glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" aria-hidden="true" />

      {/* Hero text content — Junior Astronaut Mission Focused */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/15 border border-purple-400/30 rounded-full text-purple-300 text-xs font-semibold mb-5 backdrop-blur-md">
          <Rocket className="w-3.5 h-3.5 text-purple-400" />
          <span>NASA Artemis STEM Flight Deck</span>
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white leading-tight tracking-tight mb-5 sm:mb-6 font-sans"
          data-testid="hero-headline"
        >
          Train Like a NASA Astronaut.
          <br className="hidden sm:block" />
          {' '}Master the Cosmos.
        </h1>

        <p className="text-slate-400 text-sm sm:text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Authentic aerospace engineering simulators, orbital physics & Next Generation Science challenges for future space explorers.
        </p>

        <a
          href="#missions"
          onClick={handleLaunchClick}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-space-950 font-bold text-sm rounded-lg transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 cursor-pointer"
          data-testid="hero-cta"
        >
          <Rocket className="w-4 h-4" />
          <span>Launch Mission</span>
        </a>
      </div>

      {/* Illustrated scene — CSS planet, mountains, spacecraft matching visual reference */}
      <div className="relative z-[5] w-full mt-auto" aria-hidden="true">
        {/* Large planet (top-left area) */}
        <div className="absolute -left-16 sm:left-8 md:left-[8%] bottom-[30%] sm:bottom-[25%] w-48 sm:w-64 md:w-80 lg:w-96 aspect-square">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 via-blue-500 to-purple-700 shadow-2xl shadow-blue-500/30 relative overflow-hidden">
            {/* Planet surface details */}
            <div className="absolute top-[20%] left-[15%] w-[40%] h-[12%] bg-blue-300/25 rounded-full rotate-[-15deg] blur-[2px]" />
            <div className="absolute top-[45%] left-[25%] w-[55%] h-[8%] bg-indigo-300/20 rounded-full rotate-[-10deg] blur-[1px]" />
            <div className="absolute top-[65%] right-[10%] w-[30%] h-[10%] bg-purple-300/15 rounded-full rotate-[5deg] blur-[2px]" />
            {/* Planetary ring/orbit */}
            <div className="absolute top-[40%] -left-[20%] w-[140%] h-[6%] border border-blue-300/30 rounded-full rotate-[-8deg]" />
          </div>
        </div>

        {/* Mountain range silhouette */}
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-auto relative z-[2]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a2d6e" />
              <stop offset="100%" stopColor="#1a1050" />
            </linearGradient>
            <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d3f8e" />
              <stop offset="100%" stopColor="#1f1660" />
            </linearGradient>
            <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c8d0f0" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6e78b8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background mountain layer */}
          <path
            d="M0,260 L120,180 L200,220 L350,100 L450,160 L580,80 L700,150 L800,90 L920,170 L1050,110 L1150,190 L1280,120 L1380,180 L1440,140 L1440,320 L0,320 Z"
            fill="url(#mountainGrad1)"
            opacity="0.7"
          />

          {/* Foreground mountain layer */}
          <path
            d="M0,280 L100,230 L250,260 L400,170 L500,220 L650,140 L750,200 L880,130 L1000,190 L1100,150 L1250,210 L1350,160 L1440,200 L1440,320 L0,320 Z"
            fill="url(#mountainGrad2)"
          />

          {/* Snow-capped peaks */}
          <path
            d="M350,100 L365,115 L335,115 Z"
            fill="url(#snowGrad)"
          />
          <path
            d="M580,80 L598,98 L562,98 Z"
            fill="url(#snowGrad)"
          />
          <path
            d="M800,90 L815,107 L785,107 Z"
            fill="url(#snowGrad)"
          />
          <path
            d="M1050,110 L1065,125 L1035,125 Z"
            fill="url(#snowGrad)"
          />

          {/* Terrain detail lines */}
          <path
            d="M0,300 Q200,280 400,290 Q600,295 800,285 Q1000,290 1200,295 Q1350,290 1440,295"
            stroke="#4a4d9e"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
        </svg>

        {/* Floating islands */}
        <div className="absolute right-[15%] bottom-[55%] z-[3]">
          <div className="w-20 sm:w-28 h-8 sm:h-10 bg-gradient-to-b from-indigo-500/60 to-purple-600/40 rounded-[50%] animate-float shadow-lg shadow-purple-500/10" />
          <div className="w-3 sm:w-4 h-8 sm:h-12 bg-emerald-400/40 rounded-full mx-auto -mt-3 sm:-mt-4" />
        </div>

        <div className="absolute left-[60%] bottom-[65%] z-[3]">
          <div className="w-14 sm:w-20 h-6 sm:h-8 bg-gradient-to-b from-blue-500/50 to-indigo-600/30 rounded-[50%] animate-float shadow-md" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Spacecraft 1 — upper right */}
        <div className="absolute right-[10%] sm:right-[18%] top-[10%] sm:top-[5%] z-[4] animate-float" style={{ animationDelay: '0.8s' }}>
          <svg width="60" height="36" viewBox="0 0 60 36" fill="none" className="drop-shadow-lg w-10 sm:w-[60px]">
            <path d="M5 18 L25 8 L55 16 L55 20 L25 28 Z" fill="#8690c0" opacity="0.8" />
            <path d="M25 8 L55 16 L55 18 L25 18 Z" fill="#a0a8d0" opacity="0.6" />
            <path d="M10 17 L8 14 L14 16 Z" fill="#6670a0" opacity="0.5" />
            <path d="M10 19 L8 22 L14 20 Z" fill="#6670a0" opacity="0.5" />
          </svg>
        </div>

        {/* Spacecraft 2 — lower left */}
        <div className="absolute left-[20%] sm:left-[30%] bottom-[45%] z-[4] animate-float" style={{ animationDelay: '2s' }}>
          <svg width="40" height="24" viewBox="0 0 60 36" fill="none" className="drop-shadow-md opacity-60 w-6 sm:w-10">
            <path d="M5 18 L25 8 L55 16 L55 20 L25 28 Z" fill="#8690c0" />
            <path d="M25 8 L55 16 L55 18 L25 18 Z" fill="#a0a8d0" opacity="0.7" />
          </svg>
        </div>

        {/* Small moon / celestial body — bottom left */}
        <div className="absolute left-[5%] bottom-[20%] w-12 sm:w-16 aspect-square rounded-full bg-gradient-to-br from-slate-400/20 to-slate-600/10 blur-[1px] z-[1]" />
      </div>
    </section>
  );
};
