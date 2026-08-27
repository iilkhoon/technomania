'use client';

import React from 'react';

interface SparklineChartProps {
  data?: number[];
  color?: string;
  height?: number;
  width?: number;
  isUp?: boolean;
}

export default function SparklineChart({
  data = [12, 18, 14, 22, 19, 28, 25, 34, 30, 42],
  color = '#4f533b',
  height = 36,
  width = 120,
  isUp = true,
}: SparklineChartProps) {
  const strokeColor = isUp ? color : '#e11d48';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible flex-shrink-0">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <polygon points={areaPoints} fill={`url(#gradient-${color.replace('#', '')})`} />
      
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
