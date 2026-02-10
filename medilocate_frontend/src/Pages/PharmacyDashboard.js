import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PharmacyDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(true); // Start with form visible
  const [pharmacyId, setPharmacyId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    medicineName: '',
    quantity: '',
    price: '',
    batchNumber: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchPharmacyInfo();
  }, []);

  const fetchPharmacyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get owner's pharmacy
      const response = await api.get('/api/pharmacies/owner/my-pharmacy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pharmacy = response.data.data;
      if (pharmacy) {
        setPharmacyId(pharmacy._id);
        fetchInventory(pharmacy._id);
      } else {
        console.error('No pharmacy found');
      }
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
    }
  };

  const fetchInventory = async (pharmId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/inventory/${pharmId}/medicines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pharmacyId) {
      alert('No pharmacy found. Please register your pharmacy first.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Add to inventory with medicine name - backend will create medicine if needed
      await api.post(`/api/inventory/${pharmacyId}/medicines`, {
        medicineName: formData.medicineName,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData({
        medicineName: '',
        quantity: '',
        price: '',
        batchNumber: '',
        expiryDate: ''
      });
      // Keep form open - don't hide it
      // setShowAddForm(false);
      fetchInventory(pharmacyId);
      alert('Product added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add inventory');
    }
  };

  const handleDelete = async (inventoryId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/inventory/${pharmacyId}/medicines/${inventoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory(pharmacyId);
      alert('Product deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleUpdate = async (item) => {
    setEditingItem({
      id: item._id,
      quantity: item.quantity,
      price: item.price,
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/inventory/${pharmacyId}/medicines/${editingItem.id}`, {
        quantity: parseInt(editingItem.quantity),
        price: parseFloat(editingItem.price),
        batchNumber: editingItem.batchNumber,
        expiryDate: editingItem.expiryDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory(pharmacyId);
      setShowEditModal(false);
      setEditingItem(null);
      alert('Product updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {JSON.parse(localStorage.getItem('user') || '{}').username}! 👋</h1>
          <p className="text-xl opacity-90">Manage your pharmacy inventory and products</p>
        </div>

        {/* Add Product Form - Always Visible */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product to Inventory</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
                <input
                  type="text"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  required
                  placeholder="Enter medicine name (e.g., Paracetamol)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Add to Inventory
              </button>
            </form>
        </div>

        {/* Current Inventory */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Inventory</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Medicine</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expiry</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.medicine?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Rs. {item.price}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                        item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.batchNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No inventory items yet. Add your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Product</h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                    <input
                      type="text"
                      value={editingItem.batchNumber}
                      onChange={(e) => setEditingItem({...editingItem, batchNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={editingItem.expiryDate}
                      onChange={(e) => setEditingItem({...editingItem, expiryDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                  >
                    Update Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyDashboard;
