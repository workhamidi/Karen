import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

// Define keys for localStorage consistently
const SPREADSHEET_ID_KEY = 'spreadsheetId';
const CLIENT_ID_KEY = 'googleClientId'; // Use a specific key
const CLIENT_SECRET_KEY = 'googleClientSecret'; // Use a specific key
const GEMINI_API_KEY = 'geminiApiKey'; // If you still use this
const AUTH_TOKEN_KEY = 'googleAuthToken'; // Keep if used elsewhere directly

export const SettingsProvider = ({ children }) => {
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [clientId, setClientId] = useState(''); // State for Client ID
    const [clientSecret, setClientSecret] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [googleAuthToken, setGoogleAuthToken] = useState(null); // If needed
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        console.log('[SettingsProvider] Loading settings from localStorage...');
        try {
            const storedSheetId = localStorage.getItem(SPREADSHEET_ID_KEY) || '';
            const storedClientId = localStorage.getItem(CLIENT_ID_KEY) || '';
            const storedClientSecret = localStorage.getItem(CLIENT_SECRET_KEY) || '';
            const storedGeminiKey = localStorage.getItem(GEMINI_API_KEY) || '';
            const storedAuthToken = localStorage.getItem(AUTH_TOKEN_KEY);

            setSpreadsheetId(storedSheetId);
            setClientId(storedClientId);
            setClientSecret(storedClientSecret);
            setGeminiApiKey(storedGeminiKey);

            if (storedAuthToken) {
                setGoogleAuthToken(storedAuthToken);
            }
             console.log('[SettingsProvider] Settings loaded.');
        } catch (error) {
            console.error("[SettingsProvider] Error loading settings/token from localStorage:", error);
        } finally {
             setIsLoaded(true);
        }
    }, []);

     const updateSpreadsheetId = useCallback((id) => {
         try {
             setSpreadsheetId(id);
             localStorage.setItem(SPREADSHEET_ID_KEY, id);
             console.log('[SettingsProvider] Spreadsheet ID updated.');
         } catch (error) {
              console.error("[SettingsProvider] Error saving spreadsheet ID to localStorage:", error);
         }
     }, []);

     // Add update function for Client ID
      const updateClientId = useCallback((id) => {
         try {
             setClientId(id);
             localStorage.setItem(CLIENT_ID_KEY, id);
              console.log('[SettingsProvider] Client ID updated.');
         } catch (error) {
              console.error("[SettingsProvider] Error saving client ID to localStorage:", error);
         }
     }, []);


     const updateClientSecret = useCallback((secret) => {
        try {
            setClientSecret(secret);
            localStorage.setItem(CLIENT_SECRET_KEY, secret);
             console.log('[SettingsProvider] Client Secret updated.');
        } catch (error) {
             console.error("[SettingsProvider] Error saving client secret to localStorage:", error);
        }
    }, []);

     const updateGeminiApiKey = useCallback((key) => {
         try {
             setGeminiApiKey(key);
             localStorage.setItem(GEMINI_API_KEY, key);
              console.log('[SettingsProvider] Gemini API Key updated.');
         } catch (error) {
              console.error("[SettingsProvider] Error saving Gemini API key to localStorage:", error);
         }
     }, []);

     const updateAuthToken = useCallback((token) => {
         try {
             setGoogleAuthToken(token);
             if (token) {
                 localStorage.setItem(AUTH_TOKEN_KEY, token);
             } else {
                 localStorage.removeItem(AUTH_TOKEN_KEY);
             }
              console.log('[SettingsProvider] Auth Token updated.');
         } catch (error) {
              console.error("[SettingsProvider] Error saving auth token to localStorage:", error);
         }
     }, []);


    const value = {
        spreadsheetId,
        clientId, // Provide Client ID
        clientSecret,
        geminiApiKey,
        googleAuthToken,
        updateSpreadsheetId,
        updateClientId, // Provide update function for Client ID
        updateClientSecret,
        updateGeminiApiKey,
        updateAuthToken,
        isSettingsLoaded: isLoaded,
    };

    return (
        <SettingsContext.Provider value={value}>
            {isLoaded ? children : null }
        </SettingsContext.Provider>
    );
};