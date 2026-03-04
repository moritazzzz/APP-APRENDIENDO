
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChildPlay from './pages/ChildPlay';
import ChildCollection from './pages/ChildCollection';
import AIGenerator from './pages/AIGenerator';
import ExerciseList from './pages/ExerciseList';
import ChildProgress from './pages/ChildProgress';
import AvatarSetup from './pages/AvatarSetup';
import { AvatarProvider } from './context/AvatarContext';

const App: React.FC = () => {
  return (
    <AvatarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<ExerciseList />} />
          <Route path="/ai-generator" element={<AIGenerator />} />
          <Route path="/progress/:id" element={<ChildProgress />} />
          <Route path="/child/:id/avatar" element={<AvatarSetup />} />
          <Route path="/child/:id/play" element={<ChildPlay />} />
          <Route path="/child/:id/collection" element={<ChildCollection />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AvatarProvider>
  );
};

export default App;
