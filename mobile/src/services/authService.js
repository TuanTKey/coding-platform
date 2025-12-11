import apiClient from './apiClient';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async register(username, email, password, fullName, userClass, studentId = '') {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password,
        fullName,
        class: userClass,
        studentId,
      });

      if (response.data.token) {
        await SecureStore.setItemAsync('authToken', response.data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      if (response.data.token) {
        await SecureStore.setItemAsync('authToken', response.data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  async getCurrentUser() {
    try {
      const user = await SecureStore.getItemAsync('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },
};
