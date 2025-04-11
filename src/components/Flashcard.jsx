import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import WordDetails from './WordDetails';
import { useSettings } from '../context/SettingsContext';
import theme from '../styles/theme';

const Flashcard = ({
  wordData,
  displayMode = 'word',
  onSwipeLeft,
  onSwipeRight,
  onFlip,
  showDetails = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const { detailLanguage, appLanguage, selectedTheme } = useSettings();

  const handlePlayAudio = (event) => {
    event.stopPropagation();
    if (!wordData?.example_audio_url?.length || wordData.example_audio_url[0] === 'No audio URL found' || isPlaying) return;

    const audioUrl = wordData.example_audio_url[0].startsWith('http')
      ? wordData.example_audio_url[0]
      : `https://api.dictionaryapi.dev/media/pronunciations/en/${wordData.word}-us.mp3`;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.onplaying = () => setIsPlaying(true);
    audioRef.current.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    audioRef.current.onerror = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    audioRef.current.play().catch(() => {
      setIsPlaying(false);
      audioRef.current = null;
    });
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onplaying = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
        setIsPlaying(false);
      }
    };
  }, [wordData]);

  const frontContent = displayMode === 'word' ? wordData?.word : wordData?.meaning;
  const phonetic = displayMode === 'word' ? wordData?.phonetic?.short : null;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: showDetails ? '600px' : '450px',
        margin: 'auto',
        transition: 'max-width 0.3s ease',
      }}
    >
      <Card
        onClick={onFlip}
        sx={{
          position: 'relative',
          height: '300px',
          borderRadius: '20px',
          background: theme.palette.background.card(selectedTheme),
          color: theme.palette.text.primary(selectedTheme),
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box
          sx={{
            display: showDetails ? 'none' : 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            height: '100%',
            position: 'relative',
          }}
        >
          {wordData?.example_audio_url?.length > 0 && (
            <IconButton
              onClick={handlePlayAudio}
              disabled={isPlaying}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: isPlaying
                  ? theme.palette.text.secondary(selectedTheme)
                  : theme.palette.icon.primary(selectedTheme),
                backgroundColor: theme.palette.background.card(selectedTheme),
                '&:hover': {
                  backgroundColor: theme.palette.primary.main(selectedTheme),
                  color: theme.palette.text.button(selectedTheme),
                },
              }}
              aria-label="play audio"
            >
              <VolumeUpIcon />
            </IconButton>
          )}
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            {frontContent || '...'}
          </Typography>
          {phonetic && (
            <Typography
              sx={{
                color: theme.palette.text.secondary(selectedTheme),
                mb: 2,
                fontSize: '1rem',
                fontStyle: 'italic',
              }}
            >
              {phonetic}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 10,
              color: theme.palette.text.hint(selectedTheme),
            }}
          >
            {appLanguage === 'fa' ? 'برای دیدن جزئیات کلیک کنید' : 'Tap to see details'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: showDetails ? 'block' : 'none',
            height: '100%',
            overflowY: 'auto',
            background: theme.palette.background.cardDetail(selectedTheme),
          }}
        >
          <WordDetails wordData={wordData} />
        </Box>
      </Card>
    </Box>
  );
};

export default Flashcard;