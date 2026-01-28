import React from 'react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const pastSearches = ['Paracetamol', 'Ibuprofen', 'Vitamin C'];
  const visits = ['ABC Pharmacy', 'HealthPlus Pharmacy'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Your Profile</h1>
          <p className="text-lg text-slate-600">Manage your account details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-slate-200 rounded-xl">
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">User info</h3>
            <p className="text-base text-slate-600">Name: {user.username || 'Guest'}</p>
            <p className="text-base text-slate-600">Email: {user.email || 'user@example.com'}</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl">
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Preferences</h3>
            <p className="text-base text-slate-600">Notifications: Enabled</p>
            <p className="text-base text-slate-600">Language: English</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-slate-200 rounded-xl">
            <h3 className="text-2xl font-semibold text-slate-800 mb-3">Past searches</h3>
            <ul className="space-y-2 text-base text-slate-700 list-disc list-inside">
              {pastSearches.map((s) => (<li key={s}>{s}</li>))}
            </ul>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl">
            <h3 className="text-2xl font-semibold text-slate-800 mb-3">Visited pharmacies</h3>
            <ul className="space-y-2 text-base text-slate-700 list-disc list-inside">
              {visits.map((v) => (<li key={v}>{v}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
