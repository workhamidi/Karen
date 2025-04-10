import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence } from 'framer-motion';

import Flashcard from '../components/Flashcard';
import ReviewControls from '../components/ReviewControls';
import { useGoogleSheetApi } from '../Api/GoogleSheetApi';
import { getTodayDateString, shuffleArray } from '../utils/helpers';
import { colors } from '../styles/colors';

const COL_INDEX = { WORD: 0, MEANING: 1, PART_OF_SPEECH: 2, PHONETIC_FARSI: 3, ETYMOLOGY: 4, EXAMPLES_JSON: 5, MNEMONICS_JSON: 6, VISUAL_MNEMONIC: 7, COLLOCATIONS_CSV: 8, COMMON_MISTAKES_CSV: 9, FORMALITY_LEVEL: 10, CULTURAL_NOTES: 11, GESTURE_ASSOCIATION: 12, EMOTIONAL_CONNOTATION: 13, GRAMMAR_NOTES: 14, WORD_FAMILY_CSV: 15, MEMORY_STRENGTH: 16, SPACED_REPETITION_DATES_CSV: 17, DIFFICULTY_LEVEL: 18, CATEGORY: 19, SYNONYMS_CSV: 20, ANTONYMS_CSV: 21, USAGE_FREQUENCY: 22, RELATED_WORDS_CSV: 23, SOURCE: 24, NOTES: 25, EXAMPLE_AUDIO_URL: 26, IS_DELETED: 27, CORRECT_REVIEWS: 28, WRONG_REVIEWS: 29 };
const DATA_RANGE = `Sheet1!A2`;
const parseCsvString = (csvString) => { if (!csvString || typeof csvString !== 'string') return []; return csvString.split(',').map(s => s.trim()).filter(Boolean); };
const parseJsonString = (jsonString, defaultValue = []) => { if (!jsonString || typeof jsonString !== 'string') return defaultValue; try { const parsed = JSON.parse(jsonString); return Array.isArray(parsed) ? parsed : defaultValue; } catch (e) { console.error(`[Transform] Error parsing JSON string: "${jsonString}"`, e); return defaultValue; } };
const transformSheetRowToObject = (rowArray, rowIndex) => { const maxIndex = Math.max(...Object.values(COL_INDEX)); if (!rowArray || rowArray.length <= maxIndex) { console.warn(`[T] Skip row ${rowIndex + 2}: insufficient cols`); return null; } const getVal = (index, defaultValue = '') => String(rowArray[index] || defaultValue); const getNum = (index, defaultValue = 0) => { const val = parseInt(rowArray[index], 10); return Number.isNaN(val) ? defaultValue : val; }; const wordData = { _originalRowIndex: rowIndex + 2, word: getVal(COL_INDEX.WORD), meaning: getVal(COL_INDEX.MEANING), part_of_speech: getVal(COL_INDEX.PART_OF_SPEECH), phonetic_farsi: getVal(COL_INDEX.PHONETIC_FARSI), etymology: getVal(COL_INDEX.ETYMOLOGY), examples: parseJsonString(rowArray[COL_INDEX.EXAMPLES_JSON]), mnemonics: parseJsonString(rowArray[COL_INDEX.MNEMONICS_JSON]), visual_mnemonic: getVal(COL_INDEX.VISUAL_MNEMONIC), collocations: parseCsvString(rowArray[COL_INDEX.COLLOCATIONS_CSV]), common_mistakes: parseCsvString(rowArray[COL_INDEX.COMMON_MISTAKES_CSV]), formality_level: getVal(COL_INDEX.FORMALITY_LEVEL), cultural_notes: getVal(COL_INDEX.CULTURAL_NOTES), gesture_association: getVal(COL_INDEX.GESTURE_ASSOCIATION), emotional_connotation: getVal(COL_INDEX.EMOTIONAL_CONNOTATION), grammar_notes: getVal(COL_INDEX.GRAMMAR_NOTES), word_family: parseCsvString(rowArray[COL_INDEX.WORD_FAMILY_CSV]), variants: [], memory_strength: getNum(COL_INDEX.MEMORY_STRENGTH, 75), spaced_repetition_dates: parseCsvString(rowArray[COL_INDEX.SPACED_REPETITION_DATES_CSV]).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)), difficulty_level: getVal(COL_INDEX.DIFFICULTY_LEVEL), category: getVal(COL_INDEX.CATEGORY), synonyms: parseCsvString(rowArray[COL_INDEX.SYNONYMS_CSV]), antonyms: parseCsvString(rowArray[COL_INDEX.ANTONYMS_CSV]), usage_frequency: getVal(COL_INDEX.USAGE_FREQUENCY), related_words: parseCsvString(rowArray[COL_INDEX.RELATED_WORDS_CSV]), source: getVal(COL_INDEX.SOURCE), notes: getVal(COL_INDEX.NOTES), example_audio_url: getVal(COL_INDEX.EXAMPLE_AUDIO_URL), is_deleted: getVal(COL_INDEX.IS_DELETED).toUpperCase() === 'TRUE', correct_reviews: getNum(COL_INDEX.CORRECT_REVIEWS), wrong_reviews: getNum(COL_INDEX.WRONG_REVIEWS), last_reviewed: getVal(COL_INDEX.LAST_REVIEWED), }; if (!wordData.word) { console.warn(`[T] Skip row ${rowIndex + 2}: empty word`); return null; } return wordData; };


