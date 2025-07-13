/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main party colors
        primary: 'hsl(var(--color-primary))',
        secondary: 'hsl(var(--color-secondary))',
        tertiary: 'hsl(var(--color-tertiary))',
        accent: 'hsl(var(--color-accent))',
        success: 'hsl(var(--color-success))',
        danger: 'hsl(var(--color-danger))',
        'neutral-0': 'hsl(var(--color-neutral-0))',
        'neutral-900': 'hsl(var(--color-neutral-900))',
        
        // Beer Olympics themed colors
        beer: {
          amber: '#F59E0B',
          gold: '#FBBF24',
          foam: '#FFFBEB',
          dark: '#92400E',
        },
        party: {
          pink: '#EC4899',
          cyan: '#06B6D4',
          yellow: '#EAB308',
          orange: '#EA580C',
          purple: '#8B5CF6',
          green: '#10B981',
        },
        // Fun gradient stops
        sunset: {
          from: '#FF6B6B',
          via: '#4ECDC4', 
          to: '#45B7D1'
        }
      },
      fontFamily: {
        party: ['Fredoka', 'Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Fredoka', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-party': 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FFA726 50%, #FF7043 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-beer': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)',
        'gradient-victory': 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
      },
      animation: {
        'bounce-in': 'bounce-in 0.6s ease-out',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'party-spin': 'party-spin 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'party-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(1)' },
          '75%': { transform: 'rotate(270deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        }
      },
      dropShadow: {
        'party': [
          '0 4px 8px rgba(255, 107, 107, 0.3)',
          '0 8px 16px rgba(78, 205, 196, 0.2)'
        ],
        'glow': '0 0 20px rgba(255, 107, 107, 0.5)',
      },
      boxShadow: {
        'party': '0 4px 8px rgba(255, 107, 107, 0.3), 0 8px 16px rgba(78, 205, 196, 0.2)',
        'glow': '0 0 20px rgba(255, 107, 107, 0.5)',
      }
    },
  },
  plugins: [],
}