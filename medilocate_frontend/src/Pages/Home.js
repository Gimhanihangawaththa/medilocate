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
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = ({ onNavigateToLogin, onNavigateToSignup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/pharmacies/search/medicines?name=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to MediLocate</h1>
          <p>Find medicines at nearby pharmacies quickly and easily</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for medicines (e.g., Aspirin, Paracetamol)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button 
                type="submit" 
                className="search-button" 
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search Medicines'}
              </button>
            </form>
          </div>

          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="search-results">
          <div className="container">
            <h2>Search Results</h2>
            <div className="results-grid">
              {searchResults.map((result, index) => (
                <div key={index} className="result-card">
                  <h3>{result.medicine}</h3>
                  <p><strong>Pharmacy:</strong> {result.pharmacy.name}</p>
                  <p><strong>Address:</strong> {result.pharmacy.address}</p>
                  <p><strong>Stock Available:</strong> {result.quantity} units</p>
                  <p><strong>Price:</strong> ${result.price}</p>
                  <p><strong>Contact:</strong> {result.pharmacy.contact?.phone || 'Not provided'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>🔍 Search Medicines</h3>
              <p>Find pharmacies that have your required medicines in stock with real-time availability</p>
            </div>
            <div className="feature">
              <h3>📍 Locate Pharmacies</h3>
              <p>Discover nearby pharmacies with complete contact information and directions</p>
            </div>
            <div className="feature">
              <h3>⏱️ Save Time</h3>
              <p>Quickly find what you need without visiting multiple pharmacies physically</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;