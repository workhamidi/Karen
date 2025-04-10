import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainScreen from './screens/MainScreen';
import ReviewWordsScreen from './screens/ReviewWordsScreen';
import AddWordsScreen from './screens/AddWordsScreen';
import SettingsScreen from './screens/SettingsScreen';
import GoogleAuthCallback from './screens/GoogleAuthCallback';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/review" element={<ReviewWordsScreen />} />
      <Route path="/add" element={<AddWordsScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRouter;