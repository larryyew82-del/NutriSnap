import { User } from '../types';

const AUTH_KEY = 'nutrisnap_user';

// This is a mock user for demonstration purposes.
const mockUser: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  picture: 'https://i.pravatar.cc/150?u=alexdoe',
};

/**
 * Simulates a user logging in.
 * Stores a mock user object in localStorage.
 * @returns The logged-in user object.
 */
export const login = (): User => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
  } catch (error) {
    console.error("Failed to save user to localStorage", error);
  }
  return mockUser;
};

/**
 * Simulates a user logging out.
 * Removes the user object from localStorage.
 */
export const logout = (): void => {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error("Failed to remove user from localStorage", error);
  }
};

/**
 * Retrieves the current user from localStorage.
 * @returns The user object if logged in, otherwise null.
 */
export const getCurrentUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(AUTH_KEY);
    if (storedUser) {
      return JSON.parse(storedUser) as User;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};