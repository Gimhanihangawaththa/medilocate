import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
        <h1 className="text-7xl font-bold text-blue-600 mb-3">404</h1>
        <p className="text-2xl text-slate-700 mb-6">Oops! We couldn't find what you were looking for.</p>
        <div className="flex flex-col gap-3">
          <Link to="/" className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-lg">Go to Home</Link>
          <Link to="/search" className="px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:border-blue-500 hover:text-blue-600 text-lg">Search medicines</Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
