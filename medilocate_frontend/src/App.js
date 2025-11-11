import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './Pages/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  // const [currentView, setCurrentView] = useState('login');

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const switchToLogin = () => {
    // setCurrentView('login');
  };

  const switchToSignup = () => {
    // setCurrentView('signup');
  };

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="App">
        <BrowserRouter>
          <Navbar onLogout={handleLogout} />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }

  // If user is not logged in, show auth pages
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home onNavigateToLogin={switchToLogin} onNavigateToSignup={switchToSignup} />} />
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />} 
          />
          <Route 
            path="/signup" 
            element={<Signup onSignup={handleLogin} onSwitchToLogin={switchToLogin} />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
