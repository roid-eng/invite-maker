/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg:      'var(--theme-bg)',
          surface: 'var(--theme-surface)',
          primary: 'var(--theme-primary)',
          accent:  'var(--theme-accent)',
          text:    'var(--theme-text)',
          muted:   'var(--theme-muted)',
          border:  'var(--theme-border)',
        },
      },
      fontFamily: {
        sans:     ['var(--font-noto-sans-kr)',      'sans-serif'],
        myeongjo: ['var(--font-nanum-myeongjo)',    'serif'],
        dodum:    ['var(--font-gowun-dodum)',        'sans-serif'],
      },
      keyframes: {
        falling: {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)',   opacity: '0.6' },
          '100%': { transform: 'translateY(320px) rotate(360deg)', opacity: '0'   },
        },
      },
    },
  },
  plugins: [],
}
