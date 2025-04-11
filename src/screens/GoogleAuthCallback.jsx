import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleSheetApi } from '../Api/GoogleSheetApi';

const GoogleAuthCallback = () => {
    const navigate = useNavigate();
    const { setAndStoreAccessToken } = useGoogleSheetApi();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
                    redirect_uri: `${window.location.origin}/auth/google/callback`,
                    grant_type: 'authorization_code',
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.access_token) {
                        setAndStoreAccessToken(data.access_token);
                        navigate('/review');
                    } else {
                        navigate('/review', { state: { error: 'Failed to authenticate with Google.' } });
                    }
                })
                .catch(() => {
                    navigate('/review', { state: { error: 'Failed to authenticate with Google.' } });
                });
        } else {
            navigate('/review', { state: { error: 'No authorization code found.' } });
        }
    }, [navigate, setAndStoreAccessToken]);

    return (
        <div>Loading...</div>
    );
};

export default GoogleAuthCallback;