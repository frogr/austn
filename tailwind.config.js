/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/views/**/*.{html,erb,haml}',
    './app/javascript/**/*.{js,jsx}',
    './app/assets/stylesheets/**/*.css'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: {
          DEFAULT: 'var(--accent-color)',
          hover: 'var(--accent-hover)',
          secondary: 'var(--accent-secondary)'
        },
        success: 'var(--success-color)',
        warning: 'var(--warning-color)',
        danger: 'var(--danger-color)'
      },
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        card: 'var(--bg-card)',
        glass: 'var(--bg-glass)',
        'glass-thick': 'var(--bg-glass-thick)'
      },
      borderColor: {
        glass: 'var(--border-glass)',
        primary: 'var(--border-color)'
      },
      backdropBlur: {
        DEFAULT: 'var(--backdrop-blur)'
      }
    }
  },
  plugins: []
}