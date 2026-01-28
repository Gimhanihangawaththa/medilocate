import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AllMedicine = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  // Fetch all pharmacies with their owners and products
  useEffect(() => {
    const fetchPharmaciesWithProducts = async () => {
      setLoading(true);
      try {
        // Fetch all pharmacies
        const pharmaciesResponse = await api.get('/api/pharmacies');
        const allPharmacies = pharmaciesResponse.data.data || [];

        // For each pharmacy, get their inventory
        const pharmaciesWithInventory = await Promise.all(
          allPharmacies.map(async (pharmacy) => {
            try {
              const inventoryResponse = await api.get(
                `/api/inventory/${pharmacy._id}/medicines`
              );
              const inventoryItems = inventoryResponse.data.data || [];

              // Calculate distance from user if location available
              let distance = null;
              if (userLocation && pharmacy.location?.coordinates) {
                const [lng, lat] = pharmacy.location.coordinates;
                distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  lat,
                  lng
                );
              }

              // Build products with medicine details
              const products = inventoryItems.map((item) => ({
                ...item,
                medicineName: item.medicine?.name || 'Unknown',
                medicineGeneric: item.medicine?.genericName,
                medicineCategory: item.medicine?.category,
                medicineUnit: item.medicine?.unit,
              }));

              return {
                ...pharmacy,
                distance,
                products,
                totalProducts: products.length,
                inStockCount: products.filter((p) => p.status === 'in_stock').length,
                lowStockCount: products.filter((p) => p.status === 'low_stock').length,
              };
            } catch (error) {
              console.error(`Error fetching inventory for ${pharmacy.name}:`, error);
              return {
                ...pharmacy,
                products: [],
                totalProducts: 0,
                inStockCount: 0,
                lowStockCount: 0,
              };
            }
          })
        );

        // Filter pharmacies with at least one product
        const pharmaciesWithData = pharmaciesWithInventory.filter(
          (p) => p.totalProducts > 0
        );

        setPharmacies(pharmaciesWithData);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmaciesWithProducts();
  }, [userLocation]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Filter and sort pharmacies
  const filtered = useMemo(() => {
    let result = pharmacies;

    // Filter by search term (pharmacy name or medicine name)
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.products.some(
            (prod) =>
              prod.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              prod.medicineGeneric?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by category (if product-level)
    if (filterCategory !== 'all') {
      result = result.map((p) => ({
        ...p,
        products: p.products.filter((prod) => prod.medicineCategory === filterCategory),
      })).filter((p) => p.products.length > 0);
    }

    // Sort
    if (sortBy === 'distance') {
      result = result.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (sortBy === 'products') {
      result = result.sort((a, b) => b.totalProducts - a.totalProducts);
    } else if (sortBy === 'availability') {
      result = result.sort((a, b) => b.inStockCount - a.inStockCount);
    } else {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [pharmacies, searchTerm, filterCategory, sortBy]);

  const categories = [
    'all',
    'Antibiotic',
    'Painkiller',
    'Vitamin',
    'Supplement',
    'Antacid',
    'Antihistamine',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
            All Pharmacy Owners & Their Products
          </h1>
          <p className="text-lg text-slate-600">
            Explore all pharmacy stores and the medicines they offer
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search pharmacy name or medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
              >
                <option value="name">Pharmacy Name</option>
                <option value="distance">Distance (Nearest)</option>
                <option value="products">Products Count</option>
                <option value="availability">Availability</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-slate-700 font-semibold mb-6">
          {loading ? (
            'Loading pharmacies...'
          ) : filtered.length === 0 ? (
            <span className="text-red-600">No pharmacies found</span>
          ) : (
            <span>
              Found <span className="text-blue-600">{filtered.length}</span> pharmacies
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-300 border-t-blue-600"></div>
          </div>
        )}

        {/* Medicines Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((pharmacy) => (
              <div
                key={pharmacy._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-400"
              >
                {/* Pharmacy Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{pharmacy.name}</h2>
                      <p className="text-blue-100 text-sm">📋 Registration: {pharmacy.registrationNumber}</p>
                    </div>
                    {pharmacy.distance && (
                      <div className="bg-blue-500 px-4 py-2 rounded-full text-center">
                        <p className="text-xs text-blue-100">Distance</p>
                        <p className="text-lg font-bold">{pharmacy.distance} km</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pharmacy Details */}
                <div className="p-6">
                  {/* Owner Contact Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-5 border border-purple-200">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">👤</span> Owner Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">📧 Email:</span>
                        <span className="text-slate-700">{pharmacy.contact?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">📞 Phone:</span>
                        <span className="text-slate-700">{pharmacy.contact?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-2 mt-3">
                        <span className="text-gray-600 font-medium">📍 Address:</span>
                        <span className="text-slate-700">
                          {pharmacy.address?.street}, {pharmacy.address?.city}, {pharmacy.address?.state} {pharmacy.address?.postalCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Products Statistics */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                      <p className="text-2xl font-bold text-blue-600">{pharmacy.totalProducts}</p>
                      <p className="text-xs text-slate-600 font-medium">Total Products</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                      <p className="text-2xl font-bold text-green-600">{pharmacy.inStockCount}</p>
                      <p className="text-xs text-slate-600 font-medium">In Stock</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200">
                      <p className="text-2xl font-bold text-yellow-600">{pharmacy.lowStockCount}</p>
                      <p className="text-xs text-slate-600 font-medium">Low Stock</p>
                    </div>
                  </div>

                  {/* Products List */}
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">💊</span> Products ({pharmacy.products.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pharmacy.products.map((product, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">{product.medicineName}</p>
                              {product.medicineGeneric && (
                                <p className="text-xs text-slate-600">{product.medicineGeneric}</p>
                              )}
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  {product.medicineCategory}
                                </span>
                                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                                  {product.medicineUnit}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded font-semibold ${
                                    product.status === 'in_stock'
                                      ? 'bg-green-100 text-green-700'
                                      : product.status === 'low_stock'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {product.status === 'in_stock'
                                    ? 'In Stock'
                                    : product.status === 'low_stock'
                                    ? 'Low Stock'
                                    : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-3">
                              <p className="font-bold text-blue-600 text-lg">Rs. {product.price}</p>
                              <p className="text-xs text-slate-600">Qty: {product.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link
                    to={`/pharmacy/${pharmacy._id}`}
                    className="w-full block text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 mt-5"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">No Pharmacies Found</h2>
            <p className="text-lg text-slate-600 mb-8">
              {searchTerm
                ? `No pharmacies match "${searchTerm}". Try a different search.`
                : 'No pharmacies available. Please try again later.'}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMedicine;
