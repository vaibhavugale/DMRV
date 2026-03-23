// ─────────────────────────────────────────────────────
// Design System — Premium earthy agroforestry palette
// ─────────────────────────────────────────────────────

export const Colors = {
  // Primary — deep forest green
  primary: '#1B5E20',
  primaryLight: '#388E3C',
  primaryDark: '#0D3B13',
  primarySurface: '#E8F5E9',

  // Accent — warm amber/gold
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#B45309',

  // Semantic
  success: '#16A34A',
  warning: '#EA580C',
  error: '#DC2626',
  info: '#2563EB',

  // Sync status
  syncPending: '#F59E0B',
  syncSynced: '#16A34A',
  syncConflict: '#EA580C',
  syncFailed: '#DC2626',

  // Neutrals
  background: '#FAFAF5',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F0',
  border: '#E0DDD5',
  borderLight: '#F0EDE5',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#1A1A1A',

  // Overlays
  overlay: 'rgba(0,0,0,0.4)',
  shimmer: 'rgba(255,255,255,0.08)',
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
  button: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.3 },
  tabLabel: { fontSize: 11, fontWeight: '600' as const },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