const WordsReviewScreen = ({
    showEnglishFirst = true,
    removeReviewedInstantly = false,
}) => {
    const navigate = useNavigate();
    const {
        isGapiLoading, isGapiClientInitialized, isGisInitialized, isSignedIn,
        error: apiError, handleSignIn, handleSignOut, getSheetData, updateSheetData,
    } = useGoogleSheetApi();

    const [allWords, setAllWords] = useState([]);
    const [reviewWords, setReviewWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [componentError, setComponentError] = useState(null);
    const [reviewPhase, setReviewPhase] = useState('loading');

    const audioRef = useRef(null);
    const isApiFullyReady = !isGapiLoading && isGapiClientInitialized && isGisInitialized;

    useEffect(() => {
        console.log(`[WRS State]: Phase=${reviewPhase}, APIReady=${isApiFullyReady}, SignedIn=${isSignedIn}, LoadingData=${isLoadingData}, review#=${reviewWords.length}, idx=${currentIndex}`);
    }, [reviewPhase, isApiFullyReady, isSignedIn, isLoadingData, reviewWords.length, currentIndex]);


    const prepareReviewLists = useCallback((words) => {
        console.log("[WRS Prep]: Starting preparation for 'main' phase...");
        const today = getTodayDateString();
        const nonDeletedWords = words.filter(word => !word.is_deleted);
        console.log(`[WRS Prep]: Found ${nonDeletedWords.length} non-deleted words.`);

        const todaysWords = nonDeletedWords.filter(word => Array.isArray(word.spaced_repetition_dates) && word.spaced_repetition_dates.includes(today));
        const shuffledTodaysWords = shuffleArray(todaysWords);
        console.log(`[WRS Prep]: Group 1 (Today) - ${shuffledTodaysWords.length} words (shuffled).`);

        const todaysWordIds = new Set(shuffledTodaysWords.map(w => w._originalRowIndex));
        const notTodaysWords = nonDeletedWords.filter(word => !todaysWordIds.has(word._originalRowIndex));
        const sortedHardestNotToday = [...notTodaysWords].sort((a, b) => { if (a.wrong_reviews !== b.wrong_reviews) return b.wrong_reviews - a.wrong_reviews; return a.correct_reviews - b.correct_reviews; });
        const shuffledHardestNotTodaysWords = shuffleArray(sortedHardestNotToday);
        console.log(`[WRS Prep]: Group 2 (Hardest Not Today) - ${shuffledHardestNotTodaysWords.length} words (sorted then shuffled).`);

        const initialReviewList = [...shuffledTodaysWords, ...shuffledHardestNotTodaysWords];
        setReviewWords(initialReviewList);
        console.log(`[WRS Prep]: Initial review list created with ${initialReviewList.length} words.`);

        setCurrentIndex(0);
        setIsRevealed(false);
        if (initialReviewList.length > 0) {
            console.log("[WRS Prep]: Setting phase to 'main'.");
            setReviewPhase('main');
        } else {
            console.log("[WRS Prep]: Initial list empty, setting phase to 'finished_all'.");
            setReviewPhase('finished_all');
        }

    }, []);


    useEffect(() => {
        const fetchData = async () => {
            if (isApiFullyReady && isSignedIn && reviewPhase === 'loading' && !isLoadingData) {
                console.log("[WRS Fetch]: Fetching...");
                setIsLoadingData(true); setComponentError(null); setAllWords([]);
                try {
                    const sheetValues = await getSheetData(DATA_RANGE);
                    if (sheetValues?.length > 0) {
                        console.log(`[WRS Fetch]: Fetched ${sheetValues.length} rows. Transforming...`);
                        const transformed = sheetValues.map(transformSheetRowToObject).filter(w => w !== null);
                        console.log(`[WRS Fetch]: Transformed ${transformed.length}. Setting allWords state.`);
                        console.log("[WRS Fetch]: allWords content (first 2):", transformed.slice(0, 2));
                        setAllWords(transformed);
                        prepareReviewLists(transformed);
                    } else {
                        console.log("[WRS Fetch]: No data in sheet.");
                        setAllWords([]); prepareReviewLists([]); setReviewPhase('finished_all');
                    }
                } catch (fetchError) {
                    console.error("[WRS Fetch]: Error:", fetchError);
                    setComponentError(`Load failed: ${fetchError.message}`); setAllWords([]); prepareReviewLists([]); setReviewPhase('error');
                } finally { setIsLoadingData(false); console.log("[WRS Fetch]: Finished."); }
            } else if (!isSignedIn && isApiFullyReady && reviewPhase !== 'loading') {
                 console.log("[WRS Fetch]: Signed out, resetting."); setAllWords([]); setReviewWords([]); setReviewPhase('loading');
            } else if (!isLoadingData && reviewPhase === 'loading' && isApiFullyReady && isSignedIn) {
                 console.log("[WRS Fetch]: API ready and signed in, but phase still loading. Triggering fetch check (should be handled by deps).");
            }
        };
        if (reviewPhase === 'loading') fetchData();
    }, [isApiFullyReady, isSignedIn, getSheetData, prepareReviewLists, reviewPhase, isLoadingData]);


    const currentWordData = useMemo(() => {
        console.log(`[WRS Memo]: Calculating currentWordData. Phase=${reviewPhase}, Idx=${currentIndex}, reviewWords length=${reviewWords.length}`);
        if (reviewPhase === 'prompt_finished_main' || reviewPhase === 'finished_all' || reviewWords.length === 0 || currentIndex >= reviewWords.length) {
             console.log("[WRS Memo]: Returning null."); return null;
        }
        const word = reviewWords[currentIndex];
        console.log("[WRS Memo]: Returning word:", word?.word);
        return word;
    }, [reviewWords, currentIndex, reviewPhase]);


    const handleNavigate = useCallback((direction) => {
        if (reviewWords.length === 0 || reviewPhase === 'prompt_finished_main' || reviewPhase === 'finished_all') return;
        setIsRevealed(false);
        const currentListLength = reviewWords.length; const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < currentListLength) setCurrentIndex(newIndex);
        else if (newIndex >= currentListLength) {
            console.log(`[WRS Nav]: End of '${reviewPhase}'`);
            if (reviewPhase === 'main') setReviewPhase('prompt_finished_main');
            else if (reviewPhase === 'all') setReviewPhase('finished_all');
        } else {
             if (reviewPhase === 'prompt_finished_main') setReviewPhase('main');
             if (reviewPhase === 'finished_all' && allWords.length > 0) setReviewPhase('all');
             setCurrentIndex(currentListLength - 1);
        }
    }, [currentIndex, reviewWords.length, reviewPhase, allWords.length]);

    const handleReviewAction = useCallback(async (isCorrect) => {
        if (!currentWordData) return;
        setComponentError(null);
        const { _originalRowIndex, word: wordId, correct_reviews, wrong_reviews } = currentWordData;
        const currentListLength = reviewWords.length; const currentReviewIndex = currentIndex;
        if (!_originalRowIndex) { setComponentError("Internal error: Missing row index."); return; }

        const newCorrectReviews = correct_reviews + (isCorrect ? 1 : 0);
        const newWrongReviews = wrong_reviews + (isCorrect ? 0 : 1);
        const today = getTodayDateString();

        const updatedRowData = [...Array(Math.max(...Object.values(COL_INDEX)) + 1)];
        Object.keys(COL_INDEX).forEach(key => {
            const index = COL_INDEX[key]; let valueToSet;
            switch(key) {
                case 'CORRECT_REVIEWS': valueToSet = newCorrectReviews; break;
                case 'WRONG_REVIEWS': valueToSet = newWrongReviews; break;
                case 'LAST_REVIEWED': valueToSet = today; break;
                case 'EXAMPLES_JSON': valueToSet = JSON.stringify(currentWordData.examples || []); break;
                case 'MNEMONICS_JSON': valueToSet = JSON.stringify(currentWordData.mnemonics || []); break;
                case 'IS_DELETED': valueToSet = currentWordData.is_deleted ? 'TRUE' : 'FALSE'; break;
                case 'SPACED_REPETITION_DATES_CSV': valueToSet = (currentWordData.spaced_repetition_dates || []).join(','); break;
                default: const dataKey = key.toLowerCase().replace(/_csv$|_json$/, ''); if (currentWordData[dataKey] !== undefined) { if (Array.isArray(currentWordData[dataKey]) && (key.endsWith('_CSV') || key.endsWith('_JSON'))) { valueToSet = currentWordData[dataKey].join(','); } else { valueToSet = currentWordData[dataKey]; } } else { valueToSet = ''; }
            }
            updatedRowData[index] = valueToSet;
        });

        console.log(`[WRS Action]: Updating row ${_originalRowIndex}...`);
        try {
            const rangeToUpdate = `Sheet1!A${_originalRowIndex}:${String.fromCharCode(65 + Math.max(...Object.values(COL_INDEX)))}${_originalRowIndex}`;
            await updateSheetData(rangeToUpdate, [updatedRowData]);
            console.log(`[WRS Action]: Sheet update success.`);

             const updatedWord = { ...currentWordData, correct_reviews: newCorrectReviews, wrong_reviews: newWrongReviews, last_reviewed: today };
             setReviewWords(prev => prev.map((word, index) => index === currentReviewIndex ? updatedWord : word ));

             const isLastCardInCurrentList = currentReviewIndex >= currentListLength - 1;
             if (isLastCardInCurrentList) {
                 if (reviewPhase === 'main') setReviewPhase('prompt_finished_main');
                 else if (reviewPhase === 'all') setReviewPhase('finished_all');
             } else handleNavigate(1);
        } catch (updateError) {
            console.error(`[WRS Action]: Update fail:`, updateError);
            setComponentError(`Save failed: ${updateError.message}`);
        }
    }, [currentWordData, currentIndex, updateSheetData, handleNavigate, removeReviewedInstantly, reviewWords, reviewPhase]);


    const handleCardClick = () => { setIsRevealed(prev => !prev); };
    const handlePlayAudio = useCallback((audioUrl) => { if (audioRef.current) audioRef.current.pause(); audioRef.current = new Audio(audioUrl); audioRef.current.play().catch(e => console.error("Audio error:", e)); }, []);
    const handleEditWord = useCallback((wordToEdit) => { console.log("Edit requested:", wordToEdit); alert(`Editing "${wordToEdit.word}" not implemented.`); }, []);

    const startReviewAll = useCallback(() => {
        console.log("[WRS Action]: Start Review All clicked.");
        console.log("[WRS startReviewAll]: Current allWords count:", allWords.length);
        if (allWords.length === 0) { console.error("[WRS startReviewAll]: 'allWords' state is empty!"); setComponentError("Cannot start 'Review All': word list empty."); setReviewPhase('error'); return; }
        const nonDeleted = allWords.filter(w => !w.is_deleted);
        console.log("[WRS startReviewAll]: Non-deleted count:", nonDeleted.length);
        if (nonDeleted.length > 0) {
            const shuffledList = shuffleArray(nonDeleted);
            console.log("[WRS startReviewAll]: Shuffled list generated (first 2):", shuffledList.slice(0, 2).map(w=>w.word));
            console.log("[WRS startReviewAll]: Setting states for phase='all'.");
            setReviewWords(shuffledList); setCurrentIndex(0); setIsRevealed(false); setReviewPhase('all');
        } else { console.log("[WRS startReviewAll]: No non-deleted words found."); setReviewPhase('finished_all'); }
    }, [allWords]);

    const skipFurtherReview = useCallback(() => { console.log("[WRS Action]: Skip Further Review clicked."); setReviewPhase('finished_all'); }, []);

    const swipeHandlers = useSwipeable({ onSwipedLeft: () => (reviewPhase !== 'prompt_finished_main' && reviewPhase !== 'finished_all') && handleNavigate(1), onSwipedRight: () => (reviewPhase !== 'prompt_finished_main' && reviewPhase !== 'finished_all') && handleNavigate(-1), preventScrollOnSwipe: true, trackMouse: true });
    const screenBackgroundColor = '#5D5FEF';

    const renderContent = () => {
        console.log("[WRS renderContent]: Evaluating UI state...");
        if (reviewPhase === 'loading' || isLoadingData) return <CircularProgress sx={{ color: '#FFFFFF', margin: 'auto' }} />;
        if (apiError) return <Alert severity="error" sx={{ m: 2 }}>API Error: {apiError}</Alert>;
        if (componentError) return <Alert severity="warning" sx={{ m: 2 }}>{componentError}</Alert>;
        if (!isApiFullyReady) return <Typography sx={{ margin: 'auto' }}>Initializing API...</Typography>;

        if (!isSignedIn) return ( <Box sx={{ textAlign: 'center', margin: 'auto' }}> <Typography sx={{ mb: 2 }}>Please sign in.</Typography> <Button variant="contained" onClick={handleSignIn}>Sign In with Google</Button> </Box> );

        if (reviewPhase === 'prompt_finished_main') {
             console.log("[WRS renderContent]: Showing 'prompt_finished_main' UI.");
             return ( <Box sx={{ textAlign: 'center', margin: 'auto', p: 3, borderRadius: 2, background: 'rgba(0,0,0,0.1)' }}> <Typography variant="h5" sx={{ mb: 3 }}>Main review finished!</Typography> <Typography sx={{ mb: 4 }}>What next?</Typography> <Stack direction="column" spacing={2.5} alignItems="center"> <Button variant="contained" color="primary" onClick={startReviewAll} sx={{ width: '100%', maxWidth: '320px', py: 1.5 }}> Review All Words </Button> <Button variant="outlined" color="inherit" onClick={skipFurtherReview} sx={{ width: '100%', maxWidth: '320px', py: 1 }}> Finish Session </Button> </Stack> </Box> );
        }

        if (reviewPhase === 'finished_all') {
             console.log("[WRS renderContent]: Showing 'finished_all' UI.");
             return ( <Box sx={{ textAlign: 'center', margin: 'auto' }}> <Typography variant="h5" sx={{ mb: 3 }}>All words reviewed!</Typography> <Stack direction="row" spacing={2} justifyContent="center"> <Button variant="outlined" color="inherit" onClick={() => prepareReviewLists(allWords)} sx={{mr: 1}}> Restart Main Review </Button> <Button variant="outlined" color="inherit" onClick={startReviewAll}> Review All Words </Button> </Stack> </Box> );
        }

        if (reviewWords.length === 0) {
            console.log(`[WRS renderContent]: Review list empty for phase '${reviewPhase}'.`);
            return <Typography sx={{ margin: 'auto' }}>No words for this phase.</Typography>;
        }

        console.log(`[WRS renderContent]: Phase '${reviewPhase}', index ${currentIndex}. Word: ${currentWordData?.word}`);
        if (!currentWordData) {
             console.error(`[WRS renderContent]: currentWordData is null/undefined. Phase=${reviewPhase}, Idx=${currentIndex}, List Length=${reviewWords.length}`);
             return <Typography sx={{margin: 'auto'}}>Error loading card data...</Typography>;
        }

        return (
            <>
                <AnimatePresence mode="wait">
                    <Box key={`${currentWordData._originalRowIndex}-${currentIndex}`} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Flashcard wordData={currentWordData} isRevealed={isRevealed} showEnglishFirst={showEnglishFirst} onCardClick={handleCardClick} onPlayAudio={handlePlayAudio} onEditClick={handleEditWord} />
                    </Box>
                </AnimatePresence>
                <ReviewControls onCorrect={() => handleReviewAction(true)} onIncorrect={() => handleReviewAction(false)} />
            </>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: screenBackgroundColor, display: 'flex', flexDirection: 'column', color: '#FFFFFF' }} >
            <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none', color: '#FFFFFF' }} >
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate(-1)} > <ArrowBackIcon /> </IconButton>
                    <Typography variant="body1" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}> Words Review {reviewPhase !== 'loading' && reviewPhase !== 'prompt_finished_main' && `(${reviewPhase})`} </Typography>
                    {isSignedIn ? ( <Button color="inherit" size="small" onClick={handleSignOut}> Sign Out </Button> ) : ( <Box sx={{minWidth: 80}} /> )}
                </Toolbar>
                 {(reviewPhase === 'main' || reviewPhase === 'all') && reviewWords.length > 0 && ( <Typography variant="caption" sx={{ textAlign: 'center', pb: 1 }}> {currentIndex + 1} / {reviewWords.length} </Typography> )}
            </AppBar>
            <Box {...swipeHandlers} component="main" sx={{ flexGrow: 1, padding: '10px 20px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} >
                {renderContent()}
            </Box>
        </Box>
    );
};

export default WordsReviewScreen;