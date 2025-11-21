'use client';

import { BitcoinLogo } from './CryptoIcons';

export function AnimatedBitcoinIcon() {
  return (
    <div className="flex items-center justify-center">
      {/* Outer glow ring that pulses */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 blur-xl opacity-50 animate-pulse"></div>

        {/* Rotating background ring */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border-2 border-yellow-500/30 animate-[spin_8s_linear_infinite]">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-400/10 to-orange-500/10 animate-[spin_6s_linear_infinite_reverse]"></div>
        </div>

        {/* Bitcoin coin with 3D flip animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl animate-[flip_4s_ease-in-out_infinite]"
               style={{
                 transformStyle: 'preserve-3d',
               }}>
            {/* Front shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>

            {/* Bitcoin logo */}
            <BitcoinLogo className="w-14 h-14 relative z-10" />

            {/* Bottom shadow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>

        {/* Orbiting particles */}
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
          <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
        </div>
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] [animation-delay:2.5s]">
          <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>
        </div>
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] [animation-delay:5s]">
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -ml-1 -mt-1 rounded-full bg-yellow-300 shadow-[0_0_6px_rgba(253,224,71,0.8)]"></div>
        </div>
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] [animation-delay:7.5s]">
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -ml-1 -mt-1 rounded-full bg-orange-300 shadow-[0_0_6px_rgba(253,186,116,0.8)]"></div>
        </div>
      </div>
    </div>
  );
}
