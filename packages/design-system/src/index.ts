/**
 * Aether Design System
 *
 * Central design tokens, CSS variable definitions, and component theme
 * configuration for the Aether autonomous engineering OS.
 *
 * All tokens are consumed via CSS custom properties defined in globals.css.
 * This module provides TypeScript-level access to the design system values
 * for programmatic use (e.g., Framer Motion variants, component defaults).
 */

/* ─── Color Palette ─────────────────────────────────────────────── */

export const colors = {
  background: '#000000',
  foreground: '#FFFFFF',
  card: '#0A0A0A',
  cardForeground: '#FAFAFA',
  muted: '#171717',
  mutedForeground: '#A3A3A3',
  accent: '#00AEFF',
  accentForeground: '#FFFFFF',
  destructive: '#EF4444',
  border: 'rgba(255, 255, 255, 0.05)',
  ring: 'rgba(0, 174, 255, 0.3)',
  neon: {
    blue: '#00AEFF',
    blueGlow: 'rgba(0, 174, 255, 0.3)',
    blueMuted: 'rgba(0, 174, 255, 0.1)',
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    highlight: 'rgba(255, 255, 255, 0.05)',
  },
} as const;

/* ─── Typography ────────────────────────────────────────────────── */

export const fonts = {
  sans: '"Geist", "Inter", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
} as const;

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
} as const;

/* ─── Spacing ───────────────────────────────────────────────────── */

export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
} as const;

/* ─── Shadows ───────────────────────────────────────────────────── */

export const shadows = {
  neon: '0 0 15px rgba(0, 174, 255, 0.3)',
  neonLg: '0 0 25px rgba(0, 174, 255, 0.5)',
  glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
  card: '0 4px 16px rgba(0, 0, 0, 0.2)',
  elevated: '0 16px 48px rgba(0, 0, 0, 0.4)',
} as const;

/* ─── Border Radius ─────────────────────────────────────────────── */

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

/* ─── Animation Tokens ──────────────────────────────────────────── */

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: {
    stiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
    snappy: { type: 'spring' as const, stiffness: 300, damping: 20 },
    gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
  },
} as const;

/* ─── Z-Index Scale ─────────────────────────────────────────────── */

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  nav: 30,
  modal: 40,
  commandPalette: 100,
  tooltip: 200,
} as const;

/* ─── Breakpoints ───────────────────────────────────────────────── */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/* ─── CSS Custom Properties Generator ───────────────────────────── */

export const cssCustomProperties = `
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};
  --color-card: ${colors.card};
  --color-card-foreground: ${colors.cardForeground};
  --color-muted: ${colors.muted};
  --color-muted-foreground: ${colors.mutedForeground};
  --color-accent: ${colors.accent};
  --color-accent-foreground: ${colors.accentForeground};
  --color-destructive: ${colors.destructive};
  --color-border: ${colors.border};
  --color-ring: ${colors.ring};
  --font-sans: ${fonts.sans};
  --font-mono: ${fonts.mono};
  --shadow-neon: ${shadows.neon};
  --shadow-glass: ${shadows.glass};
  --radius-sm: ${radii.sm};
  --radius-md: ${radii.md};
  --radius-lg: ${radii.lg};
  --radius-xl: ${radii.xl};
`;