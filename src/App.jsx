import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './AppRouter';

const App = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;