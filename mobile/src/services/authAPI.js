import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

export const problemService = {
  getAllProblems: (page = 1, limit = 10, difficulty = null) => {
    const params = { page, limit };
    if (difficulty) params.difficulty = difficulty;
    return api.get('/problems', { params });
  },
  getProblemBySlug: (slug) => api.get(`/problems/${slug}`),
  createProblem: (data) => api.post('/problems', data),
  updateProblem: (id, data) => api.put(`/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/problems/${id}`),
};

export const submissionService = {
  submitCode: (data) => api.post('/submissions', data),
  runCode: (data) => api.post('/submissions/run', data),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  getUserSubmissions: (page = 1, limit = 10) => 
    api.get('/submissions', { params: { page, limit } }),
  getProblemSubmissions: (problemId) => 
    api.get(`/submissions/problem/${problemId}`),
};

export const contestService = {
  getAllContests: (page = 1, limit = 10) => 
    api.get('/contests', { params: { page, limit } }),
  getContestById: (id) => api.get(`/contests/${id}`),
  createContest: (data) => api.post('/contests', data),
  updateContest: (id, data) => api.put(`/contests/${id}`, data),
  deleteContest: (id) => api.delete(`/contests/${id}`),
  joinContest: (contestId) => api.post(`/contests/${contestId}/join`),
  leaveContest: (contestId) => api.post(`/contests/${contestId}/leave`),
  getContestLeaderboard: (contestId) => api.get(`/contests/${contestId}/leaderboard`),
};

export const userService = {
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getLeaderboard: (page = 1, limit = 10) => 
    api.get('/users/leaderboard', { params: { page, limit } }),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
};

export const classService = {
  getClasses: () => api.get('/classes'),
  getClassById: (id) => api.get(`/classes/${id}`),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  joinClass: (code) => api.post('/classes/join', { code }),
  getClassStudents: (id) => api.get(`/classes/${id}/students`),
};
