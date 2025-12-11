import api from "./api";

export const contestService = {
  getAllContests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await api.get(`/contests?${params.toString()}`);
    return response.data;
  },

  getContestById: async (contestId) => {
    const response = await api.get(`/contests/${contestId}`);
    return response.data;
  },

  getContestProblems: async (contestId) => {
    const response = await api.get(`/contests/${contestId}/problems`);
    return response.data;
  },

  joinContest: async (contestId) => {
    const response = await api.post(`/contests/${contestId}/join`, {});
    return response.data;
  },

  getContestLeaderboard: async (contestId) => {
    const response = await api.get(`/contests/${contestId}/leaderboard`);
    return response.data;
  },

  getContestSubmissions: async (contestId, filters = {}) => {
    const params = new URLSearchParams();
    params.append("contestId", contestId);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await api.get(`/submissions?${params.toString()}`);
    return response.data;
  },
};
