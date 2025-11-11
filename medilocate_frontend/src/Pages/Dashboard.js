// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Dashboard.css';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('user') || '{}');

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <h1>Welcome, {user.username}!</h1>
//         <button onClick={handleLogout} className="logout-btn">Logout</button>
//       </div>

//       <div className="dashboard-content">
//         <div className="dashboard-card">
//           <h2>MediLocate Dashboard</h2>
//           <p>You are successfully logged in to your MediLocate account.</p>
//           <p>From here you can search for medicines, view pharmacy information, and manage your account.</p>
//         </div>

//         <div className="features-grid">
//           <div className="feature-card">
//             <h3>Search Medicines</h3>
//             <p>Find pharmacies that have your required medicines</p>
//           </div>
//           <div className="feature-card">
//             <h3>Pharmacy Locations</h3>
//             <p>Discover nearby pharmacies with contact details</p>
//           </div>
//           <div className="feature-card">
//             <h3>Account Management</h3>
//             <p>Manage your profile and preferences</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [pharmacies, setPharmacies] = useState([]);
  const [showPharmacyForm, setShowPharmacyForm] = useState(false);
  const [newPharmacy, setNewPharmacy] = useState({
    name: '',
    address: '',
    location: { lat: 0, lng: 0 },
    contact: { phone: '', email: '' },
    medicines: [{ name: '', quantity: 0, price: 0 }]
  });

  useEffect(() => {
    fetchUserPharmacies();
  }, []);

  const fetchUserPharmacies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/pharmacies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPharmacies(response.data);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePharmacySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/pharmacies', newPharmacy, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPharmacyForm(false);
      setNewPharmacy({
        name: '',
        address: '',
        location: { lat: 0, lng: 0 },
        contact: { phone: '', email: '' },
        medicines: [{ name: '', quantity: 0, price: 0 }]
      });
      fetchUserPharmacies();
    } catch (error) {
      console.error('Error creating pharmacy:', error);
    }
  };

  const addMedicineField = () => {
    setNewPharmacy({
      ...newPharmacy,
      medicines: [...newPharmacy.medicines, { name: '', quantity: 0, price: 0 }]
    });
  };

  const updateMedicine = (index, field, value) => {
    const updatedMedicines = [...newPharmacy.medicines];
    updatedMedicines[index][field] = value;
    setNewPharmacy({ ...newPharmacy, medicines: updatedMedicines });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.username}!</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>MediLocate Dashboard</h2>
          <p>Manage your pharmacies and medicine inventory.</p>
          
          <button 
            onClick={() => setShowPharmacyForm(!showPharmacyForm)}
            className="btn btn-primary"
          >
            {showPharmacyForm ? 'Cancel' : 'Add New Pharmacy'}
          </button>
        </div>

        {/* Pharmacy Form */}
        {showPharmacyForm && (
          <div className="pharmacy-form">
            <h3>Add New Pharmacy</h3>
            <form onSubmit={handlePharmacySubmit}>
              <div className="form-group">
                <label>Pharmacy Name:</label>
                <input
                  type="text"
                  value={newPharmacy.name}
                  onChange={(e) => setNewPharmacy({...newPharmacy, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  value={newPharmacy.address}
                  onChange={(e) => setNewPharmacy({...newPharmacy, address: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Phone:</label>
                <input
                  type="text"
                  value={newPharmacy.contact.phone}
                  onChange={(e) => setNewPharmacy({
                    ...newPharmacy, 
                    contact: {...newPharmacy.contact, phone: e.target.value}
                  })}
                />
              </div>

              <h4>Medicines</h4>
              {newPharmacy.medicines.map((medicine, index) => (
                <div key={index} className="medicine-form">
                  <input
                    type="text"
                    placeholder="Medicine Name"
                    value={medicine.name}
                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={medicine.quantity}
                    onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value))}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    value={medicine.price}
                    onChange={(e) => updateMedicine(index, 'price', parseFloat(e.target.value))}
                    required
                  />
                </div>
              ))}
              
              <button type="button" onClick={addMedicineField} className="btn btn-secondary">
                Add Another Medicine
              </button>
              
              <button type="submit" className="btn btn-primary">Create Pharmacy</button>
            </form>
          </div>
        )}

        {/* User's Pharmacies */}
        <div className="pharmacies-list">
          <h3>Your Pharmacies</h3>
          {pharmacies.length === 0 ? (
            <p>No pharmacies found. Add your first pharmacy!</p>
          ) : (
            <div className="pharmacies-grid">
              {pharmacies.map(pharmacy => (
                <div key={pharmacy._id} className="pharmacy-card">
                  <h4>{pharmacy.name}</h4>
                  <p>{pharmacy.address}</p>
                  <p>Contact: {pharmacy.contact?.phone || 'N/A'}</p>
                  <div className="medicines-list">
                    <h5>Medicines:</h5>
                    {pharmacy.medicines.map((medicine, index) => (
                      <div key={index} className="medicine-item">
                        <span>{medicine.name}</span>
                        <span>Qty: {medicine.quantity}</span>
                        <span>${medicine.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;