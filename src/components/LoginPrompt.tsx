import React from 'react';
import GoogleIcon from './icons/GoogleIcon';
import SparkIcon from './icons/SparkIcon';

interface LoginPromptProps {
  onLogin: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLogin }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        <SparkIcon className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to NutriSnap AI</h2>
        <p className="text-slate-500 mb-8">
          Your personal AI-powered nutrition assistant. Sign in to track your meals and understand your eating habits.
        </p>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-200"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
