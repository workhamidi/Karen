import { colorPalettes } from './colorPalettes';

function getContrastText(background) {
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const calculateLuminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const rgb = hexToRgb(background);
  const luminance = calculateLuminance(...rgb);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

const theme = {
  palette: {
    primary: {
      main: (themeName = 'default') => colorPalettes[themeName]?.primary || colorPalettes.default.primary,
    },
    secondary: {
      main: (themeName = 'default') => colorPalettes[themeName]?.secondary || colorPalettes.default.secondary,
    },
    background: {
      gradientStart: (themeName = 'default') => colorPalettes[themeName]?.backgroundGradientStart || colorPalettes.default.backgroundGradientStart,
      gradientEnd: (themeName = 'default') => colorPalettes[themeName]?.backgroundGradientEnd || colorPalettes.default.backgroundGradientEnd,
      card: (themeName = 'default') => colorPalettes[themeName]?.cardBackground || colorPalettes.default.cardBackground,
      cardDetail: (themeName = 'default') => colorPalettes[themeName]?.cardDetailBackground || colorPalettes.default.cardDetailBackground,
    },
    text: {
      primary: (themeName = 'default') => colorPalettes[themeName]?.text || colorPalettes.default.text,
      secondary: (themeName = 'default') => colorPalettes[themeName]?.textSecondary || colorPalettes.default.textSecondary,
      hint: (themeName = 'default') => colorPalettes[themeName]?.textHint || colorPalettes.default.textHint,
      button: (themeName = 'default') => colorPalettes[themeName]?.buttonText || colorPalettes.default.buttonText,
    },
    icon: {
      primary: (themeName = 'default') => colorPalettes[themeName]?.icon || colorPalettes.default.icon,
    },
    error: {
      main: (themeName = 'default') => colorPalettes[themeName]?.error || colorPalettes.default.error,
      hover: (themeName = 'default') => colorPalettes[themeName]?.errorButtonHover || colorPalettes.default.errorButtonHover,
    },
    success: {
      main: (themeName = 'default') => colorPalettes[themeName]?.success || colorPalettes.default.success,
      hover: (themeName = 'default') => colorPalettes[themeName]?.successButtonHover || colorPalettes.default.successButtonHover,
    },
    getContrastText: (color) => getContrastText(color),
  },
};

export default theme;