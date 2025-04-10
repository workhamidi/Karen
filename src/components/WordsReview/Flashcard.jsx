// Flashcard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const Flashcard = ({ wordData, isFlipped, reviewMode, onFlip }) => {
  if (!wordData) return null;

  const {
    word,
    meaning,
    phonetic_farsi,
    part_of_speech,
    examples = [], // Default to empty array if missing
    etymology,
    mnemonics = [],
    synonyms = [],
    antonyms = [],
    // Add other fields you want to display when flipped
  } = wordData;

  const frontContent = reviewMode === 'word' ? word : meaning;
  const backContent = reviewMode === 'word' ? meaning : word;

  return (
    <motion.div
        onClick={onFlip}
        whileHover={{ scale: 1.02 }}
        style={{ borderRadius: '16px', cursor: 'pointer'}} // Apply border radius here
        >
       <Card
        sx={{
          minHeight: 250, // Adjust height as needed
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: 2,
          backgroundColor: 'white', // Flashcard background
          borderRadius: '16px', // Ensure card itself has radius
          overflow: 'hidden', // Hide overflowing content during flip maybe
        }}
        elevation={4} // Add some shadow
        >
         <CardContent sx={{width: '100%'}}>
            {/* Always show the primary word/meaning based on mode */}
             <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                 {isFlipped ? backContent : frontContent}
             </Typography>

            {/* Show pronunciation/hint only on the front if not flipped */}
            {!isFlipped && phonetic_farsi && reviewMode === 'word' && (
                <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>
                  {phonetic_farsi.split(' ')[0]} {/* Show only IPA part */}
                </Typography>
            )}
             {!isFlipped && reviewMode === 'meaning' && (
                <Typography sx={{ mb: 1.5, color: 'text.secondary', fontStyle:'italic' }}>
                  (Hint: {part_of_speech})
                </Typography>
            )}


            {/* Content revealed on flip */}
            {isFlipped && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.3, delay: 0.1 }} // Slight delay after flip
               >
                   <Divider sx={{ my: 1.5 }} />
                   <Typography variant="h5" gutterBottom>
                      {isFlipped ? frontContent : backContent} {/* Show the other side */}
                   </Typography>
                   {phonetic_farsi && (
                      <Typography sx={{ mb: 1, color: 'text.secondary' }}>
                        {phonetic_farsi}
                       </Typography>
                     )}
                     <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                       {part_of_speech}
                     </Typography>
                     {examples.length > 0 && (
                        <Box sx={{textAlign: 'left', my: 1}}>
                         <Typography variant="caption" display="block" sx={{fontWeight:'bold'}}>Examples:</Typography>
                             <Typography variant="body2">{examples[0].sentence}</Typography>
                            <Typography variant="caption" color="text.secondary" >{examples[0].translation}</Typography>
                             {examples.length > 1 && <>
                               <Typography variant="body2" sx={{mt:0.5}}>{examples[1].sentence}</Typography>
                               <Typography variant="caption" color="text.secondary" >{examples[1].translation}</Typography>
                             </>}
                         </Box>
                     )}
                      {/* Add more details here */}
                       {synonyms.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display:'block' }}>
                           Syn: {synonyms.join(', ')}
                         </Typography>
                       )}
                      {antonyms.length > 0 && (
                         <Typography variant="caption" color="text.secondary" sx={{display:'block'}}>
                          Ant: {antonyms.join(', ')}
                         </Typography>
                        )}
                </motion.div>
             )}

           </CardContent>
       </Card>
    </motion.div>

  );
};

export default Flashcard;