import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import PromptLibrary from './components/PromptLibrary';
import AIHistoryPage from './components/AIHistoryPage';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<PromptLibrary />} />
          <Route path="/AIHistory" element={<AIHistoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App