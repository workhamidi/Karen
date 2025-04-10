// WordsReview.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Container, Typography, IconButton, LinearProgress, Paper } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import shuffle from 'lodash.shuffle'; // For shuffling the array

import Flashcard from './Flashcard'; // Assuming Flashcard component is in a separate file
import CardControls from './CardControls'; // Assuming CardControls component is in a separate file

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const WordsReview = ({
  initialWords = [], // Array of word objects from JSON
  reviewMode = 'word', // 'word' or 'meaning' - determines initial display
  removeFromSession = true, // Remove card from current review session after marking
  onUpdateWord, // Function to persist updates (receives updated word object)
}) => {
  const [reviewList, setReviewList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0); // For animation direction

  const today = useMemo(() => getTodayDateString(), []);

  useEffect(() => {
    // 1. Filter words for today's review
    const wordsForToday = initialWords.filter(word =>
      word.spaced_repetition_dates && word.spaced_repetition_dates.includes(today)
    );

    // 2. Sort: prioritize higher wrong_reviews, then lower correct_reviews
    const sortedWords = [...wordsForToday].sort((a, b) => {
      if (a.wrong_reviews !== b.wrong_reviews) {
        return b.wrong_reviews - a.wrong_reviews; // Higher wrong reviews first
      }
      return a.correct_reviews - b.correct_reviews; // Lower correct reviews first
    });

    // 3. Shuffle the sorted list for unpredictability
    const shuffledWords = shuffle(sortedWords);

    setReviewList(shuffledWords);
    setCurrentIndex(0); // Reset index when list changes
    setIsFlipped(false); // Reset flip state
  }, [initialWords, today]); // Rerun if initial words change

  const currentWord = useMemo(() => {
      return reviewList.length > 0 && currentIndex < reviewList.length
             ? reviewList[currentIndex]
             : null;
  }, [reviewList, currentIndex]);


  const handleNavigate = (newDirection) => {
    if (!currentWord) return;

    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < reviewList.length) {
      setDirection(newDirection); // For animation
      setIsFlipped(false); // Flip back when changing card
      setCurrentIndex(newIndex);
    }
    // Potentially loop around? Or stop at ends? Currently stops.
  };

  const handleReview = useCallback((isCorrect) => {
    if (!currentWord || !onUpdateWord) return;

    const updatedWord = {
      ...currentWord,
      correct_reviews: isCorrect ? currentWord.correct_reviews + 1 : currentWord.correct_reviews,
      wrong_reviews: !isCorrect ? currentWord.wrong_reviews + 1 : currentWord.wrong_reviews,
      last_reviewed: today,
      // Remove today's date from spaced repetition dates
      spaced_repetition_dates: currentWord.spaced_repetition_dates.filter(date => date !== today),
    };

    // Call the callback function to persist the changes
    onUpdateWord(updatedWord);

    // Set direction for animation based on correct/incorrect (optional aesthetic)
    setDirection(isCorrect ? 1 : -1);


    // Remove from session list if flag is true, or move to next
    if (removeFromSession) {
        // Create a new list excluding the reviewed word
        const nextReviewList = reviewList.filter((_, index) => index !== currentIndex);

        // Important: Adjust index IF we removed an item *before* the current potential next item
        // Since we're always moving forward implicitly after removal, the next item will be at the *same* `currentIndex`
        // If we were at the last item, reset index or handle end state.
        const nextIndex = (currentIndex >= nextReviewList.length && nextReviewList.length > 0)
                        ? nextReviewList.length - 1 // Go to new last item if we removed the old last one
                        : currentIndex; // Stay at the same index, which now points to the next item

        setReviewList(nextReviewList);
        // Ensure the index doesn't go out of bounds if the list becomes empty
         if (nextReviewList.length === 0) {
            setCurrentIndex(0);
         } else {
             setCurrentIndex(Math.max(0, nextIndex)); // Clamp index just in case
         }

    } else {
         // Just move to the next card without removing
         if (currentIndex < reviewList.length - 1) {
             setCurrentIndex(currentIndex + 1);
         } else {
             // Handle end of list if not removing (e.g., show completion message or loop)
             console.log("End of review list (non-removal mode)");
             // Maybe set currentIndex to 0 to loop, or show a message
         }
    }


    setIsFlipped(false); // Reset flip state for the next card

  }, [currentWord, currentIndex, reviewList, onUpdateWord, today, removeFromSession]);


  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNavigate(1), // Swipe left -> Next card
    onSwipedRight: () => handleNavigate(-1), // Swipe right -> Previous card
    preventScrollOnSwipe: true,
    trackMouse: true, // Allow swiping with mouse too
  });

  // Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300, // Enter from right or left
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300, // Exit to right or left
      opacity: 0,
    }),
  };

  const totalWordsInSession = reviewList.length;

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', py: 2, bgcolor: 'primary.dark', borderRadius: 4 }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', px: 1 }}>
        <IconButton color="inherit">
          <ArrowBackIosNewIcon /> {/* Back button functionality can be added */}
        </IconButton>
        <Typography variant="body1">
          {currentWord ? `${currentIndex + 1} / ${totalWordsInSession}` : '0 / 0'}
        </Typography>
        <Box>
         {currentWord?.example_audio_url && currentWord.example_audio_url.map((url, index) => (
             <IconButton key={index} color="inherit" onClick={() => {
                 try {
                     const audio = new Audio(url);
                     audio.play();
                 } catch (error) {
                     console.error("Error playing audio:", error)
                 }
                }}>
                 <VolumeUpIcon />
             </IconButton>
          ))}
        </Box>

      </Box>

        {/* Progress Bar */}
       {totalWordsInSession > 0 && (
        <LinearProgress
            variant="determinate"
            value={(currentIndex + 1) / totalWordsInSession * 100}
            sx={{ my: 1 , mx: 1, height: 6, borderRadius: 3}}
            />
       )}


      {/* Flashcard Area */}
      <Box {...swipeHandlers} sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', mb: 2 }}>
        <AnimatePresence initial={false} custom={direction}>
          {currentWord ? (
            <motion.div
              key={currentIndex} // Important for AnimatePresence to detect changes
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              style={{ position: 'absolute', width: '90%'}} // Position absolute for smooth transitions
              >
               <Flashcard
                  wordData={currentWord}
                  isFlipped={isFlipped}
                  reviewMode={reviewMode}
                  onFlip={handleFlip}
                />
             </motion.div>
            ) : (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3}}>
                <Typography variant="h6" color="text.secondary">
                 {initialWords.length === 0 ? "No words loaded." : "No words to review today!"}
                 </Typography>
            </Paper>
           )}
        </AnimatePresence>
      </Box>


      {/* Controls Area */}
     {currentWord && (
        <CardControls onReview={handleReview} />
     )}

    {/* Optional: Example Sentence / Tip Area */}
      <Box sx={{ mt: 1, p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, mx:1}}>
            <Typography variant="caption" color="white" sx={{textAlign:'center', display: 'block'}}>
                 {currentWord?.examples[0]?.sentence || "Take the time to sit back and listen and establish a routine for yourself."}
            </Typography>
      </Box>

     {/* Optional: Input Area - Placeholder */}
      <Box sx={{ mt: 1, px: 1}}>
         <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', borderRadius: 3 }}>
           <input
                placeholder="Write your sentence..."
                style={{marginLeft: 8, flex: 1, border:'none', outline: 'none', background: 'transparent'}}
           />
           <IconButton color="primary" sx={{ p: '10px' }}>
                 <ArrowForwardIosIcon /> {/* Replace with Send Icon if needed */}
           </IconButton>
         </Paper>
      </Box>


    </Container>
  );
};

export default WordsReview;