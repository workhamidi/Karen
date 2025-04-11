import { useState, useEffect, useCallback } from 'react';
import { loadGapiInsideDOM } from 'gapi-script';
import { safeJsonParse } from '../utils/helpers';
import { getCurrentTimestampString } from '../utils/dateUtils';
import { openDB } from 'idb';

const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const STORAGE_TOKEN_KEY = 'google_access_token_local';
const DB_NAME = 'FlashcardDB';
const WORDS_STORE = 'words';
const QUEUE_STORE = 'offlineQueue';

const SHEET_NAME = 'Sheet1';
const SHEET_COLUMN_RANGE = 'A:AF';
const SHEET_START_ROW = 2;
const SHEET_DATA_RANGE = `${SHEET_NAME}!${SHEET_COLUMN_RANGE}${SHEET_START_ROW}`;
const DELETE_COLUMN_LETTER = 'AB';
const WORD_COLUMN_LETTER = 'A';

let gapiInstance = null;
let gisClient = null;

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(WORDS_STORE)) {
        const wordStore = db.createObjectStore(WORDS_STORE, { keyPath: 'word' });
        wordStore.createIndex('category', 'category');
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { autoIncrement: true });
      }
    },
  });
};

const mapRowToWordObject = (row) => {
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

const mapWordObjectToRow = (wordData) => {
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

export const useGoogleSheetApi = ({ clientId, spreadsheetId }) => {
  const [gapiLoadState, setGapiLoadState] = useState('idle');
  const [gapiClientLoadState, setGapiClientLoadState] = useState('idle');
  const [gisClientLoadState, setGisClientLoadState] = useState('idle');
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isSignedIn = !!accessToken;
  const isApiReady = gapiClientLoadState === 'initialized';
  const isSignInReady = gisClientLoadState === 'initialized';

  const setAndStoreAccessToken = useCallback((token) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      if (gapiInstance?.client) {
        gapiInstance.client.setToken({ access_token: token });
      }
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      if (gapiInstance?.client) {
        gapiInstance.client.setToken(null);
      }
    }
  }, []);

  const initGapiClient = useCallback(async () => {
    if (!window.gapi) return;
    setGapiClientLoadState('loading');
    try {
      gapiInstance = window.gapi;
      await new Promise((resolve, reject) => {
        gapiInstance.load('client', {
          callback: resolve,
          onerror: reject,
        });
      });
      await gapiInstance.client.init({
        discoveryDocs: DISCOVERY_DOCS,
      });
      if (accessToken) {
        gapiInstance.client.setToken({ access_token: accessToken });
      }
      setGapiClientLoadState('initialized');
      setError(null);
    } catch (err) {
      setGapiClientLoadState('error');
      setError('Failed to initialize Google API client');
    }
  }, [accessToken]);

  const initGisClient = useCallback(() => {
    if (!clientId || !window.google) return;
    setGisClientLoadState('loading');
    try {
      gisClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            setError(`Sign-in failed: ${response.error_description}`);
            return;
          }
          setAndStoreAccessToken(response.access_token);
        },
      });
      setGisClientLoadState('initialized');
      setError(null);
    } catch (err) {
      setGisClientLoadState('error');
      setError('Failed to initialize Google Sign-In client');
    }
  }, [clientId, setAndStoreAccessToken]);

  useEffect(() => {
    const loadAndInit = async () => {
      if (gapiLoadState !== 'idle') return;
      setGapiLoadState('loading');
      try {
        await loadGapiInsideDOM();
        if (!window.gapi) throw new Error('GAPI script loaded but window.gapi is undefined');
        await initGapiClient();
        initGisClient();
        setGapiLoadState('loaded');
      } catch (err) {
        setGapiLoadState('error');
        setError('Failed to load Google API script');
      }
    };
    loadAndInit();
  }, [gapiLoadState, initGapiClient, initGisClient]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const signIn = useCallback(() => {
    if (gisClientLoadState !== 'initialized' || !gisClient) {
      setError('Sign-in not ready. Please try again.');
      return;
    }
    gisClient.requestAccessToken();
  }, [gisClientLoadState]);

  const signOut = useCallback(() => {
    setAndStoreAccessToken(null);
  }, [setAndStoreAccessToken]);

  const ensureGapiToken = useCallback(() => {
    if (!gapiInstance?.client || !accessToken) return false;
    gapiInstance.client.setToken({ access_token: accessToken });
    return true;
  }, [accessToken]);

  const executeApiCall = useCallback(async (apiFunction, callArgs, operationName = 'API Call', retries = 2) => {
    setError(null);
    if (!isSignedIn) throw new Error("Not signed in.");
    if (gapiClientLoadState !== 'initialized') throw new Error("Google API client not ready.");
    if (!spreadsheetId) throw new Error("Spreadsheet ID not configured.");
    if (!ensureGapiToken()) {
      setError("Auth token issue. Sign in again.");
      setAndStoreAccessToken(null);
      throw new Error("Token validation failed.");
    }
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await apiFunction(callArgs);
        return response.result;
      } catch (err) {
        attempt++;
        const status = err.status || err.result?.error?.status;
        const message = err.result?.error?.message || err.message || 'Unknown API error';
        if (attempt > retries) {
          let specificError = `API Error: ${message}`;
          if (message.toLowerCase().includes('unable to parse range')) specificError = `Error parsing range "${callArgs.range}". Check sheet name/range.`;
          else if (status === 401) {
            specificError = "Auth failed/expired. Sign in again.";
            setAndStoreAccessToken(null);
          } else if (status === 403) specificError = `Permission Denied: ${message}`;
          else if (status === 404) specificError = `Not Found: ${message}`;
          setError(specificError);
          throw new Error(specificError);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }, [isSignedIn, gapiClientLoadState, spreadsheetId, ensureGapiToken, setAndStoreAccessToken]);

  const enqueueOfflineOperation = useCallback(async (operation) => {
    const db = await initDB();
    await db.add(QUEUE_STORE, operation);
  }, []);

  const processOfflineQueue = useCallback(async () => {
    if (!isOnline) return;
    const db = await initDB();
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const operations = await store.getAll();
    for (const op of operations) {
      if (op.type === 'add') {
        await addWords(op.data);
      } else if (op.type === 'update') {
        await updateWord(op.word, op.data);
      } else if (op.type === 'delete') {
        await deleteWord(op.word);
      }
    }
    await store.clear();
    await tx.done;
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      processOfflineQueue();
    }
  }, [isOnline, processOfflineQueue]);

  const getAllWords = useCallback(async ({ forceRefresh = false } = {}) => {
    const db = await initDB();
    if (!forceRefresh) {
      const words = await db.getAll(WORDS_STORE);
      const validWords = words.filter(word => word && !word.is_deleted);
      if (validWords.length > 0) {
        return validWords;
      }
    }
    if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.get) throw new Error("GAPI sheets 'get' unavailable");
    if (!isOnline) {
      const words = await db.getAll(WORDS_STORE);
      return words.filter(word => word && !word.is_deleted);
    }
    const result = await executeApiCall(
      gapiInstance.client.sheets.spreadsheets.values.get,
      { spreadsheetId, range: SHEET_DATA_RANGE },
      'getAllWords'
    );
    const rows = result?.values || [];
    const words = rows.map(mapRowToWordObject).filter(Boolean);
    const tx = db.transaction(WORDS_STORE, 'readwrite');
    const store = tx.objectStore(WORDS_STORE);
    await store.clear();
    for (const word of words) {
      await store.put(word);
    }
    await tx.done;
    return words.filter(word => !word.is_deleted);
  }, [executeApiCall, spreadsheetId, isOnline]);

  const findWordRowIndex = useCallback(async (wordToFind) => {
    if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.get) throw new Error("GAPI sheets 'get' unavailable");
    const rangeForWordColumn = `${SHEET_NAME}!${WORD_COLUMN_LETTER}${SHEET_START_ROW}:${WORD_COLUMN_LETTER}`;
    const result = await executeApiCall(
      gapiInstance.client.sheets.spreadsheets.values.get,
      { spreadsheetId, range: rangeForWordColumn },
      'findWordRowIndex'
    );
    const rows = result?.values || [];
    const index = rows.findIndex(row => row && row[0] && String(row[0]).toLowerCase() === String(wordToFind).toLowerCase());
    return index;
  }, [executeApiCall, spreadsheetId]);

  const updateWord = useCallback(async (wordIdentifier, wordData) => {
    const db = await initDB();
    if (!isOnline) {
      await enqueueOfflineOperation({ type: 'update', word: wordIdentifier, data: wordData });
      await db.put(WORDS_STORE, { ...wordData, word: wordIdentifier });
      return true;
    }
    if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.update) throw new Error("GAPI sheets 'update' unavailable");
    const rowIndex = await findWordRowIndex(wordIdentifier);
    if (rowIndex === -1) throw new Error(`Word "${wordIdentifier}" not found for update.`);
    const sheetRowIndex = rowIndex + SHEET_START_ROW;
    const updateRange = `${SHEET_NAME}!A${sheetRowIndex}:${SHEET_COLUMN_RANGE.split(':')[1]}${sheetRowIndex}`;
    const updatedData = { ...wordData, version: (wordData.version || 0) + 1 };
    const values = [mapWordObjectToRow(updatedData)];
    await executeApiCall(
      gapiInstance.client.sheets.spreadsheets.values.update,
      { spreadsheetId, range: updateRange, valueInputOption: 'USER_ENTERED', resource: { values } },
      'updateWord'
    );
    await db.put(WORDS_STORE, { ...updatedData, word: wordIdentifier });
    return true;
  }, [executeApiCall, spreadsheetId, findWordRowIndex, isOnline]);

  const deleteWord = useCallback(async (word) => {
    const db = await initDB();
    if (!isOnline) {
      await enqueueOfflineOperation({ type: 'delete', word });
      const existingWord = await db.get(WORDS_STORE, word);
      if (existingWord) {
        await db.put(WORDS_STORE, { ...existingWord, is_deleted: true, last_reviewed: getCurrentTimestampString(), version: (existingWord.version || 0) + 1 });
      }
      return true;
    }
    const rowIndex = await findWordRowIndex(word);
    if (rowIndex === -1) throw new Error(`Word "${word}" not found for deletion.`);
    const sheetRowIndex = rowIndex + SHEET_START_ROW;
    const rangeToGet = `${SHEET_NAME}!A${sheetRowIndex}:${SHEET_COLUMN_RANGE.split(':')[1]}${sheetRowIndex}`;
    const result = await executeApiCall(
      gapiInstance.client.sheets.spreadsheets.values.get,
      { spreadsheetId, range: rangeToGet },
      'deleteWord - get existing'
    );
    const rowData = result?.values?.[0];
    if (!rowData) throw new Error(`Could not get data for word "${word}" before deleting.`);
    const wordObject = mapRowToWordObject(rowData);
    wordObject.is_deleted = true;
    wordObject.last_reviewed = getCurrentTimestampString();
    wordObject.version = (wordObject.version || 0) + 1;
    await updateWord(word, wordObject);
    return true;
  }, [executeApiCall, spreadsheetId, findWordRowIndex, updateWord, isOnline]);

  const addWords = useCallback(async (wordsData) => {
    const db = await initDB();
    if (!wordsData || wordsData.length === 0) return null;
    const newWords = [];
    for (const wordData of wordsData) {
      const existingIndex = await findWordRowIndex(wordData.word);
      if (existingIndex === -1) {
        newWords.push(wordData);
      }
    }
    if (newWords.length === 0) return null;
    if (!isOnline) {
      await enqueueOfflineOperation({ type: 'add', data: newWords });
      for (const wordData of newWords) {
        await db.put(WORDS_STORE, { ...wordData, version: 0 });
      }
      return true;
    }
    if (!gapiInstance?.client?.sheets?.spreadsheets?.values?.append) throw new Error("GAPI sheets 'append' unavailable");
    const values = newWords.map(mapWordObjectToRow);
    const appendRange = `${SHEET_NAME}!A${SHEET_START_ROW}`;
    const result = await executeApiCall(
      gapiInstance.client.sheets.spreadsheets.values.append,
      { spreadsheetId, range: appendRange, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values } },
      'addWords'
    );
    for (const wordData of newWords) {
      await db.put(WORDS_STORE, { ...wordData, version: 0 });
    }
    return result;
  }, [executeApiCall, spreadsheetId, findWordRowIndex, isOnline]);

  const syncCacheWithSheet = useCallback(async () => {
    if (!isOnline || !isSignedIn || !isApiReady) {
      setError('Cannot sync: offline or not signed in.');
      return false;
    }
    const db = await initDB();
    const sheetWords = await getAllWords({ forceRefresh: true });
    const tx = db.transaction(WORDS_STORE, 'readwrite');
    const store = tx.objectStore(WORDS_STORE);
    await store.clear();
    for (const word of sheetWords) {
      await store.put(word);
    }
    await tx.done;
    return true;
  }, [isOnline, isSignedIn, isApiReady, getAllWords]);

  const clearCache = useCallback(async () => {
    const db = await initDB();
    const tx = db.transaction([WORDS_STORE, QUEUE_STORE], 'readwrite');
    await tx.objectStore(WORDS_STORE).clear();
    await tx.objectStore(QUEUE_STORE).clear();
    await tx.done;
    localStorage.removeItem('pendingAddWords');
  }, []);

  return {
    isApiReady,
    isSignInReady,
    isGapiLoading: gapiLoadState === 'loading',
    isSignedIn,
    error,
    signIn,
    signOut,
    getAllWords,
    updateWord,
    deleteWord,
    addWords,
    syncCacheWithSheet,
    clearCache,
    setAndStoreAccessToken,
    clearError: () => setError(null),
  };
};