// CardControls.jsx
import React from 'react';
import { Box, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const CardControls = ({ onReview }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1 }}>
      <Button
        variant="contained"
        color="error"
        onClick={() => onReview(false)} // False for incorrect
        sx={{ borderRadius: '50%', width: 64, height: 64, minWidth: 0 }}
      >
        <CloseIcon />
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={() => onReview(true)} // True for correct
        sx={{ borderRadius: '50%', width: 64, height: 64, minWidth: 0 }}
      >
        <CheckIcon />
      </Button>
    </Box>
  );
};

export default CardControls;