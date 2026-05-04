/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
        },
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          helper: 'var(--color-text-helper)',
          disabled: 'var(--color-text-disabled)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
        },
        bg: {
          DEFAULT: 'var(--color-bg)',
          light: 'var(--color-bg-light)',
        },
        mask: 'var(--color-mask)',
      },
      fontFamily: {
        base: ['var(--font-family-base)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        h1: ['var(--font-size-h1)', { lineHeight: 'var(--line-height-h1)', fontWeight: 'var(--font-weight-semibold)' }],
        h2: ['var(--font-size-h2)', { lineHeight: 'var(--line-height-h2)', fontWeight: 'var(--font-weight-semibold)' }],
        h3: ['var(--font-size-h3)', { lineHeight: 'var(--line-height-h3)', fontWeight: 'var(--font-weight-medium)' }],
        h4: ['var(--font-size-h4)', { lineHeight: 'var(--line-height-h4)', fontWeight: 'var(--font-weight-medium)' }],
        body1: ['var(--font-size-body1)', { lineHeight: 'var(--line-height-body1)' }],
        body2: ['var(--font-size-body2)', { lineHeight: 'var(--line-height-body2)' }],
        caption: ['var(--font-size-caption)', { lineHeight: 'var(--line-height-caption)' }],
        small: ['var(--font-size-small)', { lineHeight: 'var(--line-height-small)' }],
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        none: 'var(--shadow-none)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
      transitionTimingFunction: {
        'ease-in': 'var(--easing-ease-in)',
        'ease-out': 'var(--easing-ease-out)',
        'ease-in-out': 'var(--easing-ease-in-out)',
      },
    },
  },
  plugins: [],
}
