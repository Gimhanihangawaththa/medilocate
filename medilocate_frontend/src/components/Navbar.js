import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
              MediLocate
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 text-gray-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/all-medicines"
              className="px-4 py-2 text-gray-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium"
            >
              All Medicines
            </Link>
            <Link
              to="/search"
              className="px-4 py-2 text-gray-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium"
            >
              Search
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-gray-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-2 text-gray-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-gray-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="ml-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
