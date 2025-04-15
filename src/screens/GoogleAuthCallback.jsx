import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useGoogleSheetApi } from '../api/GoogleSheetApi';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { clientId, clientSecret } = useSettings();
  const { setAndStoreAccessToken } = useGoogleSheetApi({ clientId });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && clientId && clientSecret) {
      fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
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
      navigate('/review', { state: { error: 'No authorization code or credentials found.' } });
    }
  }, [navigate, setAndStoreAccessToken, clientId, clientSecret]);

  return (
    <div>Loading...</div>
  );
};

export default GoogleAuthCallback;