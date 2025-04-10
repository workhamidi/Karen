import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // Removed serviceAccountKeyJson state - no longer needed for gapi client
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState(''); // Kept if used elsewhere
    const [googleAuthToken, setGoogleAuthToken] = useState(null); // State for OAuth token
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedSheetId = localStorage.getItem('spreadsheetId') || '';
            const storedGeminiKey = localStorage.getItem('geminiApiKey') || '';
            const storedAuthToken = localStorage.getItem('googleAuthToken'); // Or get from auth library state

            setSpreadsheetId(storedSheetId);
            setGeminiApiKey(storedGeminiKey);
            if (storedAuthToken) {
                setGoogleAuthToken(storedAuthToken); // Load token if available
            }
        } catch (error) {
            console.error("Error loading settings/token from localStorage:", error);
        } finally {
             setIsLoaded(true);
        }
    }, []);

    // Service Account Key functions removed

     const updateSpreadsheetId = useCallback((id) => {
         try {
             setSpreadsheetId(id);
             localStorage.setItem('spreadsheetId', id);
         } catch (error) {
              console.error("Error saving spreadsheet ID to localStorage:", error);
         }
     }, []);

     const updateGeminiApiKey = useCallback((key) => {
         try {
             setGeminiApiKey(key);
             localStorage.setItem('geminiApiKey', key);
         } catch (error) {
              console.error("Error saving Gemini API key to localStorage:", error);
         }
     }, []);

     // Function to update Auth Token (called after successful Google Sign-In)
     const updateAuthToken = useCallback((token) => {
         try {
             setGoogleAuthToken(token);
             if (token) {
                 localStorage.setItem('googleAuthToken', token);
             } else {
                 localStorage.removeItem('googleAuthToken');
             }
         } catch (error) {
              console.error("Error saving auth token to localStorage:", error);
         }
     }, []);


    const value = {
        spreadsheetId,
        geminiApiKey, // Keep if needed
        googleAuthToken, // Provide the token
        updateSpreadsheetId,
        updateGeminiApiKey,
        updateAuthToken, // Provide function to set token
        isSettingsLoaded: isLoaded,
    };

    return (
        <SettingsContext.Provider value={value}>
            {isLoaded ? children : null }
        </SettingsContext.Provider>
    );
};