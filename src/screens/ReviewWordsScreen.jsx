import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useSwipeable } from 'react-swipeable';
import { useGoogleSheetApi } from '../api/GoogleSheetApi';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { shuffleArray, getTodayDateString, getCurrentTimestampString } from '../utils/helpers';
import ReviewHeader from '../components/ReviewHeader';
import Flashcard from '../components/Flashcard';
import ReviewControls from '../components/ReviewControls';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import theme from '../styles/theme';

const ReviewWordsScreen = () => {
  const navigate = useNavigate();
  const {
    reviewDisplayMode,
    isSettingsLoaded,
    clientId,
    clientSecret,
    spreadsheetId,
    appLanguage,
    selectedTheme
  } = useSettings();
  const { isSignedIn } = useAuth();
  const {
    isApiReady,
    isSignInReady,
    isGapiLoading,
    error: apiError,
    signIn,
    signOut,
    getAllWords,
    updateWord,
    clearError: clearApiError
  } = useGoogleSheetApi({ clientId, spreadsheetId });

  const [allWords, setAllWords] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewPhase, setReviewPhase] = useState('loading');
  const [showDetails, setShowDetails] = useState(false);
  const [settingsChecked, setSettingsChecked] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const todayString = useMemo(() => getTodayDateString(), []);

  useEffect(() => {
    if (!isSettingsLoaded) return;
    if (!settingsChecked) {
      if (!clientId || !clientSecret || !spreadsheetId) {
        setError(appLanguage === 'fa' ? "تنظیمات گوگل API ناقص است. لطفاً تنظیمات را وارد کنید." : "Google API settings are incomplete. Please enter the settings.");
        const timer = setTimeout(() => navigate('/settings', { replace: true }), 1500);
        return () => clearTimeout(timer);
      }
      setSettingsChecked(true);
      setIsLoading(true);
    }
  }, [isSettingsLoaded, settingsChecked, clientId, clientSecret, spreadsheetId, navigate, appLanguage]);

  const clearError = useCallback(() => {
    setError(null);
    clearApiError();
  }, [clearApiError]);

  const prepareReviewLists = useCallback((words) => {
    if (!words) return;
    const dueWords = words.filter(word => 
      !word.is_deleted && 
      word.spaced_repetition_dates?.includes(todayString)
    );
    setAllWords(words);
    setReviewList(shuffleArray([...dueWords]));
    setCurrentIndex(0);
    setReviewPhase(dueWords.length > 0 ? 'daily' : 'finished_daily');
    setIsLoading(false);
  }, [todayString]);

  // Modified effect to avoid the infinite loop, using dataFetched flag instead of allWords.length
  useEffect(() => {
    const fetchData = async () => {
      if (!settingsChecked || !isApiReady || !isSignedIn || dataFetched) return;
      setIsLoading(true);
      setReviewPhase('loading');
      try {
        const fetchedWords = await getAllWords({ forceRefresh: false });        
        prepareReviewLists(fetchedWords || []);
        setDataFetched(true);
      } catch (err) {
        setError(err.message || (appLanguage === 'fa' ? 'خطا در دریافت کلمات.' : 'Error fetching words.'));
        setReviewPhase('error');
        setAllWords([]);
        setReviewList([]);
        setIsLoading(false);
        setDataFetched(true); // Mark as fetched even on error
      }
    };
    fetchData();
  }, [settingsChecked, isApiReady, isSignedIn, dataFetched, getAllWords, prepareReviewLists, appLanguage]);

  // Modified effect to not depend on allWords.length
  useEffect(() => {
    if (!isSettingsLoaded || !settingsChecked) {
      setIsLoading(true);
      setReviewPhase('loading');
      return;
    }
    if (!isApiReady && isGapiLoading) {
      setIsLoading(true);
      setReviewPhase('loading');
    } else if (!isSignedIn && isSignInReady) {
      setIsLoading(false);
      setReviewPhase('prompt_signin');
    } else if (!dataFetched && isSignedIn && isApiReady) {
      setIsLoading(true);
      setReviewPhase('loading');
    } else {
      setIsLoading(false);
    }
  }, [isSettingsLoaded, settingsChecked, isApiReady, isGapiLoading, isSignedIn, isSignInReady, dataFetched]);

  const goToNextCard = useCallback(() => {
    if (currentIndex < reviewList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowDetails(false);
    } else {
      setReviewPhase(reviewPhase === 'daily' ? 'finished_daily' : 'finished_all');
    }
  }, [currentIndex, reviewList.length, reviewPhase]);

  const goToPrevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowDetails(false);
    }
  }, [currentIndex]);

  const handleReviewAction = useCallback(async (isCorrect) => {
    const currentWord = reviewList[currentIndex];
    if (!currentWord) return;

    const updatedDates = currentWord.spaced_repetition_dates.filter(date => date !== todayString);
    const updatedWord = {
      ...currentWord,
      correct_reviews: isCorrect ? currentWord.correct_reviews + 1 : currentWord.correct_reviews,
      wrong_reviews: !isCorrect ? currentWord.wrong_reviews + 1 : currentWord.wrong_reviews,
      last_reviewed: getCurrentTimestampString(),
      memory_strength: Math.min(currentWord.memory_strength + (isCorrect ? 1 : -1), 100),
      spaced_repetition_dates: updatedDates,
      version: (currentWord.version || 0) + 1
    };

    try {
      await updateWord(currentWord.word, updatedWord);
      const updatedList = reviewList.map((word, idx) => (idx === currentIndex ? updatedWord : word));
      setReviewList(updatedList);
      setAllWords(prev => prev.map(word => (word.word === currentWord.word ? updatedWord : word)));
      goToNextCard();
    } catch (err) {
      setError(err.message || (appLanguage === 'fa' ? 'خطا در به‌روزرسانی کلمه.' : 'Error updating word.'));
    }
  }, [reviewList, currentIndex, updateWord, goToNextCard, todayString, appLanguage]);

  const handleStartReviewAll = useCallback(() => {
    const sortedWords = [...allWords].sort((a, b) => {
      const wrongDiff = b.wrong_reviews - a.wrong_reviews;
      if (wrongDiff !== 0) return wrongDiff;
      return a.correct_reviews - b.correct_reviews;
    });
    setReviewList(shuffleArray([...sortedWords]));
    setCurrentIndex(0);
    setReviewPhase('all');
  }, [allWords]);

  const handleFinishReview = useCallback(() => navigate('/'), [navigate]);
  const handleFlipCard = useCallback(() => setShowDetails(prev => !prev), []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNextCard,
    onSwipedRight: goToPrevCard,
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 50,
  });

  const forceRefreshData = useCallback(async () => {
    if (!isApiReady || !isSignedIn) return;
    setIsLoading(true);
    setDataFetched(false); // Reset the dataFetched flag to allow refetching
    try {
      const fetchedWords = await getAllWords({ forceRefresh: true });
      prepareReviewLists(fetchedWords || []);
      setDataFetched(true);
    } catch (err) {
      setError(err.message || (appLanguage === 'fa' ? 'خطا در بارگذاری مجدد کلمات.' : 'Error refreshing words.'));
      setIsLoading(false);
      setDataFetched(true);
    }
  }, [isApiReady, isSignedIn, getAllWords, prepareReviewLists, appLanguage]);

  const renderMainContent = () => {
    const currentWordData = reviewList[currentIndex];

    if (isLoading) {
      let loadingMessage = appLanguage === 'fa' ? "در حال بارگذاری مرور..." : "Loading review...";
      if (!isSettingsLoaded) loadingMessage = appLanguage === 'fa' ? "در حال بارگذاری تنظیمات..." : "Loading settings...";
      else if (!settingsChecked) loadingMessage = appLanguage === 'fa' ? "در حال بررسی تنظیمات..." : "Checking settings...";
      else if (!isApiReady && isGapiLoading) loadingMessage = appLanguage === 'fa' ? "در حال آماده‌سازی API گوگل..." : "Preparing Google API...";
      return <LoadingIndicator message={loadingMessage} sx={{ flexGrow: 1 }} />;
    }

    if (reviewPhase === 'error' || error) {
      return <ErrorMessage error={error || (appLanguage === 'fa' ? 'خطای ناشناخته رخ داد.' : 'An unknown error occurred.')} onClear={clearError} sx={{ m: 2 }} />;
    }

    if (!isSignedIn && isSignInReady) {
      return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={signIn}
            sx={{
              backgroundColor: theme.palette.primary.main(selectedTheme),
              color: theme.palette.text.button(selectedTheme),
              borderRadius: '12px',
              padding: '10px 24px',
              '&:hover': { backgroundColor: theme.palette.primary.main(selectedTheme), opacity: 0.9 },
            }}
          >
            {appLanguage === 'fa' ? 'ورود با گوگل' : 'Sign in with Google'}
          </Button>
        </Box>
      );
    }

    if (reviewPhase === 'finished_daily') {
      return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <Paper sx={{
            p: 3,
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            background: theme.palette.background.card(selectedTheme),
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary(selectedTheme) }}>
              {appLanguage === 'fa' ? 'مرور روزانه شما به پایان رسید!' : 'Your daily review is complete!'}
            </Typography>
            <Button
              variant="contained"
              onClick={handleStartReviewAll}
              sx={{
                mb: 2,
                backgroundColor: theme.palette.primary.main(selectedTheme),
                color: theme.palette.text.button(selectedTheme),
                borderRadius: '12px',
                padding: '10px 24px',
                '&:hover': { backgroundColor: theme.palette.primary.main(selectedTheme), opacity: 0.9 },
              }}
            >
              {appLanguage === 'fa' ? 'مرور همه کلمات' : 'Review All Words'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleFinishReview}
              sx={{
                color: theme.palette.primary.main(selectedTheme),
                borderColor: theme.palette.primary.main(selectedTheme),
                borderRadius: '12px',
                padding: '10px 24px',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main(selectedTheme),
                  color: theme.palette.text.button(selectedTheme),
                  borderColor: theme.palette.primary.main(selectedTheme),
                },
              }}
            >
              {appLanguage === 'fa' ? 'بازگشت به خانه' : 'Back to Home'}
            </Button>
          </Paper>
        </Box>
      );
    }

    if (reviewPhase === 'finished_all') {
      return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <Paper sx={{
            p: 3,
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            background: theme.palette.background.card(selectedTheme),
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary(selectedTheme) }}>
              {appLanguage === 'fa' ? 'شما همه کلمات را مرور کردید!' : 'You reviewed all words!'}
            </Typography>
            <Button
              variant="contained"
              onClick={handleFinishReview}
              sx={{
                backgroundColor: theme.palette.primary.main(selectedTheme),
                color: theme.palette.text.button(selectedTheme),
                borderRadius: '12px',
                padding: '10px 24px',
                '&:hover': { backgroundColor: theme.palette.primary.main(selectedTheme), opacity: 0.9 },
              }}
            >
              {appLanguage === 'fa' ? 'بازگشت به خانه' : 'Back to Home'}
            </Button>
          </Paper>
        </Box>
      );
    }

    if (reviewList.length === 0) {
      return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <Typography sx={{ color: theme.palette.text.primary(selectedTheme) }}>
            {appLanguage === 'fa' ? 'امروز کلمه‌ای برای مرور وجود ندارد.' : 'No words to review today.'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleStartReviewAll}
            sx={{
              mt: 2,
              backgroundColor: theme.palette.primary.main(selectedTheme),
              color: theme.palette.text.button(selectedTheme),
              borderRadius: '12px',
              padding: '10px 24px',
              '&:hover': { backgroundColor: theme.palette.primary.main(selectedTheme), opacity: 0.9 },
            }}
          >
            {appLanguage === 'fa' ? 'مرور همه کلمات' : 'Review All Words'}
          </Button>
        </Box>
      );
    }

    if (!currentWordData) {
      return <LoadingIndicator message={appLanguage === 'fa' ? "در حال بارگذاری کارت..." : "Loading card..."} sx={{ flexGrow: 1 }} />;
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <Box {...swipeHandlers} sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
          <Flashcard
            wordData={currentWordData}
            displayMode={reviewDisplayMode}
            onSwipeLeft={goToNextCard}
            onSwipeRight={goToPrevCard}
            onFlip={handleFlipCard}
            showDetails={showDetails}
          />
        </Box>
        {!showDetails && (
          <ReviewControls
            onCorrect={() => handleReviewAction(true)}
            onIncorrect={() => handleReviewAction(false)}
            selectedTheme={selectedTheme}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${theme.palette.background.gradientStart(selectedTheme)}, ${theme.palette.background.gradientEnd(selectedTheme)})`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <ReviewHeader
        onBack={() => navigate(-1)}
        onGoToSettings={() => navigate('/settings')}
        title={reviewPhase === 'all' ? (appLanguage === 'fa' ? "مرور همه" : "Review All") : (appLanguage === 'fa' ? "مرور روزانه" : "Daily Review")}
        currentCardIndex={currentIndex}
        totalCards={reviewList.length}
        onRefresh={forceRefreshData}
        onSignOut={signOut}
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
