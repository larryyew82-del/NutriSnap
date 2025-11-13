import React from 'react';
import SparkIcon from './icons/SparkIcon';
import GoogleIcon from './icons/GoogleIcon';
import { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => (
  <header className="bg-white shadow-md w-full sticky top-0 z-50">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <SparkIcon className="h-8 w-8 text-teal-500 mr-3" />
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          NutriSnap AI
        </h1>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-right">
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
              <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  </header>
);

export default Header;
