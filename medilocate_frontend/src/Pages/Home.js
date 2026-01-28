// import React from 'react';
// import { Link } from 'react-router-dom';
// import './Home.css';

// const Home = ({ onNavigateToLogin, onNavigateToSignup }) => {
//   return (
//     <div className="home">
//       <div className="hero-section">
//         <div className="hero-content">
//           <h1>Welcome to MediLocate</h1>
//           <p>Find medicines at nearby pharmacies quickly and easily</p>
          
//           <div className="hero-buttons">
//             <Link to="/login" className="btn btn-primary" onClick={onNavigateToLogin}>Login</Link>
//             <Link to="/signup" className="btn btn-secondary" onClick={onNavigateToSignup}>Sign Up</Link>
//           </div>
//         </div>
//       </div>

//       <div className="features-section">
//         <h2>How It Works</h2>
//         <div className="features-grid">
//           <div className="feature">
//             <h3>Search Medicines</h3>
//             <p>Find pharmacies that have your required medicines in stock</p>
//           </div>
//           <div className="feature">
//             <h3>Locate Pharmacies</h3>
//             <p>Discover nearby pharmacies with contact information</p>
//           </div>
//           <div className="feature">
//             <h3>Save Time</h3>
//             <p>Quickly find what you need without visiting multiple pharmacies</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;


// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import './Home.css';

// const Home = ({ onNavigateToLogin, onNavigateToSignup }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchTerm.trim()) return;

//     setIsSearching(true);
//     try {
//       const response = await axios.get(`http://localhost:5000/api/pharmacies/search/medicines?name=${searchTerm}`);
//       setSearchResults(response.data);
//     } catch (error) {
//       console.error('Search failed:', error);
//       setSearchResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   return (
//     <div className="home">
//       <div className="hero-section">
//         <div className="hero-content">
//           <h1>Welcome to MediLocate</h1>
//           <p>Find medicines at nearby pharmacies quickly and easily</p>
          
//           {/* Search Bar */}
//           <div className="search-container">
//             <form onSubmit={handleSearch} className="search-form">
//               <input
//                 type="text"
//                 placeholder="Search for medicines..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="search-input"
//               />
//               <button type="submit" className="search-button" disabled={isSearching}>
//                 {isSearching ? 'Searching...' : 'Search'}
//               </button>
//             </form>
//           </div>

//           <div className="hero-buttons">
//             <Link to="/login" className="btn btn-primary" onClick={onNavigateToLogin}>Login</Link>
//             <Link to="/signup" className="btn btn-secondary" onClick={onNavigateToSignup}>Sign Up</Link>
//           </div>
//         </div>
//       </div>

//       {/* Search Results */}
//       {searchResults.length > 0 && (
//         <div className="search-results">
//           <h2>Search Results</h2>
//           <div className="results-grid">
//             {searchResults.map((result, index) => (
//               <div key={index} className="result-card">
//                 <h3>{result.medicine}</h3>
//                 <p><strong>Pharmacy:</strong> {result.pharmacy.name}</p>
//                 <p><strong>Address:</strong> {result.pharmacy.address}</p>
//                 <p><strong>Stock:</strong> {result.quantity} units</p>
//                 <p><strong>Price:</strong> ${result.price}</p>
//                 <p><strong>Contact:</strong> {result.pharmacy.contact?.phone || 'N/A'}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="features-section">
//         <h2>How It Works</h2>
//         <div className="features-grid">
//           <div className="feature">
//             <h3>Search Medicines</h3>
//             <p>Find pharmacies that have your required medicines in stock</p>
//           </div>
//           <div className="feature">
//             <h3>Locate Pharmacies</h3>
//             <p>Discover nearby pharmacies with contact information</p>
//           </div>
//           <div className="feature">
//             <h3>Save Time</h3>
//             <p>Quickly find what you need without visiting multiple pharmacies</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const isLoggedIn = localStorage.getItem('token');
    
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsSearching(true);
    navigate(`/all-medicines`);
    setTimeout(() => setIsSearching(false), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white py-24 px-4">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Welcome to MediLocate
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-blue-50">
            Find medicines at nearby pharmacies quickly and easily
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 justify-center">
              <input
                type="text"
                placeholder="Search for medicines (e.g., Aspirin, Paracetamol)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg text-lg"
              />
              <button 
                type="submit" 
                disabled={isSearching}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : 'Search Medicines'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Search Medicines</h3>
              <p className="text-gray-600 leading-relaxed">
                Find pharmacies that have your required medicines in stock with real-time availability
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Locate Pharmacies</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover nearby pharmacies with complete contact information and directions
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="text-6xl mb-4">⏱️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Save Time</h3>
              <p className="text-gray-600 leading-relaxed">
                Quickly find what you need without visiting multiple pharmacies physically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in">
            <div className="text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Sign In Required</h2>
              <p className="text-lg text-slate-600 mb-8">
                Please create an account or sign in to search for medicines
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/signup');
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Create Account
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/login');
                }}
                className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all duration-200 text-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full px-6 py-3 text-slate-600 font-semibold hover:text-slate-800 transition-colors text-lg"
              >
                Continue Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;