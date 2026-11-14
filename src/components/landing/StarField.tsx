import React, { useMemo } from 'react';

/**
 * StarField — Procedurally generates scattered star dots across the viewport.
 * Uses CSS absolute positioning with random sizes and opacities for a parallax feel.
 * Rendered once via useMemo to avoid re-randomising on every render.
 *
 * @param count  Number of stars to generate (default 120)
 * @param className  Additional wrapper classes
 */
interface StarFieldProps {
  count?: number;
  className?: string;
}

interface StarData {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  animationDelay: string;
}

export const StarField: React.FC<StarFieldProps> = ({ count = 120, className = '' }) => {
  const stars: StarData[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.15,
      animationDelay: `${Math.random() * 4}s`,
    }));
  }, [count]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      data-testid="star-field"
    >
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse-slow"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
    </div>
  );
};
