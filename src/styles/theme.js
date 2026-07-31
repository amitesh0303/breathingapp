const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

const typography = {
  heading: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subheading: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
};

const darkColors = {
  background: '#0a0a1a',
  surface: '#111827',
  surfaceElevated: '#1a1a2e',
  primary: '#06b6d4',
  primaryLight: '#22d3ee',
  accent: '#8b5cf6',
  accentLight: '#a78bfa',
  secondary: '#f59e0b',
  secondaryLight: '#fbbf24',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  card: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

const lightColors = {
  background: '#faf8f5',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  primary: '#0891b2',
  primaryLight: '#06b6d4',
  accent: '#7c3aed',
  accentLight: '#8b5cf6',
  secondary: '#d97706',
  secondaryLight: '#f59e0b',
  text: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: 'rgba(0, 0, 0, 0.06)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.3)',
  card: 'rgba(255, 255, 255, 0.8)',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  success: '#059669',
  error: '#dc2626',
  warning: '#d97706',
};

const gradients = {
  dark: {
    background: ['#0a0a1a', '#111827', '#1a1a2e'],
    primary: ['#06b6d4', '#0891b2'],
    accent: ['#8b5cf6', '#6366f1'],
    card: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'],
    warm: ['#f59e0b', '#ef4444'],
    cool: ['#06b6d4', '#8b5cf6'],
  },
  light: {
    background: ['#faf8f5', '#f1f5f9', '#e2e8f0'],
    primary: ['#06b6d4', '#0e7490'],
    accent: ['#8b5cf6', '#7c3aed'],
    card: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
    warm: ['#f59e0b', '#dc2626'],
    cool: ['#0891b2', '#7c3aed'],
  },
};

export const darkTheme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  gradients: gradients.dark,
  isDark: true,
};

export const lightTheme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  gradients: gradients.light,
  isDark: false,
};
