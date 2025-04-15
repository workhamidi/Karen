import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import theme from '../styles/theme';
import { useSettings } from '../context/SettingsContext'; 

const LoadingIndicator = ({ message = "Loading...", sx }) => {
    // Get the selected theme name from the context
    const { selectedTheme } = useSettings();

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            ...sx // Allow overriding styles
        }}>
            {/* Use the theme object and pass the selectedTheme */}
            <CircularProgress sx={{ color: theme.palette.primary.main(selectedTheme) }} />
            {/* Use the theme object and pass the selectedTheme */}
            {message && (
                <Typography sx={{ mt: 2, color: theme.palette.text.secondary(selectedTheme) }}>
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default LoadingIndicator;