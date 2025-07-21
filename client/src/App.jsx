import React from 'react';
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import SharedFilePreview from './components/SharedFilePreview';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/shared/:fileId" element={<SharedFilePreview />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;