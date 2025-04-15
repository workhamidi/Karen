import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const STORAGE_TOKEN_KEY = 'google_access_token_local';

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const isSignedIn = !!accessToken;

  const setAccessToken = (token) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, isSignedIn, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};