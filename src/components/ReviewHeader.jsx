import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/material/Box';
import { useSettings } from '../context/SettingsContext';
import theme from '../styles/theme';

const ReviewHeader = ({
  onBack,
  onGoToSettings,
  title,
  currentCardIndex,
  totalCards,
  onRefresh,
  onSignOut,
  isSignedIn,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { appLanguage, saveSettings } = useSettings();

  const toggleLanguage = () => {
    const newLanguage = appLanguage === 'fa' ? 'en' : 'fa';
    saveSettings({ appLanguage: newLanguage });
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onBack || (() => navigate(-1))}
          sx={{ color: theme.palette.icon.primary }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {appLanguage === 'fa' ? `${title} ${totalCards > 0 ? `(${currentCardIndex + 1}/${totalCards})` : ''}` : `${title} ${totalCards > 0 ? `(${currentCardIndex + 1}/${totalCards})` : ''}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={toggleLanguage}
            sx={{ color: theme.palette.icon.primary }}
          >
            <LanguageIcon />
          </IconButton>
          <IconButton
            onClick={onRefresh}
            disabled={isLoading}
            sx={{ color: theme.palette.icon.primary }}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={onGoToSettings || (() => navigate('/settings'))}
            sx={{ color: theme.palette.icon.primary }}
          >
            <SettingsIcon />
          </IconButton>
          {isSignedIn && (
            <IconButton
              onClick={onSignOut}
              sx={{ color: theme.palette.icon.primary }}
            >
              <LogoutIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ReviewHeader;