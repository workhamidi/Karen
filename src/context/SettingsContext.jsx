import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

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

  useEffect(() => {
    const loadSettings = () => {
      const savedClientId = localStorage.getItem('clientId') || '';
      const savedClientSecret = localStorage.getItem('clientSecret') || '';
      const savedSpreadsheetId = localStorage.getItem('spreadsheetId') || '';
      const savedReviewDisplayMode = localStorage.getItem('reviewDisplayMode') || 'word';
      const savedDetailLanguage = localStorage.getItem('detailLanguage') || 'fa';
      const savedAppLanguage = localStorage.getItem('appLanguage') || 'fa';
      const savedGeminiApiKey = localStorage.getItem('geminiApiKey') || '';
      const savedTheme = localStorage.getItem('selectedTheme') || 'default';
      const savedGeminiModel = localStorage.getItem('geminiModel') || 'gemini-2.0-flash-thinking-exp-01-21';
      const savedVocabLevel = localStorage.getItem('vocabLevel') || 'B1';

      setClientId(savedClientId);
      setClientSecret(savedClientSecret);
      setSpreadsheetId(savedSpreadsheetId);
      setReviewDisplayMode(savedReviewDisplayMode);
      setDetailLanguage(savedDetailLanguage);
      setAppLanguage(savedAppLanguage);
      setGeminiApiKey(savedGeminiApiKey);
      setSelectedTheme(savedTheme);
      setGeminiModel(savedGeminiModel);
      setVocabLevel(savedVocabLevel);
      setIsSettingsLoaded(true);
    };

    loadSettings();
  }, []);

  const saveSettings = (newSettings) => {
    if (newSettings.clientId !== undefined) {
      setClientId(newSettings.clientId);
      localStorage.setItem('clientId', newSettings.clientId);
    }
    if (newSettings.clientSecret !== undefined) {
      setClientSecret(newSettings.clientSecret);
      localStorage.setItem('clientSecret', newSettings.clientSecret);
    }
    if (newSettings.spreadsheetId !== undefined) {
      setSpreadsheetId(newSettings.spreadsheetId);
      localStorage.setItem('spreadsheetId', newSettings.spreadsheetId);
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
    if (newSettings.geminiApiKey !== undefined) {
      setGeminiApiKey(newSettings.geminiApiKey);
      localStorage.setItem('geminiApiKey', newSettings.geminiApiKey);
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