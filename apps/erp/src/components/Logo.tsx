'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        className={`${sizeClasses[size]} w-auto aspect-square flex-shrink-0 transition-transform duration-200 hover:scale-105`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="erpLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="erpAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <rect x="5" y="5" width="90" height="90" rx="24" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        
        <path
          d="M 22 28 C 22 24.686 24.686 22 28 22 L 72 22 C 75.314 22 78 24.686 78 28 L 78 34 C 78 37.314 75.314 40 72 40 L 56 40 L 56 72 C 56 75.314 53.314 78 50 78 L 44 78 C 40.686 78 38 75.314 38 72 L 38 40 L 28 40 C 24.686 40 22 37.314 22 34 Z"
          fill="url(#erpLogoGrad)"
        />
        <circle cx="70" cy="70" r="10" fill="url(#erpAccentGrad)" />
      </svg>

      <div className="flex flex-col justify-center leading-none">
        <span className="font-extrabold text-base tracking-normal text-white block truncate">
          Techno ERP
        </span>
        <span className="text-xs font-medium text-amber-100/80 block mt-0.5 truncate tracking-normal">
          İdarəetmə Paneli
        </span>
      </div>
    </div>
  );
}
