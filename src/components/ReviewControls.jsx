import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const ReviewControls = ({ onCorrect, onIncorrect }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        mt: 3, // Margin top from card
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight background like image border
        borderRadius: 4,
        padding: '5px 0', // Vertical padding
      }}
    >
      <IconButton
        onClick={onIncorrect}
        sx={{
          color: '#FF6B6B', // Reddish color
          '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' },
          padding: 2,
        }}
        aria-label="Incorrect"
      >
        <CloseIcon sx={{ fontSize: 40 }} />
      </IconButton>
      <Box sx={{ width: '1px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} /> {/* Divider */}
      <IconButton
        onClick={onCorrect}
        sx={{
          color: '#6BCB77', // Greenish color
          '&:hover': { backgroundColor: 'rgba(107, 203, 119, 0.1)' },
           padding: 2,
        }}
        aria-label="Correct"
      >
        <CheckIcon sx={{ fontSize: 40 }} />
      </IconButton>
    </Box>
  );
};

export default ReviewControls;