// Design tokens — every screen styles exclusively from these values.
// Keeping colour/spacing/type in one place is what makes the UI consistent
// (and makes a future dark mode a token swap rather than a rewrite).

export const colors = {
  // Brand
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',

  // Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textInverse: '#FFFFFF',

  // Semantic
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  warningLight: '#FFFBEB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  // Font sizes
  caption: 12,
  body: 15,
  subtitle: 17,
  title: 22,
  display: 34,

  // Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};
