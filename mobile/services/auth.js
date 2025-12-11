import api from "./api";
import * as SecureStore from "expo-secure-store";

export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      await SecureStore.setItemAsync("token", response.data.token);
      await SecureStore.setItemAsync(
        "user",
        JSON.stringify(response.data.user)
      );
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      await SecureStore.setItemAsync("token", response.data.token);
      await SecureStore.setItemAsync(
        "user",
        JSON.stringify(response.data.user)
      );
    }
    return response.data;
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  getCurrentUser: async () => {
    try {
      const user = await SecureStore.getItemAsync("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },
};
