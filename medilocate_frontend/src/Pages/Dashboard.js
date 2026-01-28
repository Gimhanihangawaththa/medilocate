import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PharmacyDashboard from './PharmacyDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Only fetch data for regular users
    if (user.role !== 'pharmacy_admin') {
      getUserLocation();
      loadSearchHistory();
    }
  }, [user.role]);

  // If user is a pharmacy admin, show pharmacy dashboard instead
  if (user.role === 'pharmacy_admin') {
    return <PharmacyDashboard />;
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          fetchNearbyPharmacies(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchNearbyPharmacies = async (lat, lng) => {
    try {
      const response = await api.get(`/api/pharmacies/search?latitude=${lat}&longitude=${lng}&maxDistance=5000`);
      setNearbyPharmacies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history.slice(0, 5)); // Show last 5 searches
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.username}! 👋</h1>
          <p className="text-xl opacity-90">Your health, our priority</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Nearby Pharmacies</p>
                <p className="text-3xl font-bold text-blue-600">{nearbyPharmacies.length}</p>
              </div>
              <div className="text-4xl">🏥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Recent Searches</p>
                <p className="text-3xl font-bold text-purple-600">{searchHistory.length}</p>
              </div>
              <div className="text-4xl">🔍</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Account Status</p>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nearby Pharmacies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nearby Pharmacies</h2>
            {nearbyPharmacies.length > 0 ? (
              <div className="space-y-4">
                {nearbyPharmacies.slice(0, 5).map((pharmacy) => (
                  <div key={pharmacy._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-gray-800">{pharmacy.name}</h3>
                    <p className="text-gray-600 text-sm">{pharmacy.address?.street}, {pharmacy.address?.city}</p>
                    <p className="text-gray-600 text-sm">📞 {pharmacy.contact?.phone}</p>
                    <button
                      onClick={() => navigate(`/pharmacy/${pharmacy._id}`)}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Enable location to see nearby pharmacies</p>
            )}
          </div>

          {/* Recent Searches & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Searches */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Searches</h2>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <span className="text-gray-700">{search}</span>
                      <span className="text-gray-400 text-sm">→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent searches</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  🔍 Search Medicines
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  👤 View Profile
                </button>
                <button
                  onClick={getUserLocation}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  📍 Update Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;