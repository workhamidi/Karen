import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { colors } from '../styles/colors'; // Adjust path

const DetailItem = ({ label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    let displayValue = value;
    if (Array.isArray(value)) {
        // Handle array of objects (e.g., examples, mnemonics)
        if (value.length > 0 && typeof value[0] === 'object') {
            displayValue = value.map((item, index) => (
                 <Box key={index} sx={{ mb: 1 }}>
                    {Object.entries(item).map(([key, val]) => (
                         <Typography key={key} variant="caption" display="block"><strong>{key}:</strong> {String(val)}</Typography>
                    ))}
                 </Box>
            ));
        } else {
            // Handle simple array (e.g., synonyms, antonyms)
            displayValue = value.join(', ');
        }
    }

    return (
         <React.Fragment>
             <ListItem sx={{ py: 0.5 }}>
                 <ListItemText
                     primary={label}
                     secondary={displayValue}
                     primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.textSecondary }}
                      secondaryTypographyProps={{ fontSize: '0.85rem', color: colors.cardText, whiteSpace: 'pre-wrap' }}
                 />
             </ListItem>
             <Divider component="li" sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}/>
         </React.Fragment>
    );
};


const WordDetails = ({ wordData }) => {
    if (!wordData) return null;

    // Order of details to display
    const detailOrder = [
        { key: 'meaning', label: 'Meaning' },
        { key: 'part_of_speech', label: 'Part of Speech' },
        { key: 'phonetic_farsi', label: 'Phonetic (Farsi)' },
        { key: 'examples', label: 'Examples' },
        { key: 'mnemonics', label: 'Mnemonics' },
        { key: 'collocations', label: 'Collocations' },
        { key: 'synonyms', label: 'Synonyms' },
        { key: 'antonyms', label: 'Antonyms' },
        { key: 'etymology', label: 'Etymology' },
        { key: 'common_mistakes', label: 'Common Mistakes' },
        { key: 'formality_level', label: 'Formality' },
        { key: 'cultural_notes', label: 'Cultural Notes' },
        { key: 'grammar_notes', label: 'Grammar Notes' },
        { key: 'word_family', label: 'Word Family' },
        { key: 'variants', label: 'Variants' },
        { key: 'difficulty_level', label: 'Difficulty' },
        { key: 'category', label: 'Category' },
        { key: 'usage_frequency', label: 'Usage Frequency' },
        { key: 'related_words', label: 'Related Words' },
        { key: 'source', label: 'Source' },
        { key: 'notes', label: 'Notes' },
        { key: 'memory_strength', label: 'Memory Strength' },
        { key: 'last_reviewed', label: 'Last Reviewed' },
        { key: 'correct_reviews', label: 'Correct Reviews' },
        { key: 'wrong_reviews', label: 'Wrong Reviews' },
        // Add other fields as needed
    ];

    return (
        <Box sx={{ p: 2 }}>
             <Typography variant="h5" sx={{ mb: 1, color: colors.primary, textAlign: 'center' }}>
                 {wordData.word}
             </Typography>
              <Divider sx={{ mb: 1, borderColor: 'rgba(0, 0, 0, 0.1)' }}/>
            <List dense disablePadding>
                {detailOrder.map(item => (
                    <DetailItem key={item.key} label={item.label} value={wordData[item.key]} />
                ))}
            </List>
        </Box>
    );
};

export default WordDetails;