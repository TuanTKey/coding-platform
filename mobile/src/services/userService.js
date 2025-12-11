import apiClient from './apiClient';

export const userService = {
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserStats(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(userId, data) {
    try {
      const response = await apiClient.put(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getLeaderboard(page = 1, limit = 20) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      const response = await apiClient.get(`/users/leaderboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async searchUsers(username) {
    try {
      const response = await apiClient.get('/users', {
        params: { search: username },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
