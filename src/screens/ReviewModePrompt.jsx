import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { colors } from '../styles/colors';

const ReviewModePrompt = ({ onReviewAll, onFinish }) => {
    return (
        <Paper sx={{ p: 3, mt: 4, textAlign: 'center', background: colors.cardBackground, color: colors.cardText }}>
            <Typography variant="h6" gutterBottom>
                Daily review complete!
            </Typography>
            <Typography sx={{ mb: 3, color: colors.textSecondary }}>
                Would you like to review all your words now?
            </Typography>
            <Box>
                <Button
                    variant="contained"
                    onClick={onReviewAll}
                    sx={{ mr: 2, backgroundColor: colors.primary, '&:hover': { backgroundColor: colors.primaryDark } }}
                >
                    Review All Words
                </Button>
                <Button variant="outlined" onClick={onFinish} sx={{ color: colors.primary, borderColor: colors.primary }}>
                    Finish for Today
                </Button>
            </Box>
        </Paper>
    );
};

export default ReviewModePrompt;