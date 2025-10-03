/**
 * 🎨 HotGist Brand Theme
 * Centralized design system for consistent styling across all screens
 */

export const COLORS = {
  // Brand Colors
  primary: '#5A00E0',      // Electric Indigo - mystery + identity
  secondary: '#FF4E63',    // Neon Coral - bold, viral, exciting
  accent: '#FF9100',       // Sunburst Orange - fire gossip, urgent alerts

  // Background Colors
  background: '#0D0D0F',   // Obsidian Black - premium, dramatic
  surface: '#1a1a1a',      // Dark surface for cards/buttons
  surfaceSecondary: '#2d2d2d', // Secondary surface

  // Text Colors
  text: '#FFFFFF',         // White - primary text
  textSecondary: '#A1A1AA', // Cloud Gray - timestamps, secondary info
  textMuted: '#666666',    // Muted text

  // Interactive Colors
  google: '#DB4437',       // Google brand red
  phone: '#34A853',        // Google brand green
  white: '#FFFFFF',        // Pure white

  // Status Colors
  success: '#4CAF50',      // Success green
  warning: '#FF9800',      // Warning orange
  error: '#F44336',        // Error red
};

export const TYPOGRAPHY = {
  // Font Weights
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',

  // Font Sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 42,
  '6xl': 48,

  // Line Heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 60,
  '4xl': 80,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 12,
  },
};

export const GRADIENTS = {
  primary: [COLORS.primary, COLORS.secondary],
  accent: [COLORS.accent, COLORS.secondary],
  dark: [COLORS.background, COLORS.surface],
  warm: [COLORS.accent, COLORS.secondary],
};

// Common button styles
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.lg,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderWidth: 1,
    borderColor: `${COLORS.primary}33`,
    ...SHADOWS.md,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
};

// Common text styles
export const TEXT_STYLES = {
  h1: {
    fontSize: TYPOGRAPHY['5xl'],
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.text,
    letterSpacing: -1,
  },
  h2: {
    fontSize: TYPOGRAPHY['4xl'],
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  body: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
  },
};