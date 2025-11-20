import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // CryptoWager Color Scheme from Figma
        brand: {
          bg: {
            primary: '#0D0221',    // Deep purple/navy background
            secondary: '#190B2F',  // Dark purple
            tertiary: '#2D1B4E',   // Medium purple
            card: '#1F0F3D',       // Card background
            footer: '#0A0118',     // Footer background (darker)
          },
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',  // Primary purple
            600: '#9333EA',
            700: '#7E22CE',
            800: '#6B21A8',
            900: '#581C87',
          },
          magenta: {
            400: '#F472B6',
            500: '#EC4899',  // Primary magenta/pink
            600: '#DB2777',
            700: '#BE185D',
          },
          // Main CTA button color (bright magenta)
          primary: '#E935E7',

          // Feature card gradients
          green: {
            from: '#10B981',
            to: '#34D399',
          },
          orange: {
            from: '#F97316',
            to: '#FB923C',
          },
          blue: {
            from: '#3B82F6',
            to: '#60A5FA',
          },
          pink: {
            from: '#EC4899',
            to: '#F472B6',
          },
          red: {
            from: '#EF4444',
            to: '#F87171',
          },
          violet: {
            from: '#A855F7',
            to: '#C084FC',
          },

          // Semantic colors
          success: '#10B981',  // Green for bull/positive
          error: '#EF4444',    // Red for bear/negative
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        // Keep existing for compatibility
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        // Primary gradients
        'gradient-primary': 'linear-gradient(135deg, #E935E7 0%, #F472B6 100%)',
        'gradient-purple': 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0D0221 0%, #190B2F 50%, #2D1B4E 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',

        // Feature card gradients
        'gradient-green': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'gradient-orange': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
        'gradient-pink': 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
        'gradient-red': 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        'gradient-violet': 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',

        // CTA section gradient
        'gradient-cta': 'linear-gradient(135deg, #7E22CE 0%, #BE185D 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-purple-lg': '0 0 40px rgba(168, 85, 247, 0.6)',
        'glow-primary': '0 0 20px rgba(233, 53, 231, 0.5)',
        'glow-primary-lg': '0 0 40px rgba(233, 53, 231, 0.6)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
