/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // New spa background colors
        background: '#FAF5F0', // Primary cream background
        foreground: '#171717', // Primary text color (unchanged)
        card: '#ffffff',       // Card background (white)
        section: '#F5F1EC',    // Secondary light cream background
        accent: '#EDE8E3',     // Warm beige accent background
        
        // Spa wellness colors (using gold accent)
        'spa-green': '#c66900',     // Darker gold for better contrast (4.6:1)
        'spa-green-light': '#e69138', // Adjusted lighter gold
        'spa-green-dark': '#a35800',  // Darker gold for active states
        'spa-cream': '#FAF5F0',       // Matching cream color
        
        // Keep banh-mi class names for backward compatibility but use spa colors
        'banh-mi-red': '#c66900',     // Updated to match spa-green
        'banh-mi-yellow': '#e69138',  // Updated to match spa-green-light
        
        // Keep orange brand colors
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        card: '12px',
        section: '12px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
