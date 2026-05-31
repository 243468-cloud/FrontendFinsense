/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0057FF',
          light: '#3D82FF',
          dark: '#003DB5',
        },
        accent: '#00C2FF',
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F0F5FF',
          3: '#E8EEFF',
        },
        text: {
          primary: '#0A0F1E',
          secondary: '#4A5578',
        },
        success: '#00C896',
        warning: '#FFB800',
        border: 'rgba(0,87,255,0.12)',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 87, 255, 0.10)',
        'card-hover': '0 8px 32px rgba(0, 87, 255, 0.18)',
        'blue-sm': '0 2px 8px rgba(0, 87, 255, 0.15)',
        'blue-lg': '0 8px 40px rgba(0, 87, 255, 0.25)',
        'accent': '0 4px 20px rgba(0, 194, 255, 0.30)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0057FF 0%, #00C2FF 100%)',
        'gradient-dark': 'linear-gradient(135deg, #003DB5 0%, #0057FF 100%)',
        'gradient-surface': 'linear-gradient(135deg, #FFFFFF 0%, #F0F5FF 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0057FF 0%, #00C2FF 50%, #00C896 100%)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
