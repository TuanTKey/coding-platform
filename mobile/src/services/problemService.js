import apiClient from './apiClient';

export const problemService = {
  async getAllProblems(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags);

      const response = await apiClient.get(`/problems?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProblemById(id) {
    try {
      const response = await apiClient.get(`/problems/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProblemBySlug(slug) {
    try {
      const response = await apiClient.get(`/problems/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async searchProblems(query) {
    try {
      const response = await apiClient.get('/problems', {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProblemsByDifficulty(difficulty) {
    try {
      const response = await apiClient.get('/problems', {
        params: { difficulty },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
