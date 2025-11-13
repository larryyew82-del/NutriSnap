import { HistoryEntry } from '../types';
import { getCurrentUser } from './authService';

const getHistoryKey = (): string | null => {
    const user = getCurrentUser();
    // Use a unique key for each user's history
    return user ? `nutrisnap_history_${user.email}` : null;
};

export const getHistoryEntries = (): HistoryEntry[] => {
  const key = getHistoryKey();
  if (!key) return [];

  try {
    const storedHistory = localStorage.getItem(key);
    if (storedHistory) {
      const entries: HistoryEntry[] = JSON.parse(storedHistory);
      return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

export const addHistoryEntry = (entry: HistoryEntry): void => {
  const key = getHistoryKey();
  if (!key) {
      console.error("Cannot add history entry: no user logged in.");
      return;
  };

  const currentHistory = getHistoryEntries();
  const updatedHistory = [entry, ...currentHistory];
  try {
    localStorage.setItem(key, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
};
