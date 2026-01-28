import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const SearchResults = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get('q') || '';
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    getUserLocation();
  }, [navigate]);

  useEffect(() => {
    if (query) {
      searchMedicines();
    }
  }, [query]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const searchMedicines = async () => {
    setLoading(true);
    try {
      // Search for medicines by name
      const medicineResponse = await api.get(`/api/medicines/search?q=${query}`);
      const medicines = medicineResponse.data.data || [];
      
      if (medicines.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      // For each medicine, find pharmacies that have it in stock
      const pharmacyResults = [];
      
      for (const medicine of medicines) {
        // Search inventory for this medicine
        const inventoryResponse = await api.get(`/api/inventory/search/availability?medicineName=${medicine.name}`);
        const inventoryItems = inventoryResponse.data.data || [];
        
        for (const item of inventoryItems) {
          if (item.pharmacy) {
            pharmacyResults.push({
              id: item.pharmacy._id,
              medicineName: medicine.name,
              medicineId: medicine._id,
              pharmacyName: item.pharmacy.name,
              address: `${item.pharmacy.address.street}, ${item.pharmacy.address.city}`,
              city: item.pharmacy.address.city,
              quantity: item.quantity,
              price: item.price,
              status: item.status,
              inStock: item.status === 'in_stock',
              contact: item.pharmacy.contact,
              location: item.pharmacy.location,
              distance: userLocation ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                item.pharmacy.location.coordinates[1],
                item.pharmacy.location.coordinates[0]
              ) : null
            });
          }
        }
      }
      
      setResults(pharmacyResults);
    } catch (error) {
      console.error('Error searching medicines:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1); // Distance in km
  };

  const filtered = useMemo(() => {
    let filteredResults = results;
    if (onlyInStock) filteredResults = filteredResults.filter((r) => r.inStock);
    if (sortBy === 'distance' && userLocation) {
      filteredResults = [...filteredResults].sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }
    if (sortBy === 'availability') {
      filteredResults = [...filteredResults].sort((a, b) => Number(b.inStock) - Number(a.inStock));
    }
    if (sortBy === 'price') {
      filteredResults = [...filteredResults].sort((a, b) => a.price - b.price);
    }
    return filteredResults;
  }, [results, onlyInStock, sortBy, userLocation]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-lg text-slate-500">Results for</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800">{query || 'All medicines'}</h2>
          <p className="text-slate-600 mt-2">{filtered.length} pharmacies found</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <label className="flex items-center gap-2 text-base text-slate-700">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="accent-blue-600 h-4 w-4"
            />
            In stock only
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="distance">Sort by distance</option>
            <option value="availability">Sort by availability</option>
            <option value="price">Sort by price</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-slate-500">No pharmacies found with "{query}"</p>
          <p className="text-slate-400 mt-2">Try searching for a different medicine</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((result) => (
            <div
              key={`${result.id}-${result.medicineId}`}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-slate-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-slate-800">{result.pharmacyName}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        result.inStock
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'low_stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.status === 'in_stock' ? 'In Stock' : result.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-2">📍 {result.address}</p>
                  <p className="text-slate-600 mb-2">💊 {result.medicineName}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {result.distance && <span>📏 {result.distance} km away</span>}
                    <span>📦 Qty: {result.quantity}</span>
                    <span>💰 Rs. {result.price}</span>
                    {result.contact?.phone && <span>📞 {result.contact.phone}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/pharmacy/${result.id}`}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
