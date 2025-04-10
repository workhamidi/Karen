// // src/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainScreen from './screens/MainScreen';
import ReviewWordsScreen from './screens/ReviewWordsScreen';
import AddWordsScreen from './screens/AddWordsScreen';
import SettingsScreen from './screens/SettingsScreen';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/review" element={<ReviewWordsScreen />} />
      <Route path="/add" element={<AddWordsScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;