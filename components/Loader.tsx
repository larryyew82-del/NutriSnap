import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-teal-500 mb-4"></div>
      <p className="text-lg font-semibold text-slate-700">{message}</p>
      <p className="text-sm text-slate-500 mt-1">Please wait while the AI works its magic...</p>
    </div>
  );
};

export default Loader;
