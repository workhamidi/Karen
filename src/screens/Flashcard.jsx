import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import EditIcon from '@mui/icons-material/Edit'; // Import Edit icon
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { motion } from 'framer-motion';

// Helper to render list items nicely
const RenderList = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display:'block', mb: 0.5 }}>{title}:</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {items.map((item, index) => (
                    <Chip key={index} label={item} size="small" variant="outlined" />
                ))}
            </Stack>
        </Box>
    );
};

// Helper to render simple key-value pairs
const RenderInfo = ({ label, value }) => {
    if (!value) return null;
    return (
         <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            <Typography component="span" sx={{ fontWeight: 'bold' }}>{label}:</Typography> {value}
         </Typography>
    );
}

const Flashcard = ({
  wordData,
  isRevealed,
  showEnglishFirst,
  onCardClick,
  onPlayAudio,
  onEditClick, // New prop for edit handler
}) => {
  if (!wordData) {
    return null; // Or a loading/empty state card
  }

  // Destructure ALL fields from wordData based on the updated transform function
  const {
    word, meaning, part_of_speech, phonetic_farsi, etymology, examples = [],
    mnemonics = [], visual_mnemonic, collocations = [], common_mistakes = [],
    formality_level, cultural_notes, gesture_association, emotional_connotation,
    grammar_notes, word_family = [], variants = [], memory_strength,
    // spaced_repetition_dates, // Usually not displayed directly
    difficulty_level, category, synonyms = [], antonyms = [], usage_frequency,
    related_words = [], source, notes, example_audio_url,
    // _originalRowIndex, is_deleted, correct_reviews, wrong_reviews, last_reviewed // Internal/meta data
  } = wordData;

  const frontContent = showEnglishFirst ? word : meaning;

  const handleAudioClick = (e) => {
      e.stopPropagation();
      if (onPlayAudio && example_audio_url) {
          onPlayAudio(example_audio_url);
      }
  }

  const handleEditClick = (e) => {
      e.stopPropagation(); // Prevent card click
      if (onEditClick) {
          onEditClick(wordData); // Pass the full word data back
      }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{ width: '100%', maxWidth: '450px' /* Optional max width */ }}
    >
      <Card
        sx={{
          width: '100%',
          minHeight: isRevealed ? 400 : 250, // Increase min height when revealed
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start', // Always start from top
          alignItems: 'center', // Center horizontally
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '16px', // Consistent padding
          boxSizing: 'border-box',
          overflowY: isRevealed ? 'auto' : 'hidden', // Allow scroll when revealed
        }}
        onClick={onCardClick}
      >
         {/* --- Top Right Icons --- */}
         <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
             {onEditClick && isRevealed && ( // Show Edit only when revealed
                <IconButton onClick={handleEditClick} sx={{ color: '#757575' }} aria-label="edit word" size="small">
                    <EditIcon fontSize="small"/>
                </IconButton>
             )}
            {example_audio_url && (
                <IconButton onClick={handleAudioClick} sx={{ color: '#757575' }} aria-label="play audio" size="small">
                    <VolumeUpIcon fontSize="small"/>
                </IconButton>
            )}
         </Box>

         {/* --- Card Content --- */}
        <CardContent sx={{ width: '100%', textAlign: isRevealed ? 'left' : 'center', pt: isRevealed ? 4 : 0 /* Add padding top when revealed to avoid overlap with icons */ }}>
          {!isRevealed ? (
            // --- Front View ---
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' /* Fixed height for centering */}}>
                 <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {frontContent}
                 </Typography>
            </Box>
          ) : (
             // --- Revealed View ---
            <Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {word}
              </Typography>
               {phonetic_farsi && <Typography sx={{ color: 'text.secondary', mb: 0.5 }}>{phonetic_farsi}</Typography>}
               {part_of_speech && <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 1.5 }}>({part_of_speech})</Typography>}

              <Divider sx={{ my: 1 }}/>
              <Typography variant="h6" component="div" sx={{ mt: 1.5, mb: 0.5 }}>
                {meaning}
              </Typography>
               {etymology && <Typography variant="caption" sx={{ color: 'text.secondary', display:'block', mb: 1.5 }}>ریشه: {etymology}</Typography>}

               {/* --- Examples --- */}
               {examples && examples.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold', display:'block' }}>Examples:</Typography>
                      {examples.map((ex, index) => (
                          <Box key={index} sx={{ my: 1, pl: 1, borderLeft: '2px solid #eee' }}>
                              <Typography variant="body2">{ex.sentence}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{ex.translation}</Typography>
                          </Box>
                      ))}
                  </Box>
               )}

                <Divider sx={{ my: 2 }}/>

                {/* --- Additional Info Sections --- */}
                {visual_mnemonic && (
                    <Box sx={{my: 1.5, textAlign: 'center'}}>
                        <img src={visual_mnemonic} alt={`${word} visual mnemonic`} style={{maxWidth: '80%', maxHeight:'150px', borderRadius: '4px'}}/>
                    </Box>
                )}

                <RenderList title="Synonyms" items={synonyms} />
                <RenderList title="Antonyms" items={antonyms} />
                <RenderList title="Collocations" items={collocations} />
                <RenderList title="Related Words" items={related_words} />
                <RenderList title="Word Family" items={word_family} />
                <RenderList title="Common Mistakes" items={common_mistakes} />

                {/* --- Mnemonics --- */}
                {mnemonics && mnemonics.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold', display:'block' }}>Mnemonics:</Typography>
                      {mnemonics.map((mem, index) => (
                          <Box key={index} sx={{ my: 1}}>
                              <Typography variant="caption" sx={{fontWeight:'bold', color: 'text.secondary'}}>{mem.technique || 'Tip'}:</Typography>
                              <Typography variant="body2" sx={{pl: 1}}>{mem.text}</Typography>
                          </Box>
                      ))}
                  </Box>
               )}

                <Divider sx={{ my: 2 }}/>

                {/* --- Other Details --- */}
                <RenderInfo label="Difficulty" value={difficulty_level} />
                <RenderInfo label="Category" value={category} />
                <RenderInfo label="Formality" value={formality_level} />
                <RenderInfo label="Usage Frequency" value={usage_frequency} />
                <RenderInfo label="Emotional Connotation" value={emotional_connotation} />
                <RenderInfo label="Source" value={source} />
                {grammar_notes && <Box sx={{mt: 1.5}}><Typography variant="overline" sx={{ fontWeight: 'bold', display:'block' }}>Grammar:</Typography><Typography variant="body2">{grammar_notes}</Typography></Box>}
                {cultural_notes && <Box sx={{mt: 1.5}}><Typography variant="overline" sx={{ fontWeight: 'bold', display:'block' }}>Culture:</Typography><Typography variant="body2">{cultural_notes}</Typography></Box>}
                {gesture_association && <RenderInfo label="Gesture" value={gesture_association} />}
                {notes && <Box sx={{mt: 1.5}}><Typography variant="overline" sx={{ fontWeight: 'bold', display:'block' }}>Notes:</Typography><Typography variant="body2">{notes}</Typography></Box>}
                 {/* Display memory strength if needed */}
                 {memory_strength !== undefined && <RenderInfo label="Memory Strength" value={memory_strength} />}

            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Flashcard;