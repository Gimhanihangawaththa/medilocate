import React from 'react';
import { useParams, Link } from 'react-router-dom';

const samplePharmacy = {
  id: 'pharm-1',
  name: 'ABC Pharmacy',
  address: '123 Main St',
  phone: '555-1234',
  email: 'info@abc.com',
  hours: '9 AM - 7 PM',
  socials: { facebook: '#', twitter: '#', instagram: '#' },
  medicines: [
    { name: 'Aspirin', status: 'In stock' },
    { name: 'Paracetamol', status: 'Low stock' },
    { name: 'Ibuprofen', status: 'Out of stock' },
  ],
};

const PharmacyDetails = () => {
  const { id } = useParams();
  const pharmacy = samplePharmacy; // Placeholder data

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-lg text-slate-500 mb-1">Pharmacy ID: {id}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800">{pharmacy.name}</h1>
            <p className="text-lg text-slate-600">{pharmacy.address}</p>
          </div>
          <div className="flex gap-3">
            <a href={`tel:${pharmacy.phone}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-base font-semibold">Call</a>
            <a href={`mailto:${pharmacy.email}`} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-base font-semibold">Email</a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-base text-blue-700">Business Hours</p>
            <p className="text-xl font-semibold text-blue-900">{pharmacy.hours}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-base text-green-700">Contact</p>
            <p className="text-xl font-semibold text-green-900">{pharmacy.phone}</p>
            <p className="text-base text-green-800">{pharmacy.email}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-base text-purple-700">Directions</p>
            <button className="text-purple-800 font-semibold hover:underline cursor-pointer text-base">Open in Maps</button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Available Medicines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmacy.medicines.map((med) => (
              <div key={med.name} className="p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-lg">{med.name}</span>
                <span className="text-base px-3 py-1 rounded-full bg-slate-100 text-slate-700">{med.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link to="/search" className="text-blue-600 hover:underline text-base">Back to results</Link>
          <Link to="/" className="text-slate-600 hover:underline text-base">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;
