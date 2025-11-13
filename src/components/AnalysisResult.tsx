import React, { useState, useEffect } from 'react';
import { FoodAnalysis, HealthRiskAssessment } from '../types';
import GoogleIcon from './icons/GoogleIcon';
import EditIcon from './icons/EditIcon';

interface AnalysisResultProps {
  analysis: FoodAnalysis;
  risks: HealthRiskAssessment;
  onUpdate: (correctedName: string) => void;
  isUpdating: boolean;
  portionMultiplier: number;
  onPortionChange: (multiplier: number) => void;
}

const RiskMeter: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const percentage = (score / 10) * 100;
  let color = 'bg-green-500';
  if (score > 4) color = 'bg-yellow-500';
  if (score > 7) color = 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-base font-semibold text-slate-700">{label}</span>
        <span className={`font-bold text-lg ${color.replace('bg-', 'text-')}`}>{score.toFixed(1)}/10</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-4">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const NutritionItem: React.FC<{ label: string; value: string | number; unit: string; sub?: boolean }> = ({ label, value, unit, sub = false }) => (
  <div className={`flex justify-between py-2 border-b border-slate-200 ${sub ? 'pl-4' : ''}`}>
    <span className={sub ? 'text-slate-500' : 'font-semibold text-slate-600'}>{label}</span>
    <span className="font-medium text-slate-800">{value} {unit}</span>
  </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, risks, onUpdate, isUpdating, portionMultiplier, onPortionChange }) => {
  const { nutritionalInfo, sources } = analysis;
  const [isEditing, setIsEditing] = useState(false);
  const [editedFoodName, setEditedFoodName] = useState(nutritionalInfo.foodName);

  useEffect(() => {
    setEditedFoodName(nutritionalInfo.foodName);
  }, [nutritionalInfo.foodName]);

  const handleUpdateClick = () => {
    if (editedFoodName.trim() && editedFoodName.trim() !== nutritionalInfo.foodName) {
      onUpdate(editedFoodName.trim());
    }
    setIsEditing(false);
  };

  const PortionButton: React.FC<{multiplier: number}> = ({ multiplier }) => (
    <button
        onClick={() => onPortionChange(multiplier)}
        disabled={isUpdating}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
            portionMultiplier === multiplier
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-300'
        }`}
        aria-pressed={portionMultiplier === multiplier}
    >
        {multiplier}x
    </button>
  );


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <div className="relative">
                {isEditing ? (
                     <div className="flex items-center justify-center gap-2 mb-4">
                        <input
                            type="text"
                            value={editedFoodName}
                            onChange={(e) => setEditedFoodName(e.target.value)}
                            className="text-2xl font-bold text-slate-800 text-center bg-transparent border-b-2 border-teal-500 focus:outline-none w-full"
                            placeholder="Enter food name (local names ok!)"
                            autoFocus
                            disabled={isUpdating}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateClick()}
                        />
                        <button
                            onClick={handleUpdateClick}
                            disabled={isUpdating || !editedFoodName.trim()}
                            className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:bg-slate-400"
                            aria-label="Update food name"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button onClick={() => setIsEditing(false)} disabled={isUpdating} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300" aria-label="Cancel editing">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="text-center mb-1">
                        <h2 className="text-3xl font-bold text-slate-800 inline-block align-middle">{nutritionalInfo.foodName}</h2>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="ml-2 text-slate-400 hover:text-teal-600 inline-block align-middle disabled:opacity-50"
                            aria-label="Edit food name"
                            title="Edit food name"
                            disabled={isUpdating}
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            
            <p className="text-center text-slate-500 mb-2">AI-Generated Nutritional Analysis</p>
            <p className="text-center text-lg font-semibold text-teal-600">
              Estimated Weight: {nutritionalInfo.estimatedWeight.toFixed(0)}g
            </p>
            
            <div className="my-6 bg-slate-50 p-4 rounded-lg">
                <label htmlFor="servings-input" className="block text-center text-base font-semibold text-slate-700 mb-3">Adjust Servings</label>
                <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center bg-slate-200 rounded-full p-1 shadow-inner">
                        <PortionButton multiplier={0.5} />
                        <PortionButton multiplier={1} />
                        <PortionButton multiplier={1.5} />
                        <PortionButton multiplier={2} />
                    </div>
                    <input
                        id="servings-input"
                        type="number"
                        value={portionMultiplier}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                                onPortionChange(val);
                            }
                        }}
                        className="w-24 text-center font-bold text-lg text-teal-600 bg-transparent border-b-2 border-slate-300 focus:outline-none focus:ring-0 focus:border-teal-500 disabled:bg-slate-100"
                        min="0.1"
                        step="0.1"
                        disabled={isUpdating}
                    />
                </div>
            </div>

             {isUpdating && <p className="text-center text-sm text-slate-500 animate-pulse">Recalculating...</p>}


            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                <NutritionItem label="Calories" value={nutritionalInfo.calories.toFixed(0)} unit="kcal" />
                <NutritionItem label="Protein" value={nutritionalInfo.protein.toFixed(1)} unit="g" />
                <NutritionItem label="Carbs" value={nutritionalInfo.carbohydrates.total.toFixed(1)} unit="g" />
                <NutritionItem label="Sugar" value={nutritionalInfo.carbohydrates.sugar.toFixed(1)} unit="g" sub />
                <NutritionItem label="Fat" value={nutritionalInfo.fat.total.toFixed(1)} unit="g" />
                <NutritionItem label="Saturated Fat" value={nutritionalInfo.fat.saturated.toFixed(1)} unit="g" sub />
                <NutritionItem label="Sodium" value={nutritionalInfo.sodium.toFixed(0)} unit="mg" />
                <NutritionItem label="Cholesterol" value={nutritionalInfo.cholesterol.toFixed(0)} unit="mg" />
            </div>
        </div>
      
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">Health Risk Assessment</h3>
            <div className="space-y-6">
                <div>
                    <RiskMeter score={risks.diabetes.score} label="Diabetes Risk" />
                    <p className="text-sm text-slate-600 mt-2">{risks.diabetes.reasoning}</p>
                </div>
                <div>
                    <RiskMeter score={risks.hypertension.score} label="Hypertension Risk" />
                    <p className="text-sm text-slate-600 mt-2">{risks.hypertension.reasoning}</p>
                </div>
                <div>
                    <RiskMeter score={risks.cholesterol.score} label="Cholesterol Risk" />
                    <p className="text-sm text-slate-600 mt-2">{risks.cholesterol.reasoning}</p>
                </div>
            </div>
        </div>

      {sources.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <h3 className="text-xl font-bold text-slate-700 mb-3">Data Sources</h3>
          <ul className="space-y-2">
            {sources.map((source, index) => source.web && (
              <li key={index} className="flex items-start">
                <GoogleIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-slate-500" />
                <a
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {source.web.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
