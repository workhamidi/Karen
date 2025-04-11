import { colorPalettes } from './colorPalettes';

const theme = {
  palette: {
    primary: {
      main: (themeName = 'default') => colorPalettes[themeName]?.primary || colorPalettes.default.primary,
    },
    secondary: {
      main: (themeName = 'default') => colorPalettes[themeName]?.secondary || colorPalettes.default.secondary,
    },
    tertiary: {
      main: (themeName = 'default') => colorPalettes[themeName]?.tertiary || colorPalettes.default.tertiary,
    },
    background: {
      gradientStart: (themeName = 'default') => colorPalettes[themeName]?.gradientStart || colorPalettes.default.gradientStart,
      gradientEnd: (themeName = 'default') => colorPalettes[themeName]?.gradientEnd || colorPalettes.default.gradientEnd,
      card: (themeName = 'default') => colorPalettes[themeName]?.card || colorPalettes.default.card,
      cardDetail: (themeName = 'default') => colorPalettes[themeName]?.cardDetail || colorPalettes.default.cardDetail,
    },
    text: {
      primary: (themeName = 'default') => colorPalettes[themeName]?.textPrimary || colorPalettes.default.textPrimary,
      secondary: (themeName = 'default') => colorPalettes[themeName]?.textSecondary || colorPalettes.default.textSecondary,
      hint: (themeName = 'default') => colorPalettes[themeName]?.textHint || colorPalettes.default.textHint,
      button: (themeName = 'default') => colorPalettes[themeName]?.textButton || colorPalettes.default.textButton,
    },
    icon: {
      primary: (themeName = 'default') => colorPalettes[themeName]?.iconPrimary || colorPalettes.default.iconPrimary,
    },
    error: {
      main: (themeName = 'default') => colorPalettes[themeName]?.error || colorPalettes.default.error,
    },
  },
};

export default theme;