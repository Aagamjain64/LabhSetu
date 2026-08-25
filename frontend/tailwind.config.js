export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef4f8',
          100: '#d5e4ee',
          700: '#1f4e6b',
          800: '#163a50',
          900: '#0f2b3d',
        },
        saffron: {
          500: '#d97706',
          600: '#c2410c',
        },
        leaf: {
          600: '#15803d',
          700: '#166534',
        },
      },
      fontFamily: {
        sans: ['Source Sans 3', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
