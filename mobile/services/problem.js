import api from "./api";

export const problemService = {
  getAllProblems: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.search) params.append("search", filters.search);
    if (filters.tags) params.append("tags", filters.tags);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await api.get(`/problems?${params.toString()}`);
    return response.data;
  },

  getProblemById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  getProblemBySlug: async (slug) => {
    const response = await api.get(`/problems/slug/${slug}`);
    return response.data;
  },

  submitSolution: async (problemId, code, language, contestId = null) => {
    const data = {
      problemId,
      code,
      language,
    };
    if (contestId) {
      data.contestId = contestId;
    }
    const response = await api.post("/submissions", data);
    return response.data;
  },
};
