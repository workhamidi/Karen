import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { useSettings } from '../context/SettingsContext';
import { useGoogleSheetApi } from '../api/GoogleSheetApi';
import theme from '../styles/theme';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const {
    clientId,
    clientSecret,
    spreadsheetId,
    geminiApiKey,
    appLanguage,
    selectedTheme,
    geminiModel,
    vocabLevel,
    saveSettings,
  } = useSettings();
  const { syncCacheWithSheet, clearCache } = useGoogleSheetApi({ clientId, spreadsheetId });

  const [localClientId, setLocalClientId] = useState(clientId);
  const [localClientSecret, setLocalClientSecret] = useState(clientSecret);
  const [localSpreadsheetId, setLocalSpreadsheetId] = useState(spreadsheetId);
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState(geminiApiKey);
  const [localTheme, setLocalTheme] = useState(selectedTheme);
  const [localGeminiModel, setLocalGeminiModel] = useState(geminiModel);
  const [localVocabLevel, setLocalVocabLevel] = useState(vocabLevel);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSave = () => {
    saveSettings({
      clientId: localClientId,
      clientSecret: localClientSecret,
      spreadsheetId: localSpreadsheetId,
      geminiApiKey: localGeminiApiKey,
      selectedTheme: localTheme,
      geminiModel: localGeminiModel,
      vocabLevel: localVocabLevel,
    });
    setSuccess(appLanguage === 'fa' ? 'تنظیمات با موفقیت ذخیره شد.' : 'Settings saved successfully.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSyncCache = async () => {
    try {
      await syncCacheWithSheet();
      setSuccess(appLanguage === 'fa' ? 'کش با موفقیت همگام‌سازی شد.' : 'Cache synced successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(appLanguage === 'fa' ? 'خطا در همگام‌سازی کش.' : 'Error syncing cache.');
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      setSuccess(appLanguage === 'fa' ? 'کش با موفقیت پاک شد.' : 'Cache cleared successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(appLanguage === 'fa' ? 'خطا در پاک کردن کش.' : 'Error clearing cache.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom, ${theme.palette.background.gradientStart(localTheme)}, ${theme.palette.background.gradientEnd(localTheme)})`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ color: theme.palette.icon.primary(localTheme) }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {appLanguage === 'fa' ? 'تنظیمات' : 'Settings'}
          </Typography>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          color: theme.palette.text.primary(localTheme),
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <TextField
          label={appLanguage === 'fa' ? 'شناسه کلاینت گوگل' : 'Google Client ID'}
          value={localClientId}
          onChange={(e) => setLocalClientId(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label={appLanguage === 'fa' ? 'رمز کلاینت گوگل' : 'Google Client Secret'}
          value={localClientSecret}
          onChange={(e) => setLocalClientSecret(e.target.value)}
          fullWidth
          variant="outlined"
          type="password"
        />
        <TextField
          label={appLanguage === 'fa' ? 'شناسه Spreadsheet' : 'Spreadsheet ID'}
          value={localSpreadsheetId}
          onChange={(e) => setLocalSpreadsheetId(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label={appLanguage === 'fa' ? 'کلید API Gemini' : 'Gemini API Key'}
          value={localGeminiApiKey}
          onChange={(e) => setLocalGeminiApiKey(e.target.value)}
          fullWidth
          variant="outlined"
          type="password"
        />
        <Typography>{appLanguage === 'fa' ? 'انتخاب تم:' : 'Select Theme:'}</Typography>
        <Select
          value={localTheme}
          onChange={(e) => setLocalTheme(e.target.value)}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="default">{appLanguage === 'fa' ? 'پیش‌فرض' : 'Default'}</MenuItem>
          <MenuItem value="palette1">Palette 1</MenuItem>
          <MenuItem value="palette2">Palette 2</MenuItem>
          <MenuItem value="palette3">Palette 3</MenuItem>
          <MenuItem value="palette4">Palette 4</MenuItem>
          <MenuItem value="palette5">Palette 5</MenuItem>
        </Select>
        <Typography>{appLanguage === 'fa' ? 'مدل Gemini:' : 'Gemini Model:'}</Typography>
        <Select
          value={localGeminiModel}
          onChange={(e) => setLocalGeminiModel(e.target.value)}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="gemini-2.0-flash-thinking-exp-01-21">gemini-2.0-flash-thinking-exp-01-21</MenuItem>
        </Select>
        <Typography>{appLanguage === 'fa' ? 'سطح لغات:' : 'Vocabulary Level:'}</Typography>
        <Select
          value={localVocabLevel}
          onChange={(e) => setLocalVocabLevel(e.target.value)}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="A1">A1</MenuItem>
          <MenuItem value="A2">A2</MenuItem>
          <MenuItem value="B1">B1</MenuItem>
          <MenuItem value="B2">B2</MenuItem>
          <MenuItem value="C1">C1</MenuItem>
          <MenuItem value="C2">C2</MenuItem>
          <MenuItem value="All">All</MenuItem>
        </Select>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            backgroundColor: theme.palette.primary.main(localTheme),
            color: theme.palette.text.button(localTheme),
            '&:hover': { backgroundColor: theme.palette.primary.main(localTheme), opacity: 0.9 },
          }}
        >
          {appLanguage === 'fa' ? 'ذخیره' : 'Save'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleSyncCache}
          sx={{
            color: theme.palette.primary.main(localTheme),
            borderColor: theme.palette.primary.main(localTheme),
          }}
        >
          {appLanguage === 'fa' ? 'همگام‌سازی کش با Sheet' : 'Sync Cache with Sheet'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleClearCache}
          sx={{
            color: theme.palette.error.main(localTheme),
            borderColor: theme.palette.error.main(localTheme),
          }}
        >
          {appLanguage === 'fa' ? 'پاک کردن کش' : 'Clear Cache'}
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default SettingsScreen;