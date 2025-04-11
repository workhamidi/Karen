import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSettings } from '../context/SettingsContext';
import theme from '../styles/theme';

const ActionButton = ({ title, IconComponent, color, onClick }) => {
  const { selectedTheme } = useSettings();

  return (
    <Button
      variant="contained"
      onClick={onClick}
      sx={{
        width: '100%',
        backgroundColor: color,
        color: theme.palette.text.button(selectedTheme),
        padding: '25px 20px',
        borderRadius: '15px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '130px',
        '&:hover': {
          backgroundColor: color,
          opacity: 0.9,
        },
        textTransform: 'none',
      }}
    >
      <IconComponent
        sx={{
          fontSize: 40,
          marginBottom: '10px',
          color: theme.palette.icon.primary(selectedTheme),
        }}
      />
      <Typography variant="h6" component="span">
        {title}
      </Typography>
    </Button>
  );
};

export default ActionButton;