import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from './authAPI';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('authToken', token);
      set({ token, user, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  register: async (name, email, password, role = 'student') => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ name, email, password, role });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('authToken', token);
      set({ token, user, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    set({ user: null, token: null });
  },

  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        set({ token });
        return true;
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
    }
    return false;
  },

  clearError: () => set({ error: null }),
}));
