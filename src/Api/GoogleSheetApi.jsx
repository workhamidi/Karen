import { useState, useEffect, useCallback } from 'react';
import { loadGapiInsideDOM } from 'gapi-script';
import { initDB, enqueueOfflineOperation, processOfflineQueue } from './dbUtils';
import { mapRowToWordObject, mapWordObjectToRow, findWordRowIndex } from './sheetUtils';
import { getAllWords, updateWord, deleteWord, addWords } from './apiOperations';
import { useAuth } from '../context/AuthContext';

const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const STORAGE_TOKEN_KEY = 'google_access_token_local';

let gapiInstance = null;
const requestQueue = [];
let isProcessingQueue = false;

const processQueue = async (executeApiCall) => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  while (requestQueue.length > 0) {
    const { apiFunction, callArgs, resolve, reject } = requestQueue.shift();
    try {
      const result = await executeApiCall(apiFunction, callArgs);
      resolve(result);
    } catch (err) {
      reject(err);
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // تأخیر 1 ثانیه بین درخواست‌ها
  }
  isProcessingQueue = false;
};

export const useGoogleSheetApi = ({ clientId, spreadsheetId }) => {
  const { accessToken, setAccessToken } = useAuth();
  const [gapiLoadState, setGapiLoadState] = useState('idle');
  const [gapiClientLoadState, setGapiClientLoadState] = useState('idle');
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isSignedIn = !!accessToken;
  const isApiReady = gapiClientLoadState === 'initialized';
  const isSignInReady = gapiLoadState === 'loaded' && !!clientId;

  const setAndStoreAccessToken = useCallback((token) => {
    setAccessToken(token);
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
  }, [setAccessToken]);

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

  useEffect(() => {
    const loadAndInit = async () => {
      if (gapiLoadState !== 'idle') return;
      setGapiLoadState('loading');
      try {
        await loadGapiInsideDOM();
        if (!window.gapi) throw new Error('GAPI script loaded but window.gapi is undefined');
        await initGapiClient();
        setGapiLoadState('loaded');
      } catch (err) {
        setGapiLoadState('error');
        setError('Failed to load Google API script');
      }
    };
    loadAndInit();
  }, [gapiLoadState, initGapiClient]);

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
    if (!clientId) {
      setError('Client ID not configured.');
      return;
    }
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  }, [clientId]);

  const signOut = useCallback(() => {
    setAndStoreAccessToken(null);
  }, [setAndStoreAccessToken]);

  const ensureGapiToken = useCallback(() => {
    if (!gapiInstance?.client || !accessToken) return false;
    gapiInstance.client.setToken({ access_token: accessToken });
    return true;
  }, [accessToken]);

  const executeApiCall = useCallback(async (apiFunction, callArgs, operationName = 'API Call', retries = 3) => {
    setError(null);
    if (!isSignedIn) throw new Error("Not signed in.");
    if (gapiClientLoadState !== 'initialized') throw new Error("Google API client not ready.");
    if (!spreadsheetId) throw new Error("Spreadsheet ID not configured.");
    if (!ensureGapiToken()) {
      setError("Auth token issue. Sign in again.");
      setAndStoreAccessToken(null);
      throw new Error("Token validation failed.");
    }

    return new Promise((resolve, reject) => {
      requestQueue.push({ apiFunction, callArgs, resolve, reject });
      processQueue(async (func, args) => {
        let attempt = 0;
        while (attempt <= retries) {
          try {
            const response = await func(args);
            return response.result;
          } catch (err) {
            attempt++;
            const status = err.status || err.result?.error?.status;
            const message = err.result?.error?.message || err.message || 'Unknown API error';
            if (attempt > retries) {
              let specificError = `API Error: ${message}`;
              if (message.toLowerCase().includes('unable to parse range')) specificError = `Error parsing range "${args.range}". Check sheet name/range.`;
              else if (status === 401) {
                specificError = "Auth failed/expired. Sign in again.";
                setAndStoreAccessToken(null);
              } else if (status === 403) specificError = `Permission Denied: ${message}`;
              else if (status === 404) specificError = `Not Found: ${message}`;
              else if (status === 429) specificError = "Too many requests. Please try again later.";
              setError(specificError);
              throw new Error(specificError);
            }
            const delay = status === 429 ? 5000 * Math.pow(2, attempt) : 1000 * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      });
    });
  }, [isSignedIn, gapiClientLoadState, spreadsheetId, ensureGapiToken, setAndStoreAccessToken]);

  const syncCacheWithSheet = useCallback(async () => {
    if (!isOnline || !isSignedIn || !isApiReady) {
      setError('Cannot sync: offline or not signed in.');
      return false;
    }
    const db = await initDB();
    const sheetWords = await getAllWords({ spreadsheetId, executeApiCall, isOnline }, { forceRefresh: true });
    const tx = db.transaction('words', 'readwrite');
    const store = tx.objectStore('words');
    await store.clear();
    for (const word of sheetWords) {
      await store.put(word);
    }
    await tx.done;
    return true;
  }, [isOnline, isSignedIn, isApiReady, executeApiCall, spreadsheetId]);

  const clearCache = useCallback(async () => {
    const db = await initDB();
    await db.clear('words');
    await db.clear('offlineQueue');
  }, []);

  const clearAllData = useCallback(async () => {
    const db = await initDB();
    await db.clear('words');
    await db.clear('offlineQueue');
    if (isOnline && isSignedIn && isApiReady) {
      await executeApiCall(
        gapiInstance.client.sheets.spreadsheets.values.clear,
        { spreadsheetId, range: 'Sheet1!A2:AF' },
        'clearAllData'
      );
    }
  }, [isOnline, isSignedIn, isApiReady, executeApiCall, spreadsheetId]);

  useEffect(() => {
    if (isOnline) {
      processOfflineQueue(isOnline,
        (words) => addWords({ spreadsheetId, executeApiCall, findWordRowIndex, isOnline }, words),
        (word, data) => updateWord({ spreadsheetId, executeApiCall, findWordRowIndex, isOnline }, word, data),
        (word) => deleteWord({ spreadsheetId, executeApiCall, findWordRowIndex, updateWord, isOnline }, word)
      );
    }
  }, [isOnline, spreadsheetId, executeApiCall]);

  return {
    isApiReady,
    isSignInReady,
    isGapiLoading: gapiLoadState === 'loading',
    isSignedIn,
    error,
    signIn,
    signOut,
    getAllWords: (params) => getAllWords({ spreadsheetId, executeApiCall, isOnline }, params),
    updateWord: (word, data) => updateWord({ spreadsheetId, executeApiCall, findWordRowIndex, isOnline }, word, data),
    deleteWord: (word) => deleteWord({ spreadsheetId, executeApiCall, findWordRowIndex, updateWord, isOnline }, word),
    addWords: (words) => addWords({ spreadsheetId, executeApiCall, findWordRowIndex, isOnline }, words),
    syncCacheWithSheet,
    clearCache,
    clearAllData,
    setAndStoreAccessToken,
    clearError: () => setError(null),
  };
};