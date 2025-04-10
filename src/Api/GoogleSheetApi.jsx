import { useState, useEffect, useCallback, useRef } from 'react';
import { loadGapiInsideDOM } from 'gapi-script';
import { useSettings } from '../context/SettingsContext';
import { format } from 'date-fns'; // Import date-fns

const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const STORAGE_TOKEN_KEY = 'google_access_token_local';

// ----- ***** VERY IMPORTANT: UPDATE THESE VALUES ***** -----
const SHEET_NAME = 'Sheet1'; // <<<--- CHANGE TO YOUR ACTUAL SHEET NAME
const SHEET_COLUMN_RANGE = 'A:AC'; // <<<--- CHANGE TO YOUR ACTUAL COLUMN RANGE (e.g., 'A:AC')
const SHEET_START_ROW = 2;
const SHEET_DATA_RANGE = `${SHEET_NAME}!${SHEET_COLUMN_RANGE}${SHEET_START_ROW}`;
const DELETE_COLUMN_LETTER = 'AC';
const WORD_COLUMN_LETTER = 'A'; // Assuming 'word' is in column A
// ----- *********************************************** -----

let gapiInstance = null;
let gisClient = null;
let gapiClientInitialized = false;
let gisClientInitialized = false;
let gapiScriptLoading = false;

const safeJsonParse = (jsonString, defaultValue = null) => {
    if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') return defaultValue;
    try {
        // Check if it looks like a simple string that shouldn't be parsed (like a date)
        if (!jsonString.startsWith('[') && !jsonString.startsWith('{')) {
            // Handle specific cases if needed, otherwise return default for non-JSON
            // Example: maybe treat a plain date string as a single-element array?
            // if (/^\d{4}-\d{2}-\d{2}$/.test(jsonString)) return [jsonString];
            return defaultValue; // Default for non-array/object strings
        }
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn(`Failed to parse JSON string: "${jsonString}"`, e);
        return defaultValue;
    }
};

const mapRowToWordObject = (row) => {
    if (!row || row.length === 0) return null;
    // Adjust indices based on your SHEET_COLUMN_RANGE
    return {
        word: row[0] || '',
        meaning: row[1] || '',
        part_of_speech: row[2] || '',
        phonetic_farsi: row[3] || '', // Assuming C=2, D=3 etc.
        etymology: row[4] || '',
        examples: safeJsonParse(row[5], []),
        mnemonics: safeJsonParse(row[6], []),
        visual_mnemonic: row[7] || '',
        collocations: safeJsonParse(row[8], []),
        common_mistakes: safeJsonParse(row[9], []),
        formality_level: row[10] || '',
        cultural_notes: row[11] || '',
        gesture_association: row[12] || '',
        emotional_connotation: row[13] || '',
        grammar_notes: row[14] || '',
        word_family: safeJsonParse(row[15], []),
        variants: safeJsonParse(row[16], []),
        memory_strength: parseInt(row[17], 10) || 0,
        // Handle spaced_repetition_dates robustly
        spaced_repetition_dates: safeJsonParse(row[18], []), // Expecting ["date1", "date2"] format in sheet cell
        difficulty_level: row[19] || '',
        category: row[20] || '',
        synonyms: safeJsonParse(row[21], []),
        antonyms: safeJsonParse(row[22], []),
        usage_frequency: row[23] || '',
        related_words: safeJsonParse(row[24], []),
        source: row[25] || '',
        notes: row[26] || '',
        example_audio_url: row[27] || '',
        is_deleted: String(row[28]).toLowerCase() === 'true',
        // Add review counters if they exist in your sheet, otherwise default
        correct_reviews: parseInt(row[29], 10) || 0, // Assuming AD=29
        wrong_reviews: parseInt(row[30], 10) || 0, // Assuming AE=30
        last_reviewed: row[31] || null, // Assuming AF=31
    };
};

