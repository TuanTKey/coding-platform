import apiClient from './apiClient';

export const submissionService = {
  async submitSolution(problemId, code, language, contestId = null) {
    try {
      const payload = {
        problemId,
        code,
        language,
      };

      if (contestId) {
        payload.contestId = contestId;
      }

      const response = await apiClient.post('/submissions', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getSubmissionStatus(submissionId) {
    try {
      const response = await apiClient.get(`/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserSubmissions(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (filters.problemId) params.append('problemId', filters.problemId);
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get(`/submissions?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async runCode(code, language, input = '') {
    try {
      const response = await apiClient.post('/submissions/run', {
        code,
        language,
        input,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
