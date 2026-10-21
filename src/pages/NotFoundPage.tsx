import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        The page or route you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};
