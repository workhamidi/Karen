import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB } from 'idb';

const SettingsContext = createContext();
const DB_NAME = 'SettingsDB';
const STORE_NAME = 'settings';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const SettingsProvider = ({ children }) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [reviewDisplayMode, setReviewDisplayMode] = useState('word');
  const [detailLanguage, setDetailLanguage] = useState('fa');
  const [appLanguage, setAppLanguage] = useState('fa');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash-thinking-exp-01-21');
  const [vocabLevel, setVocabLevel] = useState('B1');
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const loadSettings = async () => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const savedClientId = (await store.get('clientId')) || localStorage.getItem('clientId') || '';
    const savedClientSecret = (await store.get('clientSecret')) || localStorage.getItem('clientSecret') || '';
    const savedSpreadsheetId = (await store.get('spreadsheetId')) || localStorage.getItem('spreadsheetId') || '';
    const savedGeminiApiKey = (await store.get('geminiApiKey')) || localStorage.getItem('geminiApiKey') || '';
    const savedReviewDisplayMode = localStorage.getItem('reviewDisplayMode') || 'word';
    const savedDetailLanguage = localStorage.getItem('detailLanguage') || 'fa';
    const savedAppLanguage = localStorage.getItem('appLanguage') || 'fa';
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    const savedGeminiModel = localStorage.getItem('geminiModel') || 'gemini-2.0-flash-thinking-exp-01-21';
    const savedVocabLevel = localStorage.getItem('vocabLevel') || 'B1';

    setClientId(savedClientId);
    setClientSecret(savedClientSecret);
    setSpreadsheetId(savedSpreadsheetId);
    setGeminiApiKey(savedGeminiApiKey);
    setReviewDisplayMode(savedReviewDisplayMode);
    setDetailLanguage(savedDetailLanguage);
    setAppLanguage(savedAppLanguage);
    setSelectedTheme(savedTheme);
    setGeminiModel(savedGeminiModel);
    setVocabLevel(savedVocabLevel);
    setIsSettingsLoaded(true);

    if (!savedClientId || !savedClientSecret || !savedSpreadsheetId) {
      console.warn('Google API settings incomplete');
    }
    
    localStorage.setItem('clientId', savedClientId);
    localStorage.setItem('clientSecret', savedClientSecret);
    localStorage.setItem('spreadsheetId', savedSpreadsheetId);
    localStorage.setItem('geminiApiKey', savedGeminiApiKey);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async (newSettings) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    if (newSettings.clientId !== undefined) {
      setClientId(newSettings.clientId);
      localStorage.setItem('clientId', newSettings.clientId);
      await store.put(newSettings.clientId, 'clientId');
    }
    if (newSettings.clientSecret !== undefined) {
      setClientSecret(newSettings.clientSecret);
      localStorage.setItem('clientSecret', newSettings.clientSecret);
      await store.put(newSettings.clientSecret, 'clientSecret');
    }
    if (newSettings.spreadsheetId !== undefined) {
      setSpreadsheetId(newSettings.spreadsheetId);
      localStorage.setItem('spreadsheetId', newSettings.spreadsheetId);
      await store.put(newSettings.spreadsheetId, 'spreadsheetId');
    }
    if (newSettings.geminiApiKey !== undefined) {
      setGeminiApiKey(newSettings.geminiApiKey);
      localStorage.setItem('geminiApiKey', newSettings.geminiApiKey);
      await store.put(newSettings.geminiApiKey, 'geminiApiKey');
    }
    if (newSettings.reviewDisplayMode !== undefined) {
      setReviewDisplayMode(newSettings.reviewDisplayMode);
      localStorage.setItem('reviewDisplayMode', newSettings.reviewDisplayMode);
    }
    if (newSettings.detailLanguage !== undefined) {
      setDetailLanguage(newSettings.detailLanguage);
      localStorage.setItem('detailLanguage', newSettings.detailLanguage);
    }
    if (newSettings.appLanguage !== undefined) {
      setAppLanguage(newSettings.appLanguage);
      localStorage.setItem('appLanguage', newSettings.appLanguage);
    }
    if (newSettings.selectedTheme !== undefined) {
      setSelectedTheme(newSettings.selectedTheme);
      localStorage.setItem('selectedTheme', newSettings.selectedTheme);
    }
    if (newSettings.geminiModel !== undefined) {
      setGeminiModel(newSettings.geminiModel);
      localStorage.setItem('geminiModel', newSettings.geminiModel);
    }
    if (newSettings.vocabLevel !== undefined) {
      setVocabLevel(newSettings.vocabLevel);
      localStorage.setItem('vocabLevel', newSettings.vocabLevel);
    }
    await tx.done;
  };

  return (
    <SettingsContext.Provider
      value={{
        clientId,
        clientSecret,
        spreadsheetId,
        reviewDisplayMode,
        detailLanguage,
        appLanguage,
        geminiApiKey,
        selectedTheme,
        geminiModel,
        vocabLevel,
        isSettingsLoaded,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};