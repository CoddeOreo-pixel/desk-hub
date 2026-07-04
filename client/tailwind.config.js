/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Lexend Mega"', 'sans-serif'],
        body: ['"Fira Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        surface: {
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        content: {
          primary: 'var(--content-primary)',
          secondary: 'var(--content-secondary)',
          tertiary: 'var(--content-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          muted: 'var(--accent-muted)',
          subtle: 'var(--accent-subtle)',
          orange: 'var(--accent-orange)',
          'orange-muted': 'var(--accent-orange-muted)',
          'orange-subtle': 'var(--accent-orange-subtle)',
        },
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        success: '#22C55E',
        danger: '#fb7185',
        warning: '#FF6B00',
      },
      borderRadius: {
        '2xl': '6px',
        '3xl': '8px',
      },
      transitionDuration: {
        '120': '120ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
