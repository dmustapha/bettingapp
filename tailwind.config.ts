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
      colors: {
        // CryptoWager Dark Purple Theme
        brand: {
          bg: {
            primary: '#0a0118',    // Deep purple background
            secondary: '#1a0b2e',  // Dark purple
            tertiary: '#2d1b4e',   // Medium dark purple
            card: '#1e0f3e',       // Card background
          },
          purple: {
            50: '#f5e6ff',
            100: '#e6ccff',
            200: '#d499ff',
            300: '#c266ff',
            400: '#b033ff',
            500: '#b855f5',  // Primary brand purple
            600: '#a044dd',
            700: '#8833bb',
            800: '#702299',
            900: '#581177',
          },
          magenta: {
            500: '#dd55f5',  // Gradient end
            600: '#c544dd',
          },
          success: '#00ff88',  // Bull/positive
          error: '#ff4466',    // Bear/negative
          warning: '#ffaa00',
          info: '#00d4ff',
        },
        // Keep existing for compatibility
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #b855f5 0%, #dd55f5 100%)',
        'gradient-purple-pink': 'linear-gradient(135deg, #b855f5 0%, #dd55f5 50%, #ff66cc 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0118 0%, #1a0b2e 50%, #2d1b4e 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(184, 85, 245, 0.1) 0%, rgba(221, 85, 245, 0.05) 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(184, 85, 245, 0.5)',
        'glow-purple-lg': '0 0 40px rgba(184, 85, 245, 0.6)',
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
