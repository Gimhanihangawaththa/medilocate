import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-200 py-10 mt-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-xl font-semibold mb-3">MediLocate</h4>
          <p className="text-sm text-slate-400">Find medicines nearby with ease and confidence.</p>
        </div>
        <div>
          <h5 className="text-lg font-semibold mb-3">Contact</h5>
          <p className="text-sm text-slate-300">Email: support@medilocate.app</p>
          <p className="text-sm text-slate-300">Phone: +1 (555) 123-4567</p>
        </div>
        <div>
          <h5 className="text-lg font-semibold mb-3">Legal</h5>
          <div className="flex flex-col space-y-2 text-sm text-slate-300">
            <button className="hover:text-white text-left">Privacy Policy</button>
            <button className="hover:text-white text-left">Terms of Service</button>
            <button className="hover:text-white text-left">Support</button>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} MediLocate. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
