/**
 * Semantic Design Tokens
 * 
 * IMPORTANT: This file is for REFERENCE and DOCUMENTATION only.
 * The source of truth is theme/light.css
 * 
 * If values differ, CSS takes precedence.
 * This TS file helps with:
 * - TypeScript autocomplete
 * - Documentation
 * - Future codegen (if needed)
 */

import { primitives } from './primitives';

export const semantic = {
  light: {
    // Backgrounds
    'color-bg': '0 0% 100%',              // White background
    'color-surface': '0 0% 100%',          // Cards, panels
    'color-surface-2': '0 0% 98%',         // Nested cards
    'color-muted': '0 0% 96.1%',          // Subtle backgrounds (pills, badges)
    'color-elevated': '0 0% 100%',        // Modals, sheets, dropdowns
    
    // Text
    'color-text': '0 0% 3.9%',            // Primary text
    'color-text-muted': primitives.colors.gray[500],  // Secondary text
    'color-text-disabled': '0 0% 60%',     // Disabled text
    'color-text-inverse': '0 0% 98%',     // Text on dark backgrounds
    
    // Borders
    'color-border': '0 0% 89.8%',         // Default borders
    'color-border-strong': '0 0% 70%',    // Strong borders
    'color-border-subtle': '0 0% 96%',    // Subtle borders
    
    // Inputs
    'color-input': '0 0% 89.8%',
    'color-input-focus': primitives.colors.teal[500],
    
    // Brand colors
    'color-primary': primitives.colors.pink[500],
    'color-primary-foreground': '0 0% 98%',
    'color-primary-hover': primitives.colors.pink[600],
    'color-primary-active': primitives.colors.pink[700],
    
    'color-secondary': primitives.colors.teal[500],
    'color-secondary-foreground': '0 0% 98%',
    'color-secondary-hover': primitives.colors.teal[600],
    
    // Semantic colors (with foregrounds)
    'color-success': primitives.colors.success[500],
    'color-success-foreground': '0 0% 98%',
    'color-success-bg': '142 76% 95%',
    
    'color-error': primitives.colors.error[500],
    'color-error-foreground': '0 0% 98%',
    'color-error-bg': '0 84% 95%',
    
    'color-warning': primitives.colors.warning[500],
    'color-warning-foreground': '0 0% 3.9%',
    'color-warning-bg': '45 100% 95%',
    
    'color-info': primitives.colors.info[500],
    'color-info-foreground': '0 0% 98%',
    'color-info-bg': '188 52% 95%',
    
    // State tokens (generic hover/active/disabled)
    'state-hover-bg': '0 0% 96.1%',        // Generic hover background
    'state-active-bg': '0 0% 94%',         // Generic active background
    'opacity-disabled': '0.5',             // Disabled opacity
    'opacity-muted': '0.6',                // Muted opacity
    
    // Focus/Ring
    'color-ring': primitives.colors.teal[500],
    'color-ring-offset': '0 0% 100%',
    'color-focus': primitives.colors.teal[500],
    
    // Overlay
    'color-overlay': '0 0% 0% / 0.5',      // Modal backdrop
  },
  
  dark: {
    // Future dark theme - same structure, different values
    // Can be added later without breaking anything
  },
} as const;

