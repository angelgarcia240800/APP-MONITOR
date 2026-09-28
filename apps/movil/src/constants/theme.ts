/**
 * Tema Estricto Monocromático (Black & White / Escala de Grises)
 * Cumple con el requerimiento: "en blanco y negro todo no quiero colores"
 */
export const THEME = {
  colors: {
    // Fondos
    background: '#000000',
    surface: '#121212',
    surfaceSubtle: '#1C1C1C',
    surfaceElevated: '#262626',
    surfaceHighlight: '#333333',

    // Bordes y separadores
    border: '#2C2C2C',
    borderLight: '#444444',
    borderHighlight: '#666666',

    // Textos
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    textSubtle: '#555555',
    textInverted: '#000000',

    // Elementos destacados / botones (Monocromáticos)
    buttonPrimaryBg: '#FFFFFF',
    buttonPrimaryText: '#000000',
    buttonSecondaryBg: '#222222',
    buttonSecondaryText: '#FFFFFF',
    buttonSecondaryBorder: '#383838',

    // Indicadores / Badges
    badgeSelectedBg: '#FFFFFF',
    badgeSelectedText: '#000000',
    badgeInactiveBg: '#222222',
    badgeInactiveText: '#888888',

    // Variaciones (En blanco y negro sin verde/rojo)
    trendNeutral: '#FFFFFF',
    trendMuted: '#999999',

    // Modal overlay
    modalBackdrop: 'rgba(0, 0, 0, 0.85)',
  },

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

  typography: {
    regular: 'System',
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
      hero: 38,
    },
  },
};
