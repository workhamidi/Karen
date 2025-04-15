import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import GoogleIcon from '@mui/icons-material/Google';
import { useSettings } from '../context/SettingsContext';
import { useGoogleSheetApi } from '../api/GoogleSheetApi';
import { useAuth } from '../context/AuthContext';
import { generatePrompt } from '../utils/prompt';
import theme from '../styles/theme';

const getAudioUrls = async (word) => {
  try {
    const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`;
    const response = await fetch(audioUrl, { method: 'HEAD' });
    if (response.ok) {
      return [audioUrl];
    }
    return ['No audio URL found'];
  } catch {
    return ['Error fetching audio'];
  }
};

const AddWordsScreen = () => {
  const navigate = useNavigate();
  const { 
    appLanguage, 
    geminiApiKey, 
    clientId, 
    spreadsheetId, 
    geminiModel, 
    vocabLevel,
    selectedTheme 
  } = useSettings();
  const { isSignedIn } = useAuth();
  const { 
    addWords, 
    isApiReady, 
    isSignInReady, 
    signIn, 
    error: apiError 
  } = useGoogleSheetApi({ clientId, spreadsheetId });

  const [numWords, setNumWords] = useState(2);
  const [prompt, setPrompt] = useState(generatePrompt(2, vocabLevel));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editPrompt, setEditPrompt] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(() => {
    const saved = localStorage.getItem('pendingAddWords');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!clientId || !spreadsheetId || !geminiApiKey) {
      setError(appLanguage === 'fa' ? 'تنظیمات ناقص است. لطفاً به تنظیمات بروید.' : 'Settings are incomplete. Please go to settings.');
      const timer = setTimeout(() => navigate('/settings', { replace: true }), 1500);
      return () => clearTimeout(timer);
    }
  }, [clientId, spreadsheetId, geminiApiKey, appLanguage, navigate]);

  useEffect(() => {
    const processPendingRequest = async () => {
      if (!pendingRequest || !isSignedIn || !isApiReady) return;
      setIsLoading(true);
      try {
        const wordsWithAudio = await Promise.all(pendingRequest.words.map(async (word) => ({
          ...word,
          word: word.word.toLowerCase(),
          example_audio_url: await getAudioUrls(word.word),
        })));
        await addWords(wordsWithAudio);
        setResultMessage(
          appLanguage === 'fa'
            ? `دریافت: ${pendingRequest.words.length} لغت، اضافه‌شده: ${wordsWithAudio.length} لغت`
            : `Received: ${pendingRequest.words.length} words, Added: ${wordsWithAudio.length} words`
        );
        localStorage.removeItem('pendingAddWords');
        setPendingRequest(null);
      } catch (err) {
        setError(err.message || (appLanguage === 'fa' ? 'خطای ناشناخته رخ داد.' : 'An unknown error occurred.'));
      } finally {
        setIsLoading(false);
      }
    };
    processPendingRequest();
  }, [pendingRequest, isSignedIn, isApiReady, addWords, appLanguage]);

  const handleGenerateWords = async () => {
    if (!geminiApiKey) {
      setError(appLanguage === 'fa' ? 'کلید API Gemini وارد نشده است.' : 'Gemini API Key is not set.');
      return;
    }
    if (!isSignedIn || !isApiReady) {
      setError(appLanguage === 'fa' ? 'لطفاً ابتدا وارد حساب گوگل شوید.' : 'Please sign in to your Google account first.');
      return;
    }
    if (numWords < 1) {
      setError(appLanguage === 'fa' ? 'تعداد کلمات باید حداقل ۱ باشد.' : 'Number of words must be at least 1.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(appLanguage === 'fa' ? 'خطا در دریافت پاسخ از Gemini API.' : 'Error fetching response from Gemini API.');
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error(appLanguage === 'fa' ? 'پاسخی از Gemini API دریافت نشد.' : 'No response received from Gemini API.');
      }
      
      const cleanedText = generatedText.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      const generatedWords = JSON.parse(cleanedText);
      
      if (!Array.isArray(generatedWords)) {
        throw new Error(
          appLanguage === 'fa'
            ? `پاسخ دریافتی نامعتبر است.`
            : `Received invalid response.`
        );
      }

      const wordsWithAudio = await Promise.all(generatedWords.map(async (word) => ({
        ...word,
        example_audio_url: await getAudioUrls(word.word),
      })));   

      localStorage.setItem('pendingAddWords', JSON.stringify({ words: wordsWithAudio }));
      setPendingRequest({ words: wordsWithAudio });

    } catch (err) {
      setError(err.message || (appLanguage === 'fa' ? 'خطای ناشناخته رخ داد.' : 'An unknown error occurred.'));
      setIsLoading(false);
    }
  };

  const handleNumWordsChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    setNumWords(value);
    setPrompt(generatePrompt(value, vocabLevel));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom, ${theme.palette.background.gradientStart(selectedTheme)}, ${theme.palette.background.gradientEnd(selectedTheme)})`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ color: theme.palette.icon.primary(selectedTheme) }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary(selectedTheme) }}>
            {appLanguage === 'fa' ? 'افزودن کلمات' : 'Add Words'}
          </Typography>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          color: theme.palette.text.primary(selectedTheme),
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {!isSignedIn && (
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={signIn}
            disabled={!isSignInReady}
            sx={{
              backgroundColor: theme.palette.primary.main(selectedTheme),
              color: theme.palette.text.button(selectedTheme),
              '&:hover': { backgroundColor: theme.palette.primary.main(selectedTheme), opacity: 0.9 },
            }}
          >
            {appLanguage === 'fa' ? 'ورود با گوگل' : 'Sign in with Google'}
          </Button>
        )}
        <TextField
          label={appLanguage === 'fa' ? 'تعداد کلمات' : 'Number of Words'}
          type="number"
          value={numWords}
          onChange={handleNumWordsChange}
          fullWidth
          variant="outlined"
          inputProps={{ min: 1 }}
        />
        {apiError && (
          <Alert severity="error">
            {appLanguage === 'fa' ? apiError : apiError}
          </Alert>
        )}
        {editPrompt && (
          <TextField
            label={appLanguage === 'fa' ? 'پرامپت' : 'Prompt'}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            fullWidth
            multiline
            rows={10}
            variant="outlined"
          />
        )}
        <Button
          variant="outlined"
          onClick={() => setEditPrompt((prev) => !prev)}
          sx={{ color: theme.palette.primary.main(selectedTheme), borderColor: theme.palette.primary.main(selectedTheme) }}
        >
          {editPrompt
            ? appLanguage === 'fa'
              ? 'بستن ویرایش پرامپت'
              : 'Close Prompt Edit'
            : appLanguage === 'fa'
            ? 'ویرایش پرامپت'
            : 'Edit Prompt'}
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerateWords}
          disabled={isLoading || !isSignedIn || !isApiReady || !geminiApiKey}
          sx={{
            backgroundColor: theme.palette.primary.main(selectedTheme),
            color: theme.palette.text.button(selectedTheme),
            '&:hover': { backgroundColor: theme.palette.primary.main(selectedTheme), opacity: 0.9 },
          }}
        >
          {isLoading
            ? appLanguage === 'fa'
              ? 'در حال ارسال...'
              : 'Sending...'
            : appLanguage === 'fa'
            ? 'ارسال درخواست'
            : 'Send Request'}
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {resultMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {resultMessage}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AddWordsScreen;