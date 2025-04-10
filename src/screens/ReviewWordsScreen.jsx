import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button'; // For Sign in if needed inline
import GoogleIcon from '@mui/icons-material/Google'; // For Sign in button
import { format, parseISO, isToday } from 'date-fns'; // Date functions
import { useSwipeable } from 'react-swipeable'; // Swipe hook

import { useGoogleSheetApi } from '../Api/GoogleSheetApi'; // Adjust path
import { useSettings } from '../context/SettingsContext'; // If needed for settings like display mode
import { colors } from '../styles/colors'; // Adjust path

import ReviewHeader from '../components/ReviewHeader';
import Flashcard from '../components/Flashcard';
import ReviewControls from '../components/ReviewControls';
import ReviewModePrompt from '../components/ReviewModePrompt';

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

// Function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

const ReviewWordsScreen = () => {
    const navigate = useNavigate();
    const {
        isApiReady, isSignInReady, isGapiLoading, isSignedIn, error: apiError,
        handleSignIn, handleSignOut, getAllWords, updateWord,
    } = useGoogleSheetApi();
    // TODO: Get display mode setting from context if implemented
    // const { reviewDisplayMode } = useSettings(); // Example
    const reviewDisplayMode = 'word'; // Hardcoded for now, get from settings later

    const [allWords, setAllWords] = useState([]); // Store all fetched words
    const [reviewList, setReviewList] = useState([]); // Current list being reviewed
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // Combined loading state
    const [error, setError] = useState(null); // Combined error state
    const [reviewPhase, setReviewPhase] = useState('loading'); // loading, daily, finished_daily, all, finished_all
    const [showDetails, setShowDetails] = useState(false); // Card flip state

    const todayString = useMemo(() => getTodayDateString(), []);

    // --- Data Fetching and Preparation ---
    const prepareReviewLists = useCallback((words) => {
        console.log('[ReviewScreen] Preparing review lists...');
        setAllWords(words); // Store all words

        // Daily Review List
        const dailyList = words.filter(word =>
            word && Array.isArray(word.spaced_repetition_dates) && word.spaced_repetition_dates.includes(todayString)
        );
        console.log(`[ReviewScreen] Found ${dailyList.length} words for today.`);

        if (dailyList.length > 0) {
            setReviewList(shuffleArray([...dailyList])); // Shuffle a copy
            setCurrentIndex(0);
            setShowDetails(false);
            setReviewPhase('daily');
        } else {
            // No words for today, maybe prompt for 'all' immediately?
             console.log('[ReviewScreen] No words scheduled for today.');
             setReviewList([]);
             setCurrentIndex(0);
             setShowDetails(false);
             setReviewPhase('finished_daily'); // Go directly to prompt
        }
        setError(null); // Clear previous errors on successful prep
    }, [todayString]);

    const fetchData = useCallback(async () => {
         if (!isApiReady || !isSignedIn) return;
         console.log(`[ReviewScreen] Starting initial data fetch...`);
         setIsLoading(true); setError(null); setReviewPhase('loading');
         try {
           const fetchedWords = await getAllWords();
           prepareReviewLists(fetchedWords || []);
         } catch (err) {
           console.error('[ReviewScreen] Error fetching words:', err);
           setError(apiError || err.message || 'Failed to fetch words.');
           setReviewPhase('error'); // Set error phase
         } finally {
           setIsLoading(false);
         }
      }, [getAllWords, isApiReady, isSignedIn, prepareReviewLists, apiError]); // Added apiError

    // Initial data fetch on mount or when sign-in/API ready status changes
    useEffect(() => {
        console.log(`[ReviewScreen] Mount/State Check: ApiReady=${isApiReady}, SignedIn=${isSignedIn}`);
        if (isApiReady && isSignedIn) {
             // Only fetch if we don't have words yet OR if reviewList is empty (e.g., after sign-in)
             if(allWords.length === 0) {
                fetchData();
             } else if (reviewList.length === 0 && reviewPhase !== 'finished_daily' && reviewPhase !== 'all' && reviewPhase !== 'finished_all') {
                 // If API became ready after mount and we have allWords, but no review list yet
                 console.log("[ReviewScreen] API ready, preparing lists from existing data.");
                 prepareReviewLists(allWords);
             }
        } else {
            // Clear state if user signs out or API becomes not ready
            setAllWords([]);
            setReviewList([]);
            setCurrentIndex(0);
            setReviewPhase('loading'); // Or based on signedIn status
            setError(null);
        }
    }, [isApiReady, isSignedIn, fetchData, prepareReviewLists, allWords, reviewList.length, reviewPhase]); // Dependencies to trigger fetch/prep


    // --- Navigation and Actions ---
    const goToNextCard = useCallback(() => {
        if (currentIndex < reviewList.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowDetails(false); // Hide details on nav
        } else {
            // Reached end of current list
            if (reviewPhase === 'daily') {
                setReviewPhase('finished_daily');
            } else if (reviewPhase === 'all') {
                setReviewPhase('finished_all');
            }
        }
    }, [currentIndex, reviewList.length, reviewPhase]);

    const goToPrevCard = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setShowDetails(false); // Hide details on nav
        }
    }, [currentIndex]);

    const handleReviewAction = useCallback(async (isCorrect) => {
        if (reviewList.length === 0 || currentIndex >= reviewList.length) return;

        const currentWord = reviewList[currentIndex];
        if (!currentWord) return;

        console.log(`[ReviewScreen] handleReviewAction for "${currentWord.word}", Correct: ${isCorrect}`);
        setError(null); // Clear previous action errors

        // Optimistic UI update (optional but good for UX)
        // You could remove the item from a temporary display list immediately

        // Prepare updated data
        const updatedWord = {
            ...currentWord,
            correct_reviews: (currentWord.correct_reviews || 0) + (isCorrect ? 1 : 0),
            wrong_reviews: (currentWord.wrong_reviews || 0) + (!isCorrect ? 1 : 0),
            last_reviewed: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), // Add timestamp
            // Remove today's date from spaced repetition list
            spaced_repetition_dates: (currentWord.spaced_repetition_dates || []).filter(date => date !== todayString),
        };

        try {
            await updateWord(currentWord.word, updatedWord);
            console.log(`[ReviewScreen] Update successful for "${currentWord.word}"`);
             // Update the word in the main 'allWords' list as well
             setAllWords(prev => prev.map(w => w.word === currentWord.word ? updatedWord : w));
             // Update reviewList (optional, could just navigate)
            // setReviewList(prev => prev.map(w => w.word === currentWord.word ? updatedWord : w));

            goToNextCard();
        } catch (err) {
            console.error(`[ReviewScreen] Failed to update word "${currentWord.word}"`, err);
            setError(apiError || err.message || `Failed to save review for "${currentWord.word}".`);
            // Note: No rollback implemented for optimistic UI update here
        }

    }, [reviewList, currentIndex, updateWord, todayString, goToNextCard, apiError, setAllWords]);


    const handleStartReviewAll = useCallback(() => {
        console.log('[ReviewScreen] Starting review of all words.');
        setError(null);
        if (allWords.length === 0) {
            setError("No words available to review.");
            setReviewPhase('error');
            return;
        }

        // Sort and Shuffle "All Words"
        const sortedWords = [...allWords].sort((a, b) => {
            // Priority 1: Higher wrong_reviews first
            if ((b.wrong_reviews || 0) > (a.wrong_reviews || 0)) return 1;
            if ((b.wrong_reviews || 0) < (a.wrong_reviews || 0)) return -1;
            // Priority 2: Lower correct_reviews first
            if ((a.correct_reviews || 0) < (b.correct_reviews || 0)) return -1;
            if ((a.correct_reviews || 0) > (b.correct_reviews || 0)) return 1;
            // Priority 3: Less recently reviewed (or never) first (optional)
            // const dateA = a.last_reviewed ? parseISO(a.last_reviewed) : new Date(0);
            // const dateB = b.last_reviewed ? parseISO(b.last_reviewed) : new Date(0);
            // if (dateA < dateB) return -1;
            // if (dateA > dateB) return 1;
            return 0; // Keep original order if all else equal before shuffle
        });

        setReviewList(shuffleArray(sortedWords));
        setCurrentIndex(0);
        setShowDetails(false);
        setReviewPhase('all');

    }, [allWords]);

    const handleFinishReview = () => {
        console.log('[ReviewScreen] Finishing review session.');
        navigate('/'); // Navigate home or to another appropriate screen
    };

     const handleFlipCard = () => {
         setShowDetails(prev => !prev);
     };

     // Swipe handlers for Flashcard
     const swipeHandlers = useSwipeable({
         onSwipedLeft: () => { console.log("Swiped Left"); goToNextCard(); },
         onSwipedRight: () => { console.log("Swiped Right"); goToPrevCard(); },
         preventScrollOnSwipe: true,
         trackMouse: true, // Allow mouse dragging like swipe
     });

    // --- Render Logic ---
    const renderMainContent = () => {
         if (reviewPhase === 'loading' || isLoading) return <CircularProgress sx={{ color: colors.primary, mt: 4, display: 'block', mx: 'auto' }} />;
         if (reviewPhase === 'error') return <Alert severity="error" sx={{ mt: 2 }}>Error: {error || apiError || 'An unknown error occurred.'}</Alert>;
         if (!isSignedIn) {
             // Show Sign in prompt centrally if not signed in
             return (
                 <Box sx={{ textAlign: 'center', mt: '20vh' }}>
                     <Typography sx={{ mb: 2, color: colors.textSecondary }}> Please sign in to review words. </Typography>
                     <Button variant="contained" startIcon={<GoogleIcon />} onClick={handleSignIn} disabled={!isSignInReady} sx={{ backgroundColor: colors.primary, '&:hover': { backgroundColor: colors.primaryDark }}}>
                         {isSignInReady ? 'Sign In with Google' : 'Initializing Sign In...'}
                     </Button>
                 </Box>
             );
         }

         if (reviewPhase === 'finished_daily') {
             return <ReviewModePrompt onReviewAll={handleStartReviewAll} onFinish={handleFinishReview} />;
         }

         if (reviewPhase === 'finished_all') {
             return (
                  <Paper sx={{ p: 3, mt: 4, textAlign: 'center', background: colors.cardBackground, color: colors.cardText }}>
                     <Typography variant="h6">All words reviewed!</Typography>
                     <Button variant="contained" onClick={handleFinishReview} sx={{ mt: 2 }}>Finish</Button>
                 </Paper>
             );
         }

         if (reviewList.length === 0 && (reviewPhase === 'daily' || reviewPhase === 'all')) {
             return (
                 <Typography sx={{ color: colors.textSecondary, mt: 3, textAlign: 'center' }}>
                      No words available for the current review phase.
                 </Typography>
             );
         }

         const currentWordData = reviewList[currentIndex];
         if (!currentWordData) {
              console.warn("Current word data is undefined at index", currentIndex);
              // Maybe end the review phase?
              if (reviewPhase === 'daily') setReviewPhase('finished_daily');
              else if (reviewPhase === 'all') setReviewPhase('finished_all');
              return <Typography>End of list reached unexpectedly.</Typography>;
         }

         return (
             <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between'}}>
                 {/* Use Box for swipe handling */}
                 <Box {...swipeHandlers} sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 /* Add padding for card shadow etc */ }}>
                     <Flashcard
                         wordData={currentWordData}
                         displayMode={reviewDisplayMode}
                         onSwipeLeft={goToNextCard}
                         onSwipeRight={goToPrevCard}
                         onFlip={handleFlipCard}
                         showDetails={showDetails}
                     />
                 </Box>
                 {!showDetails && ( // Only show controls when details are hidden
                     <ReviewControls
                         onCorrect={() => handleReviewAction(true)}
                         onIncorrect={() => handleReviewAction(false)}
                     />
                 )}
             </Box>
         );
     };

    return (
        <Box sx={{ minHeight: '100vh', background: `linear-gradient(160deg, ${colors.backgroundGradientStart}, ${colors.backgroundGradientEnd})`, display: 'flex', flexDirection: 'column', }}>
             <ReviewHeader
                 title={reviewPhase === 'all' ? "Review All" : "Daily Review"}
                 currentCardIndex={currentIndex}
                 totalCards={reviewList.length}
                 onRefresh={() => fetchData(true)} // Pass force=true for manual refresh
                 onSignOut={handleSignOut}
                 isSignedIn={isSignedIn}
                 isLoading={isLoading}
             />
            <Box component="main" sx={{ flexGrow: 1, padding: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
                {renderMainContent()}
            </Box>
        </Box>
    );
};

export default ReviewWordsScreen;