import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Divider from '@mui/material/Divider';
import { useSwipeable } from 'react-swipeable';
import WordDetails from './WordDetails'; // Import detail component
import { colors } from '../styles/colors'; // Adjust path

const Flashcard = ({
    wordData,
    displayMode = 'word', // 'word' or 'meaning'
    onSwipeLeft,
    onSwipeRight,
    onFlip, // Function to call when card is flipped (clicked)
    showDetails = false,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Reset flip state when word changes
    // useEffect(() => {
    //    setIsFlipped(false); // Assuming flip is managed outside now via showDetails
    // }, [wordData]);

    const handlePlayAudio = (event) => {
        event.stopPropagation(); // Prevent card flip when clicking icon
        if (!wordData?.example_audio_url || isPlaying) return;

        if (!audioRef.current) {
            audioRef.current = new Audio(wordData.example_audio_url);
            audioRef.current.onplaying = () => setIsPlaying(true);
            audioRef.current.onended = () => {
                setIsPlaying(false);
                audioRef.current = null; // Release audio object
            };
            audioRef.current.onerror = (e) => {
                 console.error("Audio playback error:", e);
                 setIsPlaying(false);
                 alert("Error playing audio.");
                 audioRef.current = null;
            };
        }
        audioRef.current.play().catch(e => { // Catch potential play errors
             console.error("Audio play() failed:", e);
             setIsPlaying(false);
             alert("Could not play audio.");
             audioRef.current = null;
        });
    };

    // Stop audio if component unmounts or word changes
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
    }, [wordData]); // Rerun cleanup when wordData changes

    const handlers = useSwipeable({
        onSwipedLeft: () => onSwipeLeft(),
        onSwipedRight: () => onSwipeRight(),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    const frontContent = displayMode === 'word' ? wordData?.word : wordData?.meaning;
    const phonetic = displayMode === 'word' ? wordData?.phonetic_farsi : null; // Only show phonetic with word

    return (
        <Box {...handlers} sx={{ width: '100%', maxWidth: '450px', margin: 'auto', perspective: '1000px' }}>
            <Card
                onClick={onFlip}
                sx={{
                    position: 'relative',
                    minHeight: '300px',
                    borderRadius: '15px',
                    background: colors.cardBackground || '#ffffff',
                    color: colors.cardText || '#000000',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: showDetails ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Front Side */}
                 <Box sx={{
                     position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                     display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3,
                     transform: 'rotateY(0deg)', // Explicitly set
                 }}>
                     {wordData?.example_audio_url && (
                        <IconButton
                            onClick={handlePlayAudio}
                            disabled={isPlaying}
                            sx={{ position: 'absolute', top: 10, right: 10, color: isPlaying ? colors.primary : colors.icon }}
                            aria-label="play audio"
                        >
                            <VolumeUpIcon />
                        </IconButton>
                    )}
                     <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                         {frontContent || '...'}
                     </Typography>
                     {phonetic && (
                         <Typography sx={{ color: colors.textSecondary, mb: 2 }}>
                             {phonetic}
                         </Typography>
                     )}
                     <Typography sx={{ color: colors.textSecondary, textAlign: 'center', fontSize: '0.9rem' }}>
                         {displayMode === 'word' ? wordData?.meaning : wordData?.word} {/* Show the other side faintly */}
                     </Typography>
                      <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, color: colors.textHint }}>
                         Tap to see details
                     </Typography>
                 </Box>

                 {/* Back Side (Details) */}
                  <Box sx={{
                     position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                     transform: 'rotateY(180deg)', overflowY: 'auto',
                     background: colors.cardDetailBackground || colors.cardBackground || '#ffffff',
                 }}>
                      {showDetails && <WordDetails wordData={wordData} />}
                 </Box>
            </Card>
        </Box>
    );
};

export default Flashcard;