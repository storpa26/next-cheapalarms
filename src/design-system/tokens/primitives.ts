/**
 * Primitive Design Tokens
 * Raw values with no semantic meaning
 * Used as building blocks for semantic tokens and Tailwind config
 */

export const primitives = {
  colors: {
    // Brand colors - Pink (Primary)
    pink: {
      50: '343 49% 98%',
      100: '343 49% 95%',
      200: '343 49% 90%',
      300: '343 49% 80%',
      400: '343 49% 65%',
      500: '343 49% 58%',  // #c95375 - Primary brand color
      600: '343 49% 52%',  // Hover state
      700: '343 49% 45%',  // Active state
      800: '343 49% 35%',
      900: '343 49% 25%',
    },
    // Brand colors - Teal (Secondary)
    teal: {
      50: '188 52% 98%',
      100: '188 52% 95%',
      200: '188 52% 90%',
      300: '188 52% 80%',
      400: '188 52% 60%',
      500: '188 52% 37%',  // #288896 - Secondary brand color
      600: '188 52% 30%',  // Hover state
      700: '188 52% 25%',
      800: '188 52% 20%',
      900: '188 52% 15%',
    },
    // Neutral grays
    gray: {
      50: '0 0% 98%',
      100: '0 0% 96%',
      200: '0 0% 90%',
      300: '0 0% 80%',
      400: '0 0% 65%',
      500: '0 0% 50%',
      600: '0 0% 40%',
      700: '0 0% 30%',
      800: '0 0% 20%',
      900: '0 0% 10%',
    },
    // Semantic colors
    success: {
      500: '142 76% 36%',
      600: '142 76% 30%',
    },
    error: {
      500: '0 84% 60%',
      600: '0 84% 50%',
    },
    warning: {
      500: '45 100% 45%',
      600: '45 100% 40%',
    },
    info: {
      500: '188 52% 37%',  // Same as teal
      600: '188 52% 30%',
    },
  },
  
  spacing: {
    // Tailwind's native spacing scale (4px increments)
    // Used directly in Tailwind, not as CSS variables
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },
  
  shadows: {
    // All HSL format for consistency
    none: 'none',
    sm: '0 1px 2px 0 hsl(0 0% 0% / 0.05)',
    md: '0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.06)',
    lg: '0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -2px hsl(0 0% 0% / 0.05)',
    xl: '0 20px 25px -5px hsl(0 0% 0% / 0.1), 0 8px 10px -6px hsl(0 0% 0% / 0.1)',
    '2xl': '0 25px 50px -12px hsl(0 0% 0% / 0.25)',
    card: '0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.06)',
    elevated: '0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -2px hsl(0 0% 0% / 0.05)',
    inner: 'inset 0 2px 4px 0 hsl(0 0% 0% / 0.05)',
  },
  
  motion: {
    // Timing
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    // Easing
    easeStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeEmphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  typography: {
    fontFamily: {
      sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
} as const;

