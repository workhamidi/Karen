import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import { colors } from '../styles/colors'; // Adjust path

const ReviewHeader = ({
    title = "Review Words",
    currentCardIndex, // Zero-based index
    totalCards,
    onRefresh,
    onSignOut,
    isSignedIn,
    isLoading,
}) => {
    const navigate = useNavigate();

    return (
        <AppBar position="static" sx={{ backgroundColor: colors.appBarBackground, boxShadow: 'none' }}>
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/')} sx={{ color: colors.icon }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>
                    {title}
                </Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80, justifyContent: 'flex-end' }}>
                    {totalCards > 0 && (
                        <Typography sx={{ color: colors.textSecondary, mr: 1.5 }}>
                            {currentCardIndex + 1}/{totalCards}
                        </Typography>
                    )}
                    {isSignedIn && !isLoading && onRefresh && (
                         <IconButton title="Refresh Data" color="inherit" aria-label="refresh data" onClick={onRefresh} sx={{ color: colors.icon }}>
                            <RefreshIcon />
                        </IconButton>
                    )}
                    <IconButton title="Settings" color="inherit" aria-label="settings" onClick={() => navigate('/settings')} sx={{ color: colors.icon }}>
                        <SettingsIcon />
                    </IconButton>
                    {isSignedIn && onSignOut && (
                        <IconButton title="Sign Out" color="inherit" aria-label="sign out" onClick={onSignOut} sx={{ color: colors.icon }}>
                            <LogoutIcon />
                        </IconButton>
                    )}
                 </Box>

            </Toolbar>
        </AppBar>
    );
};

export default ReviewHeader;