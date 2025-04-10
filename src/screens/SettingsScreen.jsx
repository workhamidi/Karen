import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { colors } from '../styles/colors';

const SETTINGS_KEY = 'appFlashcardSettings';

const defaultSettings = {
  spreadsheetId: '',
  clientId: '',
};

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    spreadsheetId: '',
    clientId: '',
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({
          spreadsheetId: parsedSettings.spreadsheetId || '',
          clientId: parsedSettings.clientId || '',
        });
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        setSettings({ spreadsheetId: '', clientId: '' });
      }
    } else {
      setSettings({ spreadsheetId: '', clientId: '' });
    }
  }, []);

  const saveSettings = useCallback((newSettings) => {
    try {
      const existingSettingsRaw = localStorage.getItem(SETTINGS_KEY);
      let existingSettings = {};
      if (existingSettingsRaw) {
        try {
          existingSettings = JSON.parse(existingSettingsRaw);
        } catch {
            // ignore parsing errors of old data
        }
      }
      const settingsToSave = { ...existingSettings, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, []);

  const handleSettingChange = (event) => {
    const { name, value } = event.target;
    setSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        [name]: value,
      };
      saveSettings({ [name]: value });
      return newSettings;
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${colors.backgroundGradientStart}, ${colors.backgroundGradientEnd})`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: colors.appBarBackground, boxShadow: 'none' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate(-1)}
            sx={{ color: colors.icon }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: colors.text }}>
            Settings
          </Typography>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper sx={{ p: 3, width: '100%', maxWidth: '500px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ color: colors.text, mb: 3 }}>
            Google Sheet API
          </Typography>
          <TextField
            label="Spreadsheet ID"
            variant="outlined"
            name="spreadsheetId"
            value={settings.spreadsheetId}
            onChange={handleSettingChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: { color: colors.text },
            }}
            InputProps={{
              style: { color: colors.text },
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.secondary,
                },
              },
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Google Client ID"
            variant="outlined"
            name="clientId"
            value={settings.clientId}
            onChange={handleSettingChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: { color: colors.text },
            }}
            InputProps={{
              style: { color: colors.text },
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.secondary,
                },
              },
            }}
          />
          {/* Auto-save notification text */}
          <Typography
            variant="caption"
            sx={{
              display: 'block', // Make it block to appear on its own line
              mt: 2,            // Add some margin top
              color: 'rgba(255, 255, 255, 0.7)', // Slightly lighter text color
              fontStyle: 'italic',
              textAlign: 'center' // Center align the text
            }}
          >
            Changes are saved automatically.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default SettingsScreen;

export const getStoredSettings = () => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  let relevantSettings = {
    spreadsheetId: '',
    clientId: '',
  };
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      relevantSettings.spreadsheetId = parsed.spreadsheetId || '';
      relevantSettings.clientId = parsed.clientId || '';
    } catch {
        // Keep defaults if parsing fails
    }
  }
  return relevantSettings;
};