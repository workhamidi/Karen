import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box'; // For basic layout
import CircularProgress from '@mui/material/CircularProgress'; // For loading
import Typography from '@mui/material/Typography'; // For messages
import { useGoogleSheetApi } from '../Api/GoogleSheetApi'; // Corrected path
import { useSettings } from '../context/SettingsContext'; // Corrected path
import { colors } from '../styles/colors'; // Assuming colors are defined

const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

function GoogleAuthCallback() {
    const [message, setMessage] = useState('Initializing Google Sign-In callback...');
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    // Get only the necessary function from useGoogleSheetApi
    const { setAndStoreAccessToken } = useGoogleSheetApi();
    // Get settings from context
    const { clientSecret, clientId, isSettingsLoaded } = useSettings();

    console.log('[GoogleAuthCallback] Component mounted.');

    useEffect(() => {
        console.log('[GoogleAuthCallback] useEffect triggered.');

        if (!isSettingsLoaded) {
            console.log('[GoogleAuthCallback] Settings not loaded yet, waiting...');
            setMessage('Loading application settings...');
            return; // Wait for settings to load
        }
        console.log('[GoogleAuthCallback] Settings loaded.');

        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const scope = params.get('scope');
        const errorParam = params.get('error');

        console.log(`[GoogleAuthCallback] URL Params: code=${code ? '***' : null}, scope=${scope}, error=${errorParam}`);

        // --- Error Handling ---
        if (errorParam) {
            const detailedError = `Google Auth Error: ${errorParam}. Description: ${params.get('error_description') || 'No description provided.'}`;
            console.error(`[GoogleAuthCallback] ${detailedError}`);
            setError(detailedError);
            setMessage('');
            return;
        }

        if (!code) {
            const invalidRequestError = 'Invalid callback request: No authorization code found in URL.';
            console.error(`[GoogleAuthCallback] ${invalidRequestError}`);
            setError(invalidRequestError);
            setMessage('');
            return;
        }

        if (!clientId || !clientSecret) {
            const missingSettingsError = 'Configuration Error: Client ID or Client Secret is missing. Please configure them in Settings.';
            console.error(`[GoogleAuthCallback] ${missingSettingsError}`);
            setError(missingSettingsError);
            setMessage('Redirecting to Settings...');
            console.log('[GoogleAuthCallback] Redirecting to settings page (/settings).');
            // Use setTimeout to allow message to be seen briefly before redirect
            setTimeout(() => navigate('/settings', { replace: true }), 2000);
            return;
        }

        // --- Token Exchange ---
        console.log('[GoogleAuthCallback] Authorization code received. Proceeding with token exchange.');
        setMessage('Exchanging authorization code for access token...');

        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const body = new URLSearchParams({
            code: code,
            client_id: clientId,
            client_secret: clientSecret, // Read from context (still insecure on client)
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        console.log('[GoogleAuthCallback] Sending POST request to', tokenUrl);

        let exchanged = false; // Flag to prevent multiple executions if effect runs fast
        if (!exchanged) {
            exchanged = true; // Set flag immediately

             fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
             })
             .then(response => {
                 console.log(`[GoogleAuthCallback] Token exchange response status: ${response.status}`);
                 if (!response.ok) {
                     return response.json().then(errData => {
                         console.error('[GoogleAuthCallback] Token exchange failed with non-OK response:', errData);
                         throw new Error(errData.error_description || errData.error || `HTTP error ${response.status}`);
                     }).catch(parseError => {
                         console.error('[GoogleAuthCallback] Failed to parse error JSON from non-OK response:', parseError);
                         throw new Error(`Token exchange failed with status: ${response.status}`);
                     });
                 }
                 return response.json();
             })
             .then(data => {
                 console.log('[GoogleAuthCallback] Token exchange response data received:', { keys: Object.keys(data) });

                 if (data.error) {
                     const tokenError = `Token Exchange Error: ${data.error}. Description: ${data.error_description || 'No description.'}`;
                     console.error(`[GoogleAuthCallback] ${tokenError}`);
                     setError(tokenError);
                     setMessage('');
                 } else if (data.access_token) {
                     console.log('[GoogleAuthCallback] Access Token received successfully.');
                     // Use the function from the hook to store the token
                     setAndStoreAccessToken(data.access_token);
                     setMessage('Sign-in successful! Redirecting...');
                     console.log('[GoogleAuthCallback] Navigating to home page (/).');
                     // Use replace to remove callback from history
                     navigate('/', { replace: true });
                 } else {
                      const unexpectedResponseError = 'Token Exchange Failed: No access_token or error in the response.';
                      console.error('[GoogleAuthCallback]', unexpectedResponseError, 'Response data:', data);
                      setError(unexpectedResponseError);
                      setMessage('');
                 }
             })
             .catch(fetchError => {
                 const networkError = `Network or unexpected error during token exchange: ${fetchError.message}`;
                 console.error('[GoogleAuthCallback]', networkError, fetchError);
                 setError(networkError);
                 setMessage('');
             });
        } else {
            console.warn("[GoogleAuthCallback] useEffect triggered again before fetch completed? Skipping fetch.");
        }


    }, [location, navigate, setAndStoreAccessToken, clientSecret, clientId, isSettingsLoaded]); // Dependencies are crucial

    // Basic UI for the callback page
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            background: `linear-gradient(160deg, ${colors.backgroundGradientStart || '#2c3e50'}, ${colors.backgroundGradientEnd || '#1a252f'})`, // Fallback colors
            color: colors.text || '#ffffff', // Fallback color
        }}>
            <Typography variant="h5" gutterBottom>
                Google Sign-In
            </Typography>
            {message && !error && <CircularProgress sx={{ color: colors.primary || '#ffffff', my: 2 }} />}
            {message && <Typography sx={{ my: 1 }}>{message}</Typography>}
            {error && (
                <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 0, 0, 0.1)', borderRadius: 1, border: '1px solid rgba(255,0,0,0.3)' }}>
                    <Typography color="error" sx={{ fontWeight: 'bold' }}>
                         Error: {error}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default GoogleAuthCallback;