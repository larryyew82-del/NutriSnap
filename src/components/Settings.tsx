import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/settingsService';
import { Settings as SettingsType } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>(getSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        [name]: parseInt(value, 10) || 0,
      },
    }));
  };

  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
        const key = name as keyof SettingsType['mealReminders'];
        if (key === 'enabled') {
            setSettings(prev => ({
                ...prev,
                mealReminders: { ...prev.mealReminders, enabled: checked }
            }));
        }
    } else {
        setSettings(prev => ({
            ...prev,
            mealReminders: { ...prev.mealReminders, [name]: value }
        }));
    }
  };

  const handleSupplementToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setSettings(prev => ({
      ...prev,
      showSupplementSuggestions: checked,
    }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Daily Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-slate-700">Calories (kcal)</label>
            <input
              type="number"
              name="calories"
              id="calories"
              value={settings.dailyGoals.calories}
              onChange={handleGoalChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="protein" className="block text-sm font-medium text-slate-700">Protein (g)</label>
            <input
              type="number"
              name="protein"
              id="protein"
              value={settings.dailyGoals.protein}
              onChange={handleGoalChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="carbs" className="block text-sm font-medium text-slate-700">Carbs (g)</label>
            <input
              type="number"
              name="carbs"
              id="carbs"
              value={settings.dailyGoals.carbs}
              onChange={handleGoalChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">Preferences</h3>
        
        <div className="flex items-center justify-center mb-6">
          <label htmlFor="reminders-enabled" className="flex items-center cursor-pointer">
            <span className="mr-3 text-slate-700 font-medium">Enable AI Health Tip Reminders</span>
            <div className="relative">
              <input
                type="checkbox"
                id="reminders-enabled"
                name="enabled"
                checked={settings.mealReminders.enabled}
                onChange={handleReminderChange}
                className="sr-only peer"
              />
              <div className="block bg-slate-300 w-14 h-8 rounded-full peer-checked:bg-emerald-200"></div>
              <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-teal-500"></div>
            </div>
          </label>
        </div>

        {settings.mealReminders.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="breakfast" className="block text-sm font-medium text-slate-700">Breakfast Time</label>
              <input
                type="time"
                name="breakfast"
                id="breakfast"
                value={settings.mealReminders.breakfast}
                onChange={handleReminderChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="lunch" className="block text-sm font-medium text-slate-700">Lunch Time</label>
              <input
                type="time"
                name="lunch"
                id="lunch"
                value={settings.mealReminders.lunch}
                onChange={handleReminderChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="dinner" className="block text-sm font-medium text-slate-700">Dinner Time</label>
              <input
                type="time"
                name="dinner"
                id="dinner"
                value={settings.mealReminders.dinner}
                onChange={handleReminderChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-center">
                <label htmlFor="supplement-suggestions" className="flex items-center cursor-pointer">
                    <span className="mr-3 text-slate-700 font-medium">Show AI Supplement Suggestions</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="supplement-suggestions"
                            name="showSupplementSuggestions"
                            checked={settings.showSupplementSuggestions}
                            onChange={handleSupplementToggle}
                            className="sr-only peer"
                        />
                        <div className="block bg-slate-300 w-14 h-8 rounded-full peer-checked:bg-emerald-200"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-teal-500"></div>
                    </div>
                </label>
            </div>
             <p className="text-xs text-center text-slate-500 mt-3">
               When enabled, the AI will offer supplement ideas based on your results. This is for informational purposes only.
             </p>
        </div>

      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600 transition-colors w-full md:w-auto"
        >
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;