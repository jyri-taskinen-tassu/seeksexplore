/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Placeholder brand colors — overridden per destination via branding_config at runtime
        // for dynamic content; these are the static fallback used for chrome that can't be
        // themed at render time (e.g. splash, status bar).
        brand: {
          primary: '#1B4332',
          accent: '#D9A441',
        },
      },
    },
  },
  plugins: [],
};
