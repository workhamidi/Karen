import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { colors } from '../styles/colors'; // Adjust path

const LoadingIndicator = ({ message = "Loading...", sx }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, ...sx }}>
            <CircularProgress sx={{ color: colors.primary }} />
            {message && <Typography sx={{ mt: 2, color: colors.textSecondary }}>{message}</Typography>}
        </Box>
    );
};

export default LoadingIndicator;