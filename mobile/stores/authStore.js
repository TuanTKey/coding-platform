import { create } from "zustand";
import { authService } from "../services/auth";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,

  // Initialize auth state
  initAuth: async () => {
    try {
      const user = await authService.getCurrentUser();
      const isAuth = await authService.isAuthenticated();
      set({
        user,
        isAuthenticated: isAuth,
        loading: false,
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ loading: false });
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const data = await authService.login(credentials);
      set({
        user: data.user,
        isAuthenticated: true,
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const data = await authService.register(userData);
      set({
        user: data.user,
        isAuthenticated: true,
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  // Set user
  setUser: (user) => set({ user }),

  // Update user
  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },
}));
