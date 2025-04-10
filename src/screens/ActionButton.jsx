import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { colors } from '../styles/colors';

const ActionButton = ({ title, IconComponent, color, onClick }) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      sx={{
        width: '100%',
        backgroundColor: color,
        color: colors.text,
        padding: '25px 20px', // Increased padding for height
        borderRadius: '15px', // Corresponds to borderRadius in RN
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '130px', // Ensure minimum height
        '&:hover': {
          backgroundColor: color, // Keep color on hover or slightly darken
          opacity: 0.9,
        },
        textTransform: 'none', // Prevent uppercase text
      }}
    >
      <IconComponent sx={{ fontSize: 40, marginBottom: '10px', color: colors.icon }} />
      <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Button>
  );
};

export default ActionButton;