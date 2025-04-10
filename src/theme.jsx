import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#32C48D',
    },
    secondary: {
      main: '#9C27B0',
    },
    background: {
      default: '#F0F9F6',
    },
    card: {
      purple: '#B388FF',
      coral: '#FF8A80',
      yellow: '#FFD54F',
      blue: '#81D4FA',
      green1: '#81C784',
      green2: '#66BB6A',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default theme;