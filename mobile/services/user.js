import api from "./api";

export const userService = {
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/users/me", userData);
    return response.data;
  },

  getLeaderboard: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const response = await api.get(`/users/leaderboard?${params.toString()}`);
    return response.data;
  },
};
