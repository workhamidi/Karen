import { safeJsonParse } from '../utils/helpers';

const SHEET_NAME = 'Sheet1';
const SHEET_COLUMN_RANGE = 'A:AF';
const SHEET_START_ROW = 2;
const SHEET_DATA_RANGE = `${SHEET_NAME}!${SHEET_COLUMN_RANGE}${SHEET_START_ROW}`;
const WORD_COLUMN_LETTER = 'A';

export const mapRowToWordObject = (row) => {
  if (!row || row.length === 0) return null;
  return {
    word: row[0] || '',
    meaning: row[1] || '',
    part_of_speech: row[2] || '',
    phonetic: safeJsonParse(row[3], { short: '', long: '' }),
    etymology: row[4] || '',
    examples: safeJsonParse(row[5], []),
    mnemonics: safeJsonParse(row[6], []),
    collocations: safeJsonParse(row[7], []),
    common_mistakes: safeJsonParse(row[8], []),
    formality_level: row[9] || '',
    cultural_notes: row[10] || '',
    gesture_association: row[11] || '',
    emotional_connotation: row[12] || '',
    grammar_notes: row[13] || '',
    word_family: safeJsonParse(row[14], []),
    variants: safeJsonParse(row[15], []),
    memory_strength: parseInt(row[16], 10) || 0,
    spaced_repetition_dates: safeJsonParse(row[17], []),
    difficulty_level: row[18] || '',
    category: row[19] || '',
    synonyms: safeJsonParse(row[20], []),
    antonyms: safeJsonParse(row[21], []),
    usage_frequency: row[22] || '',
    related_words: safeJsonParse(row[23], []),
    source: row[24] || '',
    notes: row[25] || '',
    example_audio_url: safeJsonParse(row[26], []),
    is_deleted: String(row[27]).toLowerCase() === 'true',
    correct_reviews: parseInt(row[28], 10) || 0,
    wrong_reviews: parseInt(row[29], 10) || 0,
    last_reviewed: row[30] || '',
    version: parseInt(row[31], 10) || 0,
  };
};

export const mapWordObjectToRow = (wordData) => {
  const row = [
    wordData.word || '',
    wordData.meaning || '',
    wordData.part_of_speech || '',
    JSON.stringify(wordData.phonetic || { short: '', long: '' }),
    wordData.etymology || '',
    JSON.stringify(wordData.examples || []),
    JSON.stringify(wordData.mnemonics || []),
    JSON.stringify(wordData.collocations || []),
    JSON.stringify(wordData.common_mistakes || []),
    wordData.formality_level || '',
    wordData.cultural_notes || '',
    wordData.gesture_association || '',
    wordData.emotional_connotation || '',
    wordData.grammar_notes || '',
    JSON.stringify(wordData.word_family || []),
    JSON.stringify(wordData.variants || []),
    String(wordData.memory_strength || 0),
    JSON.stringify(wordData.spaced_repetition_dates || []),
    wordData.difficulty_level || '',
    wordData.category || '',
    JSON.stringify(wordData.synonyms || []),
    JSON.stringify(wordData.antonyms || []),
    wordData.usage_frequency || '',
    JSON.stringify(wordData.related_words || []),
    wordData.source || '',
    wordData.notes || '',
    JSON.stringify(wordData.example_audio_url || []),
    String(wordData.is_deleted || false),
    String(wordData.correct_reviews || 0),
    String(wordData.wrong_reviews || 0),
    wordData.last_reviewed || '',
    String(wordData.version || 0),
  ];
  const getColIndex = (colStr) => {
    let num = 0;
    for (let i = 0; i < colStr.length; i++) {
      num = num * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return num - 1;
  };
  const lastColLetter = SHEET_COLUMN_RANGE.split(':')[1];
  const expectedCols = getColIndex(lastColLetter) + 1;
  while (row.length < expectedCols) row.push('');
  return row.slice(0, expectedCols);
};

export const findWordRowIndex = async ({ spreadsheetId, executeApiCall }, wordToFind) => {
  const rangeForWordColumn = `${SHEET_NAME}!${WORD_COLUMN_LETTER}${SHEET_START_ROW}:${WORD_COLUMN_LETTER}`;
  const result = await executeApiCall(
    window.gapi.client.sheets.spreadsheets.values.get,
    { spreadsheetId, range: rangeForWordColumn },
    'findWordRowIndex'
  );
  const rows = result?.values || [];
  const index = rows.findIndex(row => row && row[0] && String(row[0]).toLowerCase() === String(wordToFind).toLowerCase());
  return index;
};