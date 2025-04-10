import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence } from 'framer-motion';

import Flashcard from '../components/Flashcard';
import ReviewControls from '../components/ReviewControls';
import { getTodayDateString, shuffleArray } from '../utils/helpers';
import { colors } from '../styles/colors'; // Assuming you still have this

const WordsReviewScreen = ({
    initialWords = [],
    showEnglishFirst = true, // Configurable prop
    removeReviewedInstantly = false, // Configurable prop
    onUpdateWord, // Callback to handle persistent updates: onUpdateWord(wordId, updates)
}) => {
    const navigate = useNavigate();
    const [reviewWords, setReviewWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [sessionUpdates, setSessionUpdates] = useState({}); // Track updates within the session

    const audioRef = useRef(null); // For playing audio

    // Initial processing of words
    useEffect(() => {
        const today = getTodayDateString();
        const wordsDueToday = initialWords.filter(word =>
            !word.is_deleted && word.spaced_repetition_dates?.includes(today)
        );

        // Optional: Prioritize harder words (simple example: more wrongs wins)
        wordsDueToday.sort((a, b) => {
             const scoreA = (a.wrong_reviews || 0) - (a.correct_reviews || 0);
             const scoreB = (b.wrong_reviews || 0) - (b.correct_reviews || 0);
             return scoreB - scoreA; // Higher score (more wrongs) comes first
        });


        const shuffledWords = shuffleArray(wordsDueToday);
        setReviewWords(shuffledWords);
        setCurrentIndex(0);
        setIsRevealed(false);
        setSessionUpdates({}); // Reset session updates on new data/mount
    }, [initialWords]); // Re-process if initialWords changes

    const currentWordData = useMemo(() => {
        if (reviewWords.length === 0 || currentIndex >= reviewWords.length) {
            return null;
        }
        const originalWord = reviewWords[currentIndex];
        // Merge session updates with original data for display
        return { ...originalWord, ...(sessionUpdates[originalWord.word] || {}) };
    }, [reviewWords, currentIndex, sessionUpdates]);

    const totalWordsToReview = reviewWords.length;

    const handleNavigate = useCallback((direction) => {
        setIsRevealed(false); // Hide details on navigation
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < totalWordsToReview) {
            setCurrentIndex(newIndex);
        } else if (newIndex >= totalWordsToReview) {
            // Optional: Handle completion (e.g., show summary, navigate away)
            setCurrentIndex(0); // Loop back for now
        } else {
             setCurrentIndex(totalWordsToReview - 1); // Loop to end if going back from start
        }
    }, [currentIndex, totalWordsToReview]);

    const handleReviewAction = useCallback((isCorrect) => {
        if (!currentWordData) return;

        const wordId = currentWordData.word; // Assuming 'word' is unique ID
        const updates = {
            correct_reviews: (currentWordData.correct_reviews || 0) + (isCorrect ? 1 : 0),
            wrong_reviews: (currentWordData.wrong_reviews || 0) + (isCorrect ? 0 : 1),
            last_reviewed: getTodayDateString(),
        };

        // Update session state immediately for UI reactivity
        setSessionUpdates(prev => ({
            ...prev,
            [wordId]: { ...(prev[wordId] || {}), ...updates }
        }));


        // Trigger persistent update via callback
        if (onUpdateWord) {
            onUpdateWord(wordId, updates);
        }


         // Optional: Remove from current session review list
         if (removeReviewedInstantly) {
             setReviewWords(prev => prev.filter((_, index) => index !== currentIndex));
             // Adjust index carefully after removal
             if (currentIndex >= reviewWords.length - 1) {
                setCurrentIndex(0); // Go to start if last was removed
             }
             // No need to increment index here as the array shifts
         } else {
              // Navigate to next card after a short delay to see feedback? Or instantly?
              handleNavigate(1); // Go to next card
         }

    }, [currentWordData, onUpdateWord, handleNavigate, currentIndex, removeReviewedInstantly, reviewWords.length]);


    const handleCardClick = () => {
        setIsRevealed(prev => !prev);
    };

    const handlePlayAudio = useCallback((audioUrl) => {
        if (audioRef.current) {
            audioRef.current.pause(); // Stop previous audio if any
        }
        audioRef.current = new Audio(audioUrl);
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
    }, []);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleNavigate(1),
        onSwipedRight: () => handleNavigate(-1),
        preventScrollOnSwipe: true,
        trackMouse: true // Allow mouse swiping on desktop for testing
    });

    const screenBackgroundColor = '#5D5FEF'; // Purple background from image

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: screenBackgroundColor,
                display: 'flex',
                flexDirection: 'column',
                color: '#FFFFFF', // Default text color for the screen
            }}
        >
            <AppBar
                position="static"
                sx={{ backgroundColor: 'transparent', boxShadow: 'none', color: '#FFFFFF' }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="body1" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        Basic word {/* Replace with dynamic title if needed */}
                    </Typography>
                     <Typography variant="body2" component="div" sx={{minWidth: 50, textAlign: 'right'}}>
                         {totalWordsToReview > 0 ? `${currentIndex + 1}/${totalWordsToReview}` : '0/0'}
                    </Typography>
                </Toolbar>
            </AppBar>

             {/* Audio element (hidden) */}
            {/* <audio ref={audioRef} /> */}


            <Box
                {...swipeHandlers}
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: '10px 20px 20px 20px', // Adjust padding
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center', // Center card vertically if space allows
                    overflow: 'hidden', // Prevent unwanted scrollbars from animations
                }}
            >
                <AnimatePresence mode="wait">
                    {currentWordData ? (
                        // Using key tells AnimatePresence it's a new element
                         <Box key={currentWordData.word} sx={{width: '100%', display:'flex', justifyContent:'center'}}>
                            <Flashcard
                                wordData={currentWordData}
                                isRevealed={isRevealed}
                                showEnglishFirst={showEnglishFirst}
                                onCardClick={handleCardClick}
                                onPlayAudio={handlePlayAudio}
                            />
                        </Box>
                    ) : (
                         <Typography sx={{mt: 4}}>No words to review today!</Typography>
                    )}
                </AnimatePresence>

                {totalWordsToReview > 0 && currentWordData && (
                    <ReviewControls
                        onCorrect={() => handleReviewAction(true)}
                        onIncorrect={() => handleReviewAction(false)}
                    />
                )}

                {/* Placeholder for the 'hint' text box if needed later */}
                 {/* <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, width: '100%'}}>
                     <Typography variant="caption">Take the time to sit back...</Typography>
                 </Box> */}

                  {/* Placeholder for sentence input if needed later */}
                  {/* <Box sx={{ mt: 2, width: '100%' }}> ... Input field ... </Box> */}

            </Box>
        </Box>
    );
};

export default WordsReviewScreen;