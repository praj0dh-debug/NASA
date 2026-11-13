import React from 'react';
import { soundEffects } from '../../lib/soundEffects';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundEffects.playClick();
      onClick?.(e);
    }
  };

  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide rounded-xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-space-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none shadow-md active:scale-95";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
    xl: "px-8 py-4 text-lg font-black tracking-wider gap-3"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50 border border-blue-400/30",
    secondary: "bg-space-800 hover:bg-space-700 text-slate-100 border border-slate-700 hover:border-slate-500 shadow-black/40",
    accent: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-orange-500/30 hover:shadow-orange-500/50",
    outline: "bg-transparent border-2 border-sky-400 text-sky-300 hover:bg-sky-400/10",
    danger: "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-600/30",
    ghost: "bg-transparent hover:bg-white/10 text-slate-300 hover:text-white"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

