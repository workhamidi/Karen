import { useState, useEffect, useCallback, useRef } from 'react';
import { loadGapiInsideDOM } from 'gapi-script';
import { getStoredSettings } from '../screens/SettingsScreen';

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const SESSION_STORAGE_TOKEN_KEY = 'google_gis_access_token';

let gapiInstance = null;
let gisTokenClient = null;
let gapiClientInitialized = false;
let gisClientInitialized = false;

export const useGoogleSheetApi = () => {
    const [isGapiLoading, setIsGapiLoading] = useState(!gapiInstance);
    const [isGapiClientInitialized, setIsGapiClientInitialized] = useState(gapiClientInitialized);
    const [isGisInitialized, setIsGisInitialized] = useState(gisClientInitialized);
    const [accessToken, setAccessTokenState] = useState(() => sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY));
    const [isSignedIn, setIsSignedIn] = useState(!!accessToken);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(isSignedIn ? { tokenExists: true } : null);

    const settingsRef = useRef(getStoredSettings());

    // Wrap state setter logic in useCallback to ensure stable reference
    const setAndStoreAccessToken = useCallback((token) => {
        if (token) {
            sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, token);
            setAccessTokenState(token);
            setIsSignedIn(true);
            setCurrentUser({ tokenExists: true });
            if (gapiInstance && gapiClientInitialized) {
                gapiInstance.client.setToken({ access_token: token });
                console.log("[useGoogleSheetApi] Access token set for gapi client.");
            }
        } else {
            sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
            setAccessTokenState(null);
            setIsSignedIn(false);
            setCurrentUser(null);
             if (gapiInstance && gapiClientInitialized) {
                gapiInstance.client.setToken(null);
                console.log("[useGoogleSheetApi] Cleared token from gapi client.");
             }
        }
    }, []); // No dependencies needed for setters usually

    const gisTokenCallback = useCallback((tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
            console.log("[useGoogleSheetApi] GIS Token received via callback.");
            setError(null);
            setAndStoreAccessToken(tokenResponse.access_token);
        } else {
            console.error("[useGoogleSheetApi] GIS Token error or empty response in callback:", tokenResponse);
            setError("Failed to get access token from Google.");
            setAndStoreAccessToken(null);
        }
    }, [setAndStoreAccessToken]); // Depends on the stable setter

    const gisErrorCallback = useCallback((gisError) => {
        console.error("[useGoogleSheetApi] GIS Initialization or Token Error Callback:", gisError);
        let specificError = `Google Sign-In Error: ${gisError.type || gisError.message || 'Unknown error'}`;
        if (gisError.type === 'popup_closed') {
            specificError = "Sign-in popup closed by user.";
        } else if (gisError.type === 'token_request_failed' && gisError.message?.includes('Network error')) {
             specificError = "Network error during token request. Please check connection.";
        } else if (gisError.type === 'immediate_failed') {
            specificError = "Automatic sign-in failed. User interaction required.";
             console.log("[useGoogleSheetApi] Automatic sign-in check (prompt: 'none') failed.");
             // setError(specificError); // Maybe don't show error for failed silent sign-in
             return;
        } else if (gisError.type === 'user_cancel') {
            specificError = "Sign-in cancelled.";
        }

        setError(specificError);
        if (gisError.type !== 'immediate_failed') {
             setAndStoreAccessToken(null);
        }
    }, [setAndStoreAccessToken]); // Depends on the stable setter

    const initializeGis = useCallback(() => {
        if (gisClientInitialized) return;
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
            console.error("[useGoogleSheetApi] GIS library not loaded yet.");
            setError("Google Sign-In library failed to load.");
            return;
        }
        const clientId = settingsRef.current.clientId;
        if (!clientId) {
            setError("Google Client ID not found in settings for GIS initialization.");
            return;
        }
        console.log("[useGoogleSheetApi] Initializing GIS...");
        try {
            gisTokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPES,
                callback: gisTokenCallback,
                error_callback: gisErrorCallback,
            });
            gisClientInitialized = true;
            setIsGisInitialized(true);
            console.log("[useGoogleSheetApi] GIS Token Client initialized.");
            if (!sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY)) {
                 console.log("[useGoogleSheetApi] Attempting silent sign-in...");
                 gisTokenClient.requestAccessToken({ prompt: 'none' });
             }
        } catch (err) {
             console.error("[useGoogleSheetApi] Error initializing GIS:", err);
             setError("Failed to initialize Google Sign-In.");
             gisClientInitialized = false;
             setIsGisInitialized(false);
        }
    }, [gisTokenCallback, gisErrorCallback]); // Depends on stable callbacks

    const initializeGapiClient = useCallback(async () => {
         if (gapiClientInitialized) return;
         if (!gapiInstance) {
              setError("GAPI script failed to load.");
              return;
         }
         console.log("[useGoogleSheetApi] Initializing GAPI client...");
         try {
             await gapiInstance.client.init({ discoveryDocs: DISCOVERY_DOCS });
             gapiClientInitialized = true;
             setIsGapiClientInitialized(true);
             console.log("[useGoogleSheetApi] GAPI client initialized.");
             const initialToken = sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
             if (initialToken) {
                 console.log("[useGoogleSheetApi] Setting stored token for GAPI client.");
                 gapiInstance.client.setToken({ access_token: initialToken });
             }
         } catch (err) {
             console.error("[useGoogleSheetApi] Error initializing GAPI client:", err);
             setError("Failed to initialize Google Sheets API client.");
             gapiClientInitialized = false;
             setIsGapiClientInitialized(false);
         }
    }, []); // No dependencies needed here

    useEffect(() => {
        let isMounted = true;
        settingsRef.current = getStoredSettings();

        const loadApis = async () => {
            if (!gapiInstance) {
                setIsGapiLoading(true);
                setError(null);
                try {
                    console.log("[useGoogleSheetApi] useEffect: Loading GAPI script...");
                    const gapi = await loadGapiInsideDOM();
                    gapiInstance = gapi;
                    console.log("[useGoogleSheetApi] useEffect: GAPI script loaded.");
                    gapi.load('client', async () => {
                        console.log("[useGoogleSheetApi] useEffect: GAPI 'client' loaded.");
                        if (isMounted) {
                            await initializeGapiClient();
                            initializeGis();
                            if (isMounted) setIsGapiLoading(false);
                        }
                    });
                } catch (err) {
                    console.error("[useGoogleSheetApi] useEffect: Error loading GAPI:", err);
                    if (isMounted) { setError("Failed to load Google API script."); setIsGapiLoading(false); }
                }
            } else {
                 console.log("[useGoogleSheetApi] useEffect: GAPI already loaded. Ensuring clients init...");
                 if (isMounted) {
                     if (!gapiClientInitialized) await initializeGapiClient();
                     if (!gisClientInitialized) initializeGis();
                     if (isMounted) setIsGapiLoading(false);
                 }
            }
        };
        loadApis();
        return () => { isMounted = false; };
    }, [initializeGapiClient, initializeGis]); // Depends on stable init functions

    // --- Action Handlers --- Wrap functions returned to components in useCallback ---

    const handleSignIn = useCallback(() => {
        setError(null);
        if (gisTokenClient) {
            console.log("[useGoogleSheetApi] handleSignIn: Requesting Token...");
            gisTokenClient.requestAccessToken({ prompt: '' });
        } else {
            const errMsg = "Google Sign-In client not ready.";
            console.error(errMsg);
            setError(errMsg);
        }
    }, []); // No dependencies as it uses module-level gisTokenClient

    const handleSignOut = useCallback(() => {
        console.log("[useGoogleSheetApi] handleSignOut: Initiated.");
        const currentToken = sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
        if (currentToken && window.google?.accounts?.oauth2) {
            try {
                console.log("[useGoogleSheetApi] handleSignOut: Revoking token...");
                window.google.accounts.oauth2.revoke(currentToken, () => {
                    console.log('[useGoogleSheetApi] handleSignOut: Token revoked.');
                    setAndStoreAccessToken(null);
                    setError(null);
                });
            } catch (e) {
                console.error("[useGoogleSheetApi] handleSignOut: Revoke error:", e);
                setError("Error signing out. Local state cleared.");
                setAndStoreAccessToken(null);
            }
        } else {
            console.log("[useGoogleSheetApi] handleSignOut: No active token / GIS not ready. Clearing local state.");
            setAndStoreAccessToken(null);
            setError(null);
        }
        if (window.google?.accounts?.id) {
           window.google.accounts.id.disableAutoSelect();
        }
    }, [setAndStoreAccessToken]); // Depends on stable setter

    // --- Sheet Interaction Functions --- Wrap these in useCallback too ---

    const getSheetData = useCallback(async (range) => {
        setError(null);
        const currentSettings = getStoredSettings();
        const currentToken = sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
        console.log(`[useGoogleSheetApi] getSheetData: Called. SignedIn=${!!currentToken}, GAPIClientReady=${gapiClientInitialized}`);
        if (!currentToken || !gapiClientInitialized) {
            const errMsg = "Cannot get data: Not signed in or API client not ready.";
            console.error(errMsg); setError(errMsg); throw new Error(errMsg);
        }
        if (!currentSettings.spreadsheetId) {
            const errMsg = "Spreadsheet ID not set.";
            console.error(errMsg); setError(errMsg); throw new Error(errMsg);
        }
        console.log(`[useGoogleSheetApi] getSheetData: Getting ${currentSettings.spreadsheetId} / ${range}`);
        try {
            const response = await gapiInstance.client.sheets.spreadsheets.values.get({
                spreadsheetId: currentSettings.spreadsheetId, range: range,
            });
            console.log("[useGoogleSheetApi] getSheetData: Success.");
            return response.result.values;
        } catch (err) {
             console.error("[useGoogleSheetApi] getSheetData: Error:", err);
             if (err.status === 401 || err.result?.error?.status === 'UNAUTHENTICATED') {
                 setError("Authentication failed. Please sign in again."); handleSignOut();
             } else { setError(`Failed to get sheet data: ${err.result?.error?.message || err.message}`); }
             throw new Error(`Failed to get sheet data: ${err.message || 'API error'}`);
        }
    }, [handleSignOut]); // Depends on stable handleSignOut

    const updateSheetData = useCallback(async (range, values) => {
        setError(null);
        const currentSettings = getStoredSettings();
        const currentToken = sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
        console.log(`[useGoogleSheetApi] updateSheetData: Called. SignedIn=${!!currentToken}, GAPIClientReady=${gapiClientInitialized}`);
        if (!currentToken || !gapiClientInitialized) {
             const errMsg = "Cannot update data: Not signed in or API client not ready.";
             console.error(errMsg); setError(errMsg); throw new Error(errMsg);
         }
        if (!currentSettings.spreadsheetId) {
             const errMsg = "Spreadsheet ID not set.";
             console.error(errMsg); setError(errMsg); throw new Error(errMsg);
         }
        console.log(`[useGoogleSheetApi] updateSheetData: Updating ${currentSettings.spreadsheetId} / ${range}`);
        try {
            const response = await gapiInstance.client.sheets.spreadsheets.values.update({
                spreadsheetId: currentSettings.spreadsheetId, range: range, valueInputOption: 'USER_ENTERED', resource: { values: values },
            });
            console.log("[useGoogleSheetApi] updateSheetData: Success.", response.result);
            return response.result;
        } catch (err) {
             console.error("[useGoogleSheetApi] updateSheetData: Error:", err);
             if (err.status === 401 || err.result?.error?.status === 'UNAUTHENTICATED') {
                  setError("Authentication failed. Please sign in again."); handleSignOut();
             } else { setError(`Failed to update sheet data: ${err.result?.error?.message || err.message}`); }
             throw new Error(`Failed to update sheet data: ${err.message || 'API error'}`);
        }
    }, [handleSignOut]); // Depends on stable handleSignOut

    const appendSheetData = useCallback(async (range, values) => {
        setError(null);
        const currentSettings = getStoredSettings();
        const currentToken = sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
        console.log(`[useGoogleSheetApi] appendSheetData: Called. SignedIn=${!!currentToken}, GAPIClientReady=${gapiClientInitialized}`);
        if (!currentToken || !gapiClientInitialized) {
            const errMsg = "Cannot append data: Not signed in or API client not ready.";
            console.error(errMsg); setError(errMsg); throw new Error(errMsg);
        }
        if (!currentSettings.spreadsheetId) {
            const errMsg = "Spreadsheet ID not set.";
            console.error(errMsg); setError(errMsg); throw new Error(errMsg);
        }
        console.log(`[useGoogleSheetApi] appendSheetData: Appending to ${currentSettings.spreadsheetId} / ${range}`);
        try {
            const response = await gapiInstance.client.sheets.spreadsheets.values.append({
                spreadsheetId: currentSettings.spreadsheetId, range: range, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values: values },
            });
            console.log("[useGoogleSheetApi] appendSheetData: Success.", response.result);
            return response.result;
        } catch (err) {
            console.error("[useGoogleSheetApi] appendSheetData: Error:", err);
            if (err.status === 401 || err.result?.error?.status === 'UNAUTHENTICATED') {
                 setError("Authentication failed. Please sign in again."); handleSignOut();
            } else { setError(`Failed to append sheet data: ${err.result?.error?.message || err.message}`); }
            throw new Error(`Failed to append sheet data: ${err.message || 'API error'}`);
        }
    }, [handleSignOut]); // Depends on stable handleSignOut


    return {
        isGapiLoading,
        isGapiClientInitialized,
        isGisInitialized,
        isSignedIn,
        accessToken,
        error,
        currentUser,
        // These functions now have stable references:
        handleSignIn,
        handleSignOut,
        getSheetData,
        updateSheetData,
        appendSheetData,
    };
};