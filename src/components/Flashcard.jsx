import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { motion } from 'framer-motion';

const Flashcard = ({
  wordData,
  isRevealed,
  showEnglishFirst,
  onCardClick,
  onPlayAudio,
}) => {
  if (!wordData) {
    return null; // Or a loading/empty state card
  }

  const {
    word,
    meaning,
    phonetic_farsi,
    part_of_speech,
    examples,
    example_audio_url,
  } = wordData;

  const frontContent = showEnglishFirst ? word : meaning;
  const backContent = showEnglishFirst ? meaning : word;

  const handleAudioClick = (e) => {
      e.stopPropagation(); // Prevent card click when clicking audio icon
      if (onPlayAudio && example_audio_url) {
          onPlayAudio(example_audio_url);
      }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{ width: '100%' }} // Ensure motion div takes full width
    >
      <Card
        sx={{
          width: '100%',
          minHeight: 250, // Adjust as needed
          borderRadius: 4, // More rounded corners like the image
          backgroundColor: '#FFFFFF',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isRevealed ? 'flex-start' : 'center', // Center front content vertically
          alignItems: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: 2,
          boxSizing: 'border-box',
        }}
        onClick={onCardClick}
      >
        {example_audio_url && (
           <IconButton
             onClick={handleAudioClick}
             sx={{ position: 'absolute', top: 8, right: 8, color: '#757575' }}
             aria-label="play audio"
           >
             <VolumeUpIcon />
           </IconButton>
        )}
        <CardContent sx={{width: '100%'}}>
          {!isRevealed ? (
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {frontContent}
            </Typography>
          ) : (
            <Box sx={{ textAlign: 'left', width: '100%' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {word}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 0.5 }}>
                {phonetic_farsi || ''}
              </Typography>
               <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 1.5 }}>
                {part_of_speech || ''}
              </Typography>
               <Divider sx={{ my: 1 }}/>
              <Typography variant="h6" component="div" sx={{ mt: 1.5, mb: 0.5 }}>
                {meaning}
              </Typography>
               <Divider sx={{ my: 1 }}/>
               <Typography sx={{ mt: 1.5, mb: 0.5, fontWeight:'bold' }}>
                 Examples:
               </Typography>
               {examples?.slice(0, 1).map((ex, index) => ( // Show only first example for brevity
                  <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{mb: 0.5}}>{ex.sentence}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{ex.translation}</Typography>
                  </Box>
               ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Flashcard;