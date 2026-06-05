/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004ac6',
        'primary-container': '#2563eb',
        surface: '#f7f9fb',
        'on-surface': '#191c1e',
        'on-surface-variant': '#434655',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        outline: '#737686',
        tertiary: '#006242',
        error: '#ba1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#004ac6",
          "secondary": "#2563eb",
          "accent": "#006242",
          "neutral": "#191c1e",
          "base-100": "#ffffff",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#ba1a1a",
        },
      },
    ],
    darkTheme: "light",
  },
}