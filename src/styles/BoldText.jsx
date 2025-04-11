import React from 'react';
import Typography from '@mui/material/Typography';
import { useSettings } from '../context/SettingsContext';
import theme from './theme';

const BoldText = ({ children }) => {
  const { selectedTheme } = useSettings();
  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 'bold',
        color: theme.palette.text.primary(selectedTheme),
      }}
    >
      {children}
    </Typography>
  );
};

export default BoldText;