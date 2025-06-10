/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary))',
        secondary: 'hsl(var(--color-secondary))',
        tertiary: 'hsl(var(--color-tertiary))',
        accent: 'hsl(var(--color-accent))',
        success: 'hsl(var(--color-success))',
        danger: 'hsl(var(--color-danger))',
        'neutral-0': 'hsl(var(--color-neutral-0))',
        'neutral-900': 'hsl(var(--color-neutral-900))',
      },
      fontFamily: {
        party: ['Fredoka', 'Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}