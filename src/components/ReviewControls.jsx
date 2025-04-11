import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import theme from '../styles/theme';

const ReviewControls = ({ onCorrect, onIncorrect, disabled = false }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                mt: 3,
                p: 1,
            }}
        >
            <IconButton
                onClick={onIncorrect}
                disabled={disabled}
                sx={{
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.text.button,
                    width: 60,
                    height: 60,
                    '&:hover': {
                        backgroundColor: theme.palette.error.hover,
                    }
                }}
            >
                <CloseIcon fontSize="large" />
            </IconButton>
            <IconButton
                onClick={onCorrect}
                disabled={disabled}
                sx={{
                    backgroundColor: theme.palette.success.main,
                    color: theme.palette.text.button,
                    width: 60,
                    height: 60,
                    '&:hover': {
                        backgroundColor: theme.palette.success.hover,
                    }
                }}
            >
                <CheckIcon fontSize="large" />
            </IconButton>
        </Box>
    );
};

export default ReviewControls;