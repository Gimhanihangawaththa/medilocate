import React from 'react';
import { Link, useParams } from 'react-router-dom';

const sampleMedicine = {
  name: 'Paracetamol',
  description: 'Used for pain relief and reducing fever.',
  sideEffects: ['Drowsiness', 'Nausea'],
  price: '$5',
  pharmacies: [
    { id: 'pharm-1', name: 'ABC Pharmacy', address: '123 Main St' },
    { id: 'pharm-3', name: 'HealthPlus Pharmacy', address: '45 Maple Blvd' },
  ],
  related: ['Ibuprofen', 'Aspirin', 'Naproxen'],
};

const MedicineDetails = () => {
  const { id } = useParams();
  const med = sampleMedicine; // Placeholder data

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <p className="text-lg text-slate-500 mb-1">Medicine ID: {id}</p>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">{med.name}</h1>
        <p className="text-lg text-slate-600 mb-6">{med.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 rounded-lg bg-blue-50">
            <p className="text-base text-blue-700">Price</p>
            <p className="text-3xl font-bold text-blue-900">{med.price}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50">
            <p className="text-base text-emerald-700">Availability</p>
            <p className="text-xl font-semibold text-emerald-900">Available nearby</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50">
            <p className="text-base text-amber-700">Side Effects</p>
            <p className="text-base text-amber-900">{med.sideEffects.join(', ')}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Available at</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {med.pharmacies.map((ph) => (
              <Link
                key={ph.id}
                to={`/pharmacy/${ph.id}`}
                className="block p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md"
              >
                <div className="font-semibold text-slate-800 text-lg">{ph.name}</div>
                <div className="text-base text-slate-600">{ph.address}</div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Related medicines</h2>
          <div className="flex flex-wrap gap-3">
            {med.related.map((r) => (
              <span key={r} className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-base">
                {r}
              </span>
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

export default MedicineDetails;
