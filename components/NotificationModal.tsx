import React from 'react';
import SparkIcon from './icons/SparkIcon';
import CloseIcon from './icons/CloseIcon';

interface NotificationModalProps {
  meal: string;
  tip: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ meal, tip, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100 opacity-100">
        <div className="flex justify-end">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        <SparkIcon className="w-16 h-16 text-teal-500 mx-auto -mt-4 mb-2" />
        <h2 className="text-2xl font-bold text-slate-800">Time for {meal}!</h2>
        <p className="text-slate-500 mt-2 mb-4">Ready to log your meal? Here's a quick tip to inspire you:</p>
        <div className="bg-teal-50 p-4 rounded-lg">
            <p className="text-teal-800 font-semibold italic">"{tip}"</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
