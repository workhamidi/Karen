import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useSettings } from '../context/SettingsContext';
import theme from '../styles/theme';
import BoldText from '../styles/BoldText';

const DetailItem = ({ label, value }) => {
  const { selectedTheme } = useSettings();
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  let displayValue;
  if (typeof value === 'object' && !Array.isArray(value)) {
    displayValue = (
      <Box sx={{ pl: 2, mt: 1 }}>
        {Object.entries(value).map(([key, val]) => (
          <Typography
            key={key}
            variant="body2"
            sx={{ mb: 0.5, display: 'flex', alignItems: 'flex-start' }}
          >
            <BoldText>{key.charAt(0).toUpperCase() + key.slice(1)}:</BoldText>
            <span style={{ marginLeft: 8 }}>{String(val)}</span>
          </Typography>
        ))}
      </Box>
    );
  } else if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object') {
      displayValue = value.map((item, index) => (
        <Box
          key={index}
          sx={{
            mb: 1,
            pl: 2,
            borderLeft: `3px solid ${theme.palette.primary.main(selectedTheme)}`,
            backgroundColor: theme.palette.background.card(selectedTheme),
            p: 1,
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          {Object.entries(item).map(([key, val]) => (
            <Typography
              key={key}
              variant="body2"
              sx={{ mb: 0.5, display: 'flex', alignItems: 'flex-start' }}
            >
              <BoldText>{key.charAt(0).toUpperCase() + key.slice(1)}:</BoldText>
              <span style={{ marginLeft: 8 }}>{String(val)}</span>
            </Typography>
          ))}
        </Box>
      ));
    } else {
      displayValue = (
        <Typography variant="body2">
          {value.join(', ')}
        </Typography>
      );
    }
  } else {
    displayValue = (
      <Typography variant="body2">
        {String(value)}
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 1,
          fontWeight: 'medium',
          color: theme.palette.primary.main(selectedTheme),
        }}
      >
        {label}
      </Typography>
      {displayValue}
      <Divider sx={{ mt: 2, borderColor: theme.palette.text.hint(selectedTheme) }} />
    </Box>
  );
};

const WordDetails = ({ wordData }) => {
  const { appLanguage, selectedTheme } = useSettings();

  if (!wordData) return null;

  const detailOrder = appLanguage === 'fa' ? [
    { key: 'word', label: 'کلمه' },
    { key: 'meaning', label: 'معنی' },
    { key: 'part_of_speech', label: 'نوع کلمه' },
    { key: 'phonetic', label: 'تلفظ' },
    { key: 'etymology', label: 'ریشه‌شناسی' },
    { key: 'examples', label: 'مثال‌ها' },
    { key: 'mnemonics', label: 'یادآورها' },
    { key: 'collocations', label: 'ترکیب‌ها' },
    { key: 'common_mistakes', label: 'اشتباهات رایج' },
    { key: 'formality_level', label: 'سطح رسمی بودن' },
    { key: 'cultural_notes', label: 'یادداشت‌های فرهنگی' },
    { key: 'gesture_association', label: 'ارتباط حرکتی' },
    { key: 'emotional_connotation', label: 'بار احساسی' },
    { key: 'grammar_notes', label: 'یادداشت‌های گرامری' },
    { key: 'word_family', label: 'خانواده کلمه' },
    { key: 'memory_strength', label: 'قدرت حافظه' },
    { key: 'spaced_repetition_dates', label: 'تاریخ‌های تکرار' },
    { key: 'difficulty_level', label: 'سطح دشواری' },
    { key: 'category', label: 'دسته‌بندی' },
    { key: 'synonyms', label: 'مترادف‌ها' },
    { key: 'antonyms', label: 'متضادها' },
    { key: 'usage_frequency', label: 'فراوانی استفاده' },
    { key: 'related_words', label: 'کلمات مرتبط' },
    { key: 'source', label: 'منبع' },
    { key: 'notes', label: 'یادداشت‌ها' },
    { key: 'example_audio_url', label: 'لینک صوتی مثال' },
  ] : [
    { key: 'word', label: 'Word' },
    { key: 'meaning', label: 'Meaning' },
    { key: 'part_of_speech', label: 'Part of Speech' },
    { key: 'phonetic', label: 'Phonetic' },
    { key: 'etymology', label: 'Etymology' },
    { key: 'examples', label: 'Examples' },
    { key: 'mnemonics', label: 'Mnemonics' },
    { key: 'collocations', label: 'Collocations' },
    { key: 'common_mistakes', label: 'Common Mistakes' },
    { key: 'formality_level', label: 'Formality' },
    { key: 'cultural_notes', label: 'Cultural Notes' },
    { key: 'gesture_association', label: 'Gesture Association' },
    { key: 'emotional_connotation', label: 'Emotional Connotation' },
    { key: 'grammar_notes', label: 'Grammar Notes' },
    { key: 'word_family', label: 'Word Family' },
    { key: 'memory_strength', label: 'Memory Strength' },
    { key: 'spaced_repetition_dates', label: 'Spaced Repetition Dates' },
    { key: 'difficulty_level', label: 'Difficulty' },
    { key: 'category', label: 'Category' },
    { key: 'synonyms', label: 'Synonyms' },
    { key: 'antonyms', label: 'Antonyms' },
    { key: 'usage_frequency', label: 'Usage Frequency' },
    { key: 'related_words', label: 'Related Words' },
    { key: 'source', label: 'Source' },
    { key: 'notes', label: 'Notes' },
    { key: 'example_audio_url', label: 'Example Audio URL' },
  ];

  return (
    <Box sx={{
      p: 3,
      background: theme.palette.background.cardDetail(selectedTheme),
      height: '100%',
      overflowY: 'auto',
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      {detailOrder.map(item => (
        <DetailItem key={item.key} label={item.label} value={wordData[item.key]} />
      ))}
    </Box>
  );
};

export default WordDetails;