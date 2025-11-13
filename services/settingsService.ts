import { Settings } from '../types';
import { getCurrentUser } from './authService';

const getSettingsKey = (): string | null => {
    const user = getCurrentUser();
    return user ? `nutrisnap_settings_${user.email}` : null;
};

const DEFAULT_SETTINGS: Settings = {
  dailyGoals: {
    calories: 2000,
    protein: 100,
    carbs: 250,
  },
  mealReminders: {
    enabled: false,
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:00',
  },
};

export const getSettings = (): Settings => {
  const key = getSettingsKey();
  if (!key) return DEFAULT_SETTINGS;

  try {
    const storedSettings = localStorage.getItem(key);
    if (storedSettings) {
      // Merge with defaults to ensure all keys are present if the structure changed
      return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to parse settings from localStorage", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Settings): void => {
  const key = getSettingsKey();
  if (!key) {
      console.error("Cannot save settings: no user logged in.");
      return;
  };

  try {
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage", error);
  }
};
