import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  color?: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  showPercent = true,
  color = 'blue',
  height = 'md',
  className = ''
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const colorGradients = {
    blue: 'from-cyan-400 via-blue-500 to-indigo-600',
    amber: 'from-yellow-400 via-amber-500 to-orange-600',
    emerald: 'from-emerald-400 via-teal-500 to-green-600',
    rose: 'from-rose-400 via-red-500 to-pink-600',
    purple: 'from-purple-400 via-fuchsia-500 to-indigo-600'
  };

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            {label}
            {sublabel && <span className="text-slate-400 font-normal">({sublabel})</span>}
          </span>
          {showPercent && (
            <span className="font-mono text-sky-300 font-bold">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-space-900 border border-slate-700/80 rounded-full overflow-hidden p-0.5 shadow-inner ${heightClasses[height]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorGradients[color]} transition-all duration-300 ease-out shadow-sm`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

