import apiClient from './apiClient';

export const contestService = {
  async getAllContests(page = 1, limit = 20, status = null) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (status) params.append('status', status);

      const response = await apiClient.get(`/contests?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getContestById(id) {
    try {
      const response = await apiClient.get(`/contests/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async joinContest(contestId) {
    try {
      const response = await apiClient.post(`/contests/${contestId}/join`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getContestLeaderboard(contestId, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      const response = await apiClient.get(
        `/contests/${contestId}/leaderboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getContestProblems(contestId) {
    try {
      const response = await apiClient.get(`/contests/${contestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUpcomingContests() {
    try {
      const response = await apiClient.get('/contests', {
        params: { status: 'upcoming' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getRunningContests() {
    try {
      const response = await apiClient.get('/contests', {
        params: { status: 'running' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
