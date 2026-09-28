export type ThemeMode = 'system' | 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  surfaceHighlight: string;

  border: string;
  borderLight: string;
  borderHighlight: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textSubtle: string;
  textInverted: string;

  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;

  pillBg: string;
  pillText: string;

  accentGreen: string;
  accentGreenSubtle: string;

  toastBg: string;
  toastText: string;

  modalBackdrop: string;
}

export const DARK_THEME: ThemeColors = {
  background: '#000000',
  surface: '#141414',
  surfaceSubtle: '#1E1E1E',
  surfaceElevated: '#262626',
  surfaceHighlight: '#333333',

  border: '#282828',
  borderLight: '#3A3A3A',
  borderHighlight: '#555555',

  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textSubtle: '#6B7280',
  textInverted: '#000000',

  buttonPrimaryBg: '#FFFFFF',
  buttonPrimaryText: '#000000',
  buttonSecondaryBg: '#222222',
  buttonSecondaryText: '#FFFFFF',
  buttonSecondaryBorder: '#383838',

  pillBg: '#FFFFFF',
  pillText: '#000000',

  accentGreen: '#22C55E', // Verde esmeralda para flechas y variaciones
  accentGreenSubtle: 'rgba(34, 197, 94, 0.15)',

  toastBg: '#222222',
  toastText: '#FFFFFF',

  modalBackdrop: 'rgba(0, 0, 0, 0.85)',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceSubtle: '#F9FAFB',
  surfaceElevated: '#E5E7EB',
  surfaceHighlight: '#D1D5DB',

  border: '#E5E7EB',
  borderLight: '#D1D5DB',
  borderHighlight: '#9CA3AF',

  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  textInverted: '#FFFFFF',

  buttonPrimaryBg: '#111827',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#E5E7EB',
  buttonSecondaryText: '#111827',
  buttonSecondaryBorder: '#D1D5DB',

  pillBg: '#111827',
  pillText: '#FFFFFF',

  accentGreen: '#16A34A', // Verde nítido para modo claro
  accentGreenSubtle: 'rgba(22, 163, 74, 0.15)',

  toastBg: '#111827',
  toastText: '#FFFFFF',

  modalBackdrop: 'rgba(0, 0, 0, 0.65)',
};

export const THEME = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    xl: 24,
    full: 9999,
  },
};
