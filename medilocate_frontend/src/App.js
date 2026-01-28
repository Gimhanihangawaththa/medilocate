import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import SearchResults from './Pages/SearchResults';
import AllMedicine from './Pages/AllMedicine';
import PharmacyDetails from './Pages/PharmacyDetails';
import MedicineDetails from './Pages/MedicineDetails';
import Profile from './Pages/Profile';
import Dashboard from './Pages/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import PharmacySignup from './components/PharmacySignup';
import PharmacyDashboard from './Pages/PharmacyDashboard';
import ErrorPage from './Pages/ErrorPage';
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

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  const switchToLogin = () => {
    // setCurrentView('login');
  };

  const switchToSignup = () => {
    // setCurrentView('signup');
  };

  return (
    <div className="App min-h-screen flex flex-col bg-slate-50">
      <BrowserRouter>
        <Navbar onLogout={handleLogout} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/all-medicines" element={<AllMedicine />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/pharmacy/:id" element={<PharmacyDetails />} />
            <Route path="/medicine/:id" element={<MedicineDetails />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/pharmacy-dashboard" element={<ProtectedRoute><PharmacyDashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />} />
            <Route path="/signup" element={<Signup onSignup={handleLogin} onSwitchToLogin={switchToLogin} />} />
            <Route path="/pharmacy-signup" element={<PharmacySignup onSignup={handleLogin} />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
