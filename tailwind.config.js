/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: 'hsl(var(--color-bg))',
        surface: 'hsl(var(--color-surface))',
        'surface-2': 'hsl(var(--color-surface-2))',
        elevated: 'hsl(var(--color-elevated))',
        
        // Text
        foreground: 'hsl(var(--color-text))',
        'text-disabled': 'hsl(var(--color-text-disabled))',
        'text-inverse': 'hsl(var(--color-text-inverse))',
        
        // Muted (background + text)
        muted: {
          DEFAULT: 'hsl(var(--color-muted))',
          foreground: 'hsl(var(--color-text-muted))',
        },
        
        // Borders
        border: 'hsl(var(--color-border))',
        'border-strong': 'hsl(var(--color-border-strong))',
        'border-subtle': 'hsl(var(--color-border-subtle))',
        
        // Inputs
        input: 'hsl(var(--color-input))',
        'input-focus': 'hsl(var(--color-input-focus))',
        
        // Brand
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
          hover: 'hsl(var(--color-primary-hover))',
          active: 'hsl(var(--color-primary-active))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
          hover: 'hsl(var(--color-secondary-hover))',
        },
        
        // Semantic
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          foreground: 'hsl(var(--color-success-foreground))',
          bg: 'hsl(var(--color-success-bg))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
          foreground: 'hsl(var(--color-error-foreground))',
          bg: 'hsl(var(--color-error-bg))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          foreground: 'hsl(var(--color-warning-foreground))',
          bg: 'hsl(var(--color-warning-bg))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          foreground: 'hsl(var(--color-info-foreground))',
          bg: 'hsl(var(--color-info-bg))',
        },
        
        // Focus/Ring
        ring: 'hsl(var(--color-ring))',
        'ring-offset': 'hsl(var(--color-ring-offset))',
        'ring-offset-background': 'hsl(var(--color-bg))',
        focus: 'hsl(var(--color-focus))',
        
        // State tokens
        'state-hover-bg': 'hsl(var(--state-hover-bg))',
        'state-active-bg': 'hsl(var(--state-active-bg))',
      },
      
      opacity: {
        disabled: 'var(--opacity-disabled)',
        muted: 'var(--opacity-muted)',
      },
      
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      
      boxShadow: {
        sm: '0 1px 2px 0 hsl(0 0% 0% / 0.05)',
        md: '0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.06)',
        lg: '0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -2px hsl(0 0% 0% / 0.05)',
        xl: '0 20px 25px -5px hsl(0 0% 0% / 0.1), 0 8px 10px -6px hsl(0 0% 0% / 0.1)',
        '2xl': '0 25px 50px -12px hsl(0 0% 0% / 0.25)',
        card: '0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.06)',
        elevated: '0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -2px hsl(0 0% 0% / 0.05)',
        inner: 'inset 0 2px 4px 0 hsl(0 0% 0% / 0.05)',
      },
      
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
      
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
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
      
      backdropBlur: {
        xs: '2px',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
      
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgba(201, 83, 117, 0.5), 0 0 10px rgba(201, 83, 117, 0.3)' 
          },
          '100%': { 
            boxShadow: '0 0 20px rgba(201, 83, 117, 0.8), 0 0 30px rgba(201, 83, 117, 0.5)' 
          },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

