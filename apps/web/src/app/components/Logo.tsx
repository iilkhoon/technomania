'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export default function Logo({
  className = '',
  isDarkMode = false,
  size = 'md',
  showSubtitle = false,
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  };

  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textAccent = '#4f533b';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Instant Inline Vector SVG Icon Mark */}
      <svg
        className={`${sizeClasses[size]} w-auto aspect-square flex-shrink-0 transition-transform duration-200 hover:scale-105`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tmLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f533b" />
            <stop offset="100%" stopColor="#2c3021" />
          </linearGradient>
          <linearGradient id="tmAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container */}
        <rect x="5" y="5" width="90" height="90" rx="24" fill="url(#tmLogoGrad)" />
        
        {/* Abstract Stylized T & M Geometric Shapes */}
        <path
          d="M 22 28 C 22 24.686 24.686 22 28 22 L 72 22 C 75.314 22 78 24.686 78 28 L 78 34 C 78 37.314 75.314 40 72 40 L 56 40 L 56 72 C 56 75.314 53.314 78 50 78 L 44 78 C 40.686 78 38 75.314 38 72 L 38 40 L 28 40 C 24.686 40 22 37.314 22 34 Z"
          fill="white"
          opacity="0.95"
        />
        <circle cx="70" cy="70" r="10" fill="url(#tmAccentGrad)" />
      </svg>

      {/* Instant Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center text-lg sm:text-xl font-black tracking-tight">
          <span className={textPrimary}>TECHNO</span>
          <span style={{ color: textAccent }} className="ml-1 font-black">
            MANIA
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-0.5">
            Elektronika & Hissəli Satış
          </span>
        )}
      </div>
    </div>
  );
}
