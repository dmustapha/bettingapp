'use client';

export function CryptoWagerLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer hexagon ring */}
        <path
          d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z"
          fill="url(#logo-gradient-outer)"
          stroke="url(#logo-stroke)"
          strokeWidth="2"
        />

        {/* Inner hexagon */}
        <path
          d="M50 20 L72 32 L72 58 L50 70 L28 58 L28 32 Z"
          fill="url(#logo-gradient-inner)"
        />

        {/* Dice dots pattern */}
        <circle cx="42" cy="40" r="3" fill="white" opacity="0.9" />
        <circle cx="58" cy="40" r="3" fill="white" opacity="0.9" />
        <circle cx="50" cy="50" r="3" fill="white" opacity="0.9" />
        <circle cx="42" cy="60" r="3" fill="white" opacity="0.9" />
        <circle cx="58" cy="60" r="3" fill="white" opacity="0.9" />

        {/* Crypto coin accent */}
        <circle cx="50" cy="50" r="12" fill="none" stroke="url(#logo-accent)" strokeWidth="1.5" opacity="0.6" />

        <defs>
          {/* Main gradient */}
          <linearGradient id="logo-gradient-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          <linearGradient id="logo-gradient-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>

          <linearGradient id="logo-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E935E7" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>

          <linearGradient id="logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>

      {/* Animated glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-purple-500 to-brand-magenta-500 opacity-30 blur-md animate-pulse"></div>
    </div>
  );
}