// Map object back, ensuring correct string/JSON string format
const mapWordObjectToRow = (wordData) => {
    // Adjust indices/properties based on your structure
    const row = [];
    row[0] = wordData.word || '';
    row[1] = wordData.meaning || '';
    row[2] = wordData.part_of_speech || '';
    row[3] = wordData.phonetic_farsi || '';
    row[4] = wordData.etymology || '';
    row[5] = JSON.stringify(wordData.examples || []);
    row[6] = JSON.stringify(wordData.mnemonics || []);
    row[7] = wordData.visual_mnemonic || '';
    row[8] = JSON.stringify(wordData.collocations || []);
    row[9] = JSON.stringify(wordData.common_mistakes || []);
    row[10] = wordData.formality_level || '';
    row[11] = wordData.cultural_notes || '';
    row[12] = wordData.gesture_association || '';
    row[13] = wordData.emotional_connotation || '';
    row[14] = wordData.grammar_notes || '';
    row[15] = JSON.stringify(wordData.word_family || []);
    row[16] = JSON.stringify(wordData.variants || []);
    row[17] = String(wordData.memory_strength || 0);
    row[18] = JSON.stringify(wordData.spaced_repetition_dates || []); // Store as JSON array string
    row[19] = wordData.difficulty_level || '';
    row[20] = wordData.category || '';
    row[21] = JSON.stringify(wordData.synonyms || []);
    row[22] = JSON.stringify(wordData.antonyms || []);
    row[23] = wordData.usage_frequency || '';
    row[24] = JSON.stringify(wordData.related_words || []);
    row[25] = wordData.source || '';
    row[26] = wordData.notes || '';
    row[27] = wordData.example_audio_url || '';
    row[28] = String(wordData.is_deleted || false); // AC column
    // Add review counters if mapping back
    row[29] = String(wordData.correct_reviews || 0); // AD
    row[30] = String(wordData.wrong_reviews || 0); // AE
    row[31] = wordData.last_reviewed || ''; // AF

    // Ensure the row has the correct number of columns expected by SHEET_COLUMN_RANGE
    const expectedCols = 29; // AC is the 29th letter
    while (row.length < expectedCols) {
        row.push(''); // Pad with empty strings if needed
    }
    return row.slice(0, expectedCols); // Return only the expected number of columns
};

