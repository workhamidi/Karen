import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import AppRouter from './AppRouter';

const App = () => {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;