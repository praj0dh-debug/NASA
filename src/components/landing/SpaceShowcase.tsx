import React from 'react';
import { StarField } from './StarField';

/**
 * SpaceShowcase — Bottom showcase section with a space-themed cityscape illustration.
 * Matches the lower portion of the BeanMachine reference: a dark scene with
 * a planet, floating structures, and a futuristic city under a dome.
 * All rendered as CSS/SVG — no external image assets required.
 */
export const SpaceShowcase: React.FC = () => {
  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      aria-hidden="true"
      data-testid="space-showcase"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12153f] via-[#16124a] to-[#0d0e2a]" />

      <StarField count={80} />

      {/* Glow effects */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-[10%] w-[200px] h-[200px] bg-purple-500/8 blur-[80px] rounded-full pointer-events-none" />

      {/* Scene container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Small secondary planet — top-right */}
        <div className="absolute right-[5%] sm:right-[10%] top-[5%] w-20 sm:w-28 aspect-square">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-500/30 via-indigo-400/20 to-purple-500/30 shadow-xl shadow-purple-500/10 relative overflow-hidden">
            <div className="absolute top-[30%] left-[20%] w-[45%] h-[8%] bg-slate-300/15 rounded-full rotate-[-10deg]" />
            <div className="absolute top-[55%] left-[30%] w-[35%] h-[6%] bg-indigo-300/10 rounded-full rotate-[5deg]" />
          </div>
        </div>

        {/* Dome cityscape SVG */}
        <svg
          viewBox="0 0 800 350"
          className="w-full h-auto max-w-4xl mx-auto"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="domeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#4a50a0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2a2d6e" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5558b8" />
              <stop offset="100%" stopColor="#2a2d6e" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dome arc */}
          <ellipse
            cx="400"
            cy="320"
            rx="250"
            ry="200"
            fill="url(#domeGrad)"
            stroke="#4a50a0"
            strokeWidth="0.5"
            opacity="0.5"
          />

          {/* Ground platform */}
          <rect x="100" y="280" width="600" height="70" rx="6" fill="#1a1d4a" />
          <rect x="150" y="280" width="500" height="2" fill="#4a50a0" opacity="0.5" />

          {/* Buildings / towers */}
          <rect x="250" y="160" width="22" height="120" rx="2" fill="url(#buildingGrad)" />
          <rect x="280" y="140" width="18" height="140" rx="2" fill="url(#buildingGrad)" />
          <rect x="310" y="180" width="25" height="100" rx="2" fill="url(#buildingGrad)" />
          <rect x="350" y="120" width="20" height="160" rx="2" fill="url(#buildingGrad)" />
          <rect x="380" y="150" width="28" height="130" rx="2" fill="url(#buildingGrad)" />
          <rect x="420" y="130" width="22" height="150" rx="2" fill="url(#buildingGrad)" />
          <rect x="450" y="170" width="18" height="110" rx="2" fill="url(#buildingGrad)" />
          <rect x="480" y="145" width="24" height="135" rx="2" fill="url(#buildingGrad)" />
          <rect x="510" y="165" width="20" height="115" rx="2" fill="url(#buildingGrad)" />

          {/* Central tower (tallest) */}
          <rect x="375" y="80" width="12" height="200" rx="2" fill="#5558b8" />
          <circle cx="381" cy="80" r="6" fill="url(#portalGlow)" />

          {/* Window lights on buildings */}
          {[260, 290, 320, 360, 395, 430, 460, 490, 520].map((x, i) => (
            <React.Fragment key={i}>
              <rect x={x} y={180 + (i % 3) * 25} width="3" height="3" rx="0.5" fill="#818cf8" opacity="0.8" />
              <rect x={x + 6} y={200 + (i % 2) * 30} width="3" height="3" rx="0.5" fill="#a5b4fc" opacity="0.6" />
              <rect x={x} y={230 + (i % 4) * 10} width="3" height="3" rx="0.5" fill="#c7d2fe" opacity="0.4" />
            </React.Fragment>
          ))}

          {/* Floating debris / asteroids */}
          <circle cx="180" cy="200" r="8" fill="#2a2d5a" stroke="#4a50a0" strokeWidth="0.5" />
          <circle cx="160" cy="240" r="5" fill="#222550" stroke="#3a3d80" strokeWidth="0.5" />
          <circle cx="620" cy="220" r="6" fill="#2a2d5a" stroke="#4a50a0" strokeWidth="0.5" />
          <circle cx="650" cy="260" r="4" fill="#222550" />

          {/* Glow beneath city */}
          <ellipse cx="400" cy="310" rx="180" ry="20" fill="url(#glowGrad)" />
        </svg>

        {/* Corner sparkle effects */}
        <div className="absolute bottom-[10%] left-[3%] w-2 h-2 bg-white rounded-full animate-pulse-slow opacity-60" />
        <div className="absolute top-[15%] left-[8%] w-1.5 h-1.5 bg-white rounded-full animate-pulse-slow opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[25%] right-[5%] w-2.5 h-2.5 bg-white rounded-full animate-pulse-slow opacity-50" style={{ animationDelay: '2s' }} />

        {/* Four-pointed star decorations */}
        <svg className="absolute top-[5%] right-[3%] w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5Z" />
        </svg>
        <svg className="absolute bottom-[15%] left-[2%] w-6 h-6 text-white/20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5Z" />
        </svg>
      </div>
    </section>
  );
};