export const useGoogleSheetApi = () => {
    const { clientId, spreadsheetId, isSettingsLoaded } = useSettings();
    const [gapiLoadState, setGapiLoadState] = useState('idle');
    const [gapiClientLoadState, setGapiClientLoadState] = useState(gapiClientInitialized ? 'initialized' : 'idle');
    const [gisClientLoadState, setGisClientLoadState] = useState(gisClientInitialized ? 'initialized' : 'idle');
    const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
    const [error, setError] = useState(null);

    const isSignedIn = !!accessToken;
    const initGapiClientFn = useRef(null);
    const initGisClientFn = useRef(null);

    const setAndStoreAccessToken = useCallback((token) => { /* ... same as before ... */ }, []);
    initGapiClientFn.current = useCallback(async () => { /* ... same as before, including client check ... */ }, [isSettingsLoaded]);
    initGisClientFn.current = useCallback(() => { /* ... same as before ... */ }, [clientId, isSettingsLoaded]);
    useEffect(() => { /* ... same initialization useEffect as before ... */ }, [gapiLoadState, gapiClientLoadState, gisClientLoadState, isSettingsLoaded, accessToken]);
    const handleSignIn = useCallback(() => { /* ... same as before ... */ }, [gisClientLoadState, clientId, isSettingsLoaded]);
    const handleSignOut = useCallback(() => { /* ... same as before ... */ }, [setAndStoreAccessToken]);
    const ensureGapiToken = useCallback(() => { /* ... same as before ... */ }, []);

    const executeApiCall = useCallback(async (apiFunction, callArgs, operationName = 'API Call') => {
        setError(null); // Clear previous specific error
        // ... (rest of checks: isSignedIn, client ready, settings loaded, token validation) ...
        if (!isSignedIn) throw new Error("Not signed in.");
        if (gapiClientLoadState !== 'initialized') throw new Error("Google API client not ready.");
        if (!isSettingsLoaded || !spreadsheetId) throw new Error("Spreadsheet ID not configured.");
        if (!ensureGapiToken()) {
            setError("Auth token issue. Sign in again."); setAndStoreAccessToken(null);
            throw new Error("Token validation failed.");
        }

        try {
            console.log(`[useGSApi] Executing ${operationName} for sheet: ${spreadsheetId}, Args:`, callArgs);
            const response = await apiFunction(callArgs);
            return response.result;
        } catch (err) {
            // ... (Error handling same as before, including range parse check) ...
            console.error(`[useGSApi] ${operationName} error:`, err);
            const status = err.status || err.result?.error?.status;
            const message = err.result?.error?.message || err.message || 'Unknown API error';
            let specificError = `API Error: ${message}`;
            if (message.toLowerCase().includes('unable to parse range')) specificError = `Error parsing range "${callArgs.range}". Check sheet name/range.`;
            else if (status === 401 || String(status).toUpperCase().includes('UNAUTHENTICATED')) { specificError = "Auth failed/expired. Sign in again."; setAndStoreAccessToken(null); }
            else if (status === 403) specificError = `Permission Denied: ${message}`;
            else if (status === 404) specificError = `Not Found (Check ID/Range): ${message}`;
            setError(specificError); // Set the specific error state
            throw new Error(specificError); // Re-throw for component
        }
    }, [isSignedIn, gapiClientLoadState, spreadsheetId, isSettingsLoaded, ensureGapiToken, setAndStoreAccessToken]);

    // --- Business Logic Functions ---

    const getAllWords = useCallback(async () => {
        if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.get) throw new Error("GAPI sheets 'get' unavailable");
        console.log(`[useGSApi] getAllWords fetching range: ${SHEET_DATA_RANGE}`);
        const result = await executeApiCall(
            gapiInstance.client.sheets.spreadsheets.values.get,
            { spreadsheetId, range: SHEET_DATA_RANGE },
            'getAllWords'
        );
        const rows = result?.values || [];
        return rows.map(mapRowToWordObject).filter(word => word && !word.is_deleted);
    }, [executeApiCall, spreadsheetId]);

    const findWordRowIndex = useCallback(async (wordToFind) => {
        if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.get) throw new Error("GAPI sheets 'get' unavailable");
        const rangeForWordColumn = `${SHEET_NAME}!${WORD_COLUMN_LETTER}${SHEET_START_ROW}:${WORD_COLUMN_LETTER}`;
        console.log(`[useGSApi] findWordRowIndex searching range: ${rangeForWordColumn}`);
        const result = await executeApiCall(
            gapiInstance.client.sheets.spreadsheets.values.get,
            { spreadsheetId, range: rangeForWordColumn },
            'findWordRowIndex'
        );
        const rows = result?.values || [];
        return rows.findIndex(row => row && row[0] && String(row[0]).toLowerCase() === String(wordToFind).toLowerCase());
    }, [executeApiCall, spreadsheetId]);

    const updateWord = useCallback(async (wordIdentifier, wordData /* full object */) => {
        if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.update) throw new Error("GAPI sheets 'update' unavailable");
        const rowIndex = await findWordRowIndex(wordIdentifier);
        if (rowIndex === -1) throw new Error(`Word "${wordIdentifier}" not found for update.`);

        const sheetRowIndex = rowIndex + SHEET_START_ROW;
        const updateRange = `${SHEET_NAME}!A${sheetRowIndex}:${DELETE_COLUMN_LETTER}${sheetRowIndex}`;
        const values = [mapWordObjectToRow(wordData)];

        console.log(`[useGSApi] updateWord updating range: ${updateRange}`);
        await executeApiCall(
            gapiInstance.client.sheets.spreadsheets.values.update,
            { spreadsheetId, range: updateRange, valueInputOption: 'USER_ENTERED', resource: { values } }, // USER_ENTERED might parse dates/numbers correctly
            'updateWord'
        );
        return true;
    }, [executeApiCall, spreadsheetId, findWordRowIndex]);

    const deleteWord = useCallback(async (word) => {
        // This now just updates the is_deleted flag using updateWord
        console.log(`[useGSApi] deleteWord called for: ${word}`);
        const rowIndex = await findWordRowIndex(word);
        if (rowIndex === -1) throw new Error(`Word "${word}" not found for deletion.`);

        // Fetch the entire row data first to avoid overwriting other fields
        const rangeToGet = `${SHEET_NAME}!A${rowIndex + SHEET_START_ROW}:${DELETE_COLUMN_LETTER}${rowIndex + SHEET_START_ROW}`;
        const result = await executeApiCall(
            gapiInstance.client.sheets.spreadsheets.values.get,
            { spreadsheetId, range: rangeToGet },
            'deleteWord - get existing'
        );
        const rowData = result?.values?.[0];
        if (!rowData) throw new Error(`Could not retrieve data for word "${word}" before deleting.`);

        const wordObject = mapRowToWordObject(rowData);
        if (!wordObject) throw new Error(`Could not map row data for word "${word}"`);

        wordObject.is_deleted = true; // Mark as deleted

        // Use updateWord to save the change
        await updateWord(word, wordObject);
        return true;

    }, [executeApiCall, spreadsheetId, findWordRowIndex, updateWord]); // Added updateWord dependency

    const addWords = useCallback(async (wordsData) => {
        if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.append) throw new Error("GAPI sheets 'append' unavailable");
        if (!wordsData || wordsData.length === 0) return null;

        const values = wordsData.map(mapWordObjectToRow);
        const appendRange = `${SHEET_NAME}!A${SHEET_START_ROW}`; // Append below header
        console.log(`[useGSApi] addWords appending ${values.length} words.`);
        return await executeApiCall(
            gapiInstance.client.sheets.spreadsheets.values.append,
            { spreadsheetId, range: appendRange, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values } },
            'addWords'
        );
    }, [executeApiCall, spreadsheetId]);

    const isApiReady = gapiClientLoadState === 'initialized';
    const isSignInReady = gisClientLoadState === 'initialized';

    return {
        isApiReady, isSignInReady, isGapiLoading: gapiLoadState === 'loading',
        isSignedIn, error, handleSignIn, handleSignOut,
        getAllWords, updateWord, deleteWord, addWords,
        setAndStoreAccessToken
    };
};