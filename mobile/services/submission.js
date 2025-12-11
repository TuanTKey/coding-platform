import api from "./api";

export const submissionService = {
  getSubmissionStatus: async (submissionId) => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data;
  },

  getUserSubmissions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.problemId) params.append("problemId", filters.problemId);
    if (filters.status) params.append("status", filters.status);

    const response = await api.get(`/submissions?${params.toString()}`);
    return response.data;
  },

  getProblemSubmissions: async (problemId, filters = {}) => {
    const params = new URLSearchParams();
    params.append("problemId", problemId);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await api.get(`/submissions?${params.toString()}`);
    return response.data;
  },
};
