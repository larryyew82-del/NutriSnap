import React, { useRef, useState } from 'react';
import CameraIcon from './icons/CameraIcon';
import UploadIcon from './icons/UploadIcon';
import SparkIcon from './icons/SparkIcon';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  imagePreviewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onAnalyze, isLoading, imagePreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Analyze Your Meal</h2>
        <p className="text-slate-500 mt-1">Upload or snap a photo of your food to get started.</p>
      </div>

      <div className="w-full aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden mb-6">
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Food preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 text-center">
            <CameraIcon className="w-16 h-16 mx-auto" />
            <p>Image preview will appear here</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <CameraIcon className="w-5 h-5 mr-2" />
          Take Photo
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <UploadIcon className="w-5 h-5 mr-2" />
          Upload Image
        </button>
      </div>

      <button
        onClick={onAnalyze}
        disabled={!imagePreviewUrl || isLoading}
        className="w-full flex items-center justify-center px-4 py-4 bg-teal-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
      >
        <SparkIcon className="w-6 h-6 mr-3" />
        Analyze Food
      </button>
    </div>
  );
};

export default ImageUploader;
