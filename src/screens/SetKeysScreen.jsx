import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors } from '../styles/colors';
import { useSettings } from '../context/SettingsContext'; // Adjust path if needed

const SetKeysScreen = () => {
  const navigate = useNavigate();
  const { clientSecret, updateClientSecret, isSettingsLoaded } = useSettings();
  const [localClientSecret, setLocalClientSecret] = useState('');

  useEffect(() => {
    // Load the secret from context into local state once settings are loaded
    if (isSettingsLoaded) {
      setLocalClientSecret(clientSecret || '');
    }
  }, [clientSecret, isSettingsLoaded]);

  const handleSecretChange = (event) => {
    setLocalClientSecret(event.target.value);
  };

  const handleSaveSecret = () => {
    updateClientSecret(localClientSecret);
    // Optionally provide feedback to the user
    alert('Client Secret saved!');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom, ${colors.backgroundGradientStart}, ${colors.backgroundGradientEnd})`,
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
            Set API Keys
          </Typography>
           <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          color: colors.text,
          display: 'flex',
          flexDirection: 'column',
          gap: 2, // Add some space between elements
        }}
      >
        <Typography variant="h5" gutterBottom>
          Google Client Secret
        </Typography>

        <TextField
          label="Client Secret"
          variant="filled"
          type="password" // Use password type to obscure the secret
          value={localClientSecret}
          onChange={handleSecretChange}
          fullWidth
          InputLabelProps={{
            style: { color: colors.textSecondary },
          }}
          InputProps={{
            style: { color: colors.text, backgroundColor: colors.inputBackground },
            disableUnderline: true, // For filled variant
          }}
          sx={{
             borderRadius: 1,
             '& .MuiFilledInput-root': {
                 backgroundColor: colors.inputBackground,
                 '&:hover': {
                     backgroundColor: colors.inputBackgroundHover, // Optional hover effect
                 },
                 '&.Mui-focused': {
                     backgroundColor: colors.inputBackgroundFocus, // Optional focus effect
                 },
             },
          }}
        />

         <Button
            variant="contained"
            onClick={handleSaveSecret}
            sx={{
                backgroundColor: colors.primary,
                color: colors.buttonText,
                fontWeight: 'bold',
                '&:hover': {
                   backgroundColor: colors.primaryDark,
                },
                alignSelf: 'flex-start', // Align button to the start
            }}
         >
            Save Client Secret
         </Button>

        {/* Add other key settings fields here (e.g., Spreadsheet ID, Gemini Key) */}
        {/* Example:
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Other Keys
        </Typography>
        <TextField label="Spreadsheet ID" ... />
        <TextField label="Gemini API Key" ... />
        <Button variant="contained" ... >Save All Keys</Button>
        */}
      </Box>
    </Box>
  );
};

export default SetKeysScreen;