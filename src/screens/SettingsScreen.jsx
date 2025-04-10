import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress'; // For loading state
import { colors } from '../styles/colors'; // Assuming you have this file
import { useSettings } from '../context/SettingsContext';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const {
    spreadsheetId,
    clientId,
    clientSecret,
    geminiApiKey, // Include if you want to manage it here
    updateSpreadsheetId,
    updateClientId,
    updateClientSecret,
    updateGeminiApiKey, // Include if needed
    isSettingsLoaded,
  } = useSettings();

  const handleSettingChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'spreadsheetId':
        updateSpreadsheetId(value);
        break;
      case 'clientId':
        updateClientId(value);
        break;
      case 'clientSecret':
        updateClientSecret(value);
        break;
      case 'geminiApiKey': // Add case if managing Gemini key here
         updateGeminiApiKey(value);
         break;
      default:
        console.warn(`Unknown setting field: ${name}`);
    }
  };

  if (!isSettingsLoaded) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: `linear-gradient(160deg, ${colors.backgroundGradientStart}, ${colors.backgroundGradientEnd})` }}>
              <CircularProgress sx={{ color: colors.primary }}/>
          </Box>
      );
  }

  // Common TextField Styles
  const textFieldStyles = {
       InputLabelProps: { style: { color: colors.text } },
       InputProps: {
         style: { color: colors.text },
         sx: {
           '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.8)' },
           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
           backgroundColor: 'rgba(0, 0, 0, 0.1)', // Slightly darker background for fields
           borderRadius: 1,
         },
       },
       sx: { mb: 2 },
       fullWidth: true,
       variant: "outlined",
       margin: "normal",
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
          padding: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%', maxWidth: '600px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <Typography variant="h5" gutterBottom sx={{ color: colors.text, mb: 3, textAlign: 'center' }}>
            Google API Settings
          </Typography>

          <TextField
            label="Spreadsheet ID"
            name="spreadsheetId"
            value={spreadsheetId || ''}
            onChange={handleSettingChange}
            {...textFieldStyles}
          />
          <TextField
            label="Google Client ID"
            name="clientId"
            value={clientId || ''}
            onChange={handleSettingChange}
            {...textFieldStyles}
          />
          <TextField
            label="Google Client Secret"
            name="clientSecret"
            type="password"
            value={clientSecret || ''}
            onChange={handleSettingChange}
            {...textFieldStyles}
            sx={{ mb: 0 }} // Remove bottom margin for the last field before caption
          />

          {/* Uncomment to manage Gemini Key here
          <Typography variant="h5" gutterBottom sx={{ color: colors.text, mb: 1, mt: 4, textAlign: 'center' }}>
            Gemini API Key
          </Typography>
          <TextField
            label="Gemini API Key"
            name="geminiApiKey"
            type="password"
            value={geminiApiKey || ''}
            onChange={handleSettingChange}
            {...textFieldStyles}
            sx={{ mb: 0 }}
          />
          */}

          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 2, color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic', textAlign: 'center' }}
          >
            Changes are saved automatically.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default SettingsScreen;