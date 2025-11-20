'use client';

interface ChartPreviewProps {
  trend?: 'up' | 'down';
  className?: string;
  color?: string;
}

export function ChartPreview({ trend = 'up', className = 'w-full h-16', color }: ChartPreviewProps) {
  const isUp = trend === 'up';
  const strokeColor = color || (isUp ? '#10B981' : '#EF4444');
  const fillColor = color || (isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)');

  // Generate chart data points
  const points = isUp
    ? '0,40 10,38 20,35 30,37 40,32 50,28 60,30 70,25 80,20 90,18 100,12'
    : '0,12 10,15 20,18 30,16 40,22 50,28 60,26 70,32 80,35 90,38 100,40';

  return (
    <svg className={className} viewBox="0 0 100 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: strokeColor, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: strokeColor, stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* Fill area under the line */}
      <polygon
        points={`${points} 100,50 0,50`}
        fill={`url(#gradient-${trend})`}
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots at key points */}
      <circle cx="50" cy={isUp ? '28' : '28'} r="2" fill={strokeColor} />
      <circle cx="100" cy={isUp ? '12' : '40'} r="2" fill={strokeColor} />
    </svg>
  );
}

export function MiniChart({ trend = 'up', className = 'w-20 h-8' }: ChartPreviewProps) {
  const isUp = trend === 'up';
  const strokeColor = isUp ? '#10B981' : '#EF4444';

  const points = isUp
    ? '0,20 25,18 50,12 75,14 100,8'
    : '0,8 25,10 50,16 75,14 100,20';

  return (
    <svg className={className} viewBox="0 0 100 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
