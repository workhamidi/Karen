import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { colors } from '../styles/colors'; // Adjust path

const ReviewControls = ({ onCorrect, onIncorrect, disabled = false }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-around', // Evenly space buttons
                alignItems: 'center',
                mt: 3, // Margin top
                p: 1,
                borderTop: `1px solid ${colors.divider || 'rgba(255, 255, 255, 0.2)'}`,
                // background: 'rgba(0,0,0,0.1)', // Optional subtle background
            }}
        >
            <Button
                variant="contained"
                color="error" // Use theme error color
                onClick={onIncorrect}
                disabled={disabled}
                startIcon={<CloseIcon />}
                sx={{
                    flexGrow: 1, // Make buttons take equal space
                    mx: 1, // Margin between buttons
                    py: 1.5, // Padding vertical
                    backgroundColor: colors.errorButtonBackground || '#d32f2f',
                    color: '#fff',
                    '&:hover': {
                         backgroundColor: colors.errorButtonHover || '#b71c1c',
                    }
                }}
            >
                Wrong
            </Button>
            <Button
                variant="contained"
                color="success" // Use theme success color
                onClick={onCorrect}
                disabled={disabled}
                startIcon={<CheckIcon />}
                 sx={{
                    flexGrow: 1,
                    mx: 1,
                    py: 1.5,
                    backgroundColor: colors.successButtonBackground || '#2e7d32',
                     color: '#fff',
                     '&:hover': {
                         backgroundColor: colors.successButtonHover || '#1b5e20',
                     }
                }}
            >
                Correct
            </Button>
        </Box>
    );
};

export default ReviewControls;