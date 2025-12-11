export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

export const LANGUAGES = ['python', 'javascript', 'cpp', 'java'];

export const SUBMISSION_STATUSES = [
  'pending',
  'judging',
  'accepted',
  'wrong_answer',
  'time_limit',
  'memory_limit',
  'runtime_error',
  'compile_error',
];

export const CLASSES = [
  '10A1', '10A2', '10A3', '10A4', '10A5',
  '11A1', '11A2', '11A3', '11A4', '11A5',
  '12A1', '12A2', '12A3', '12A4', '12A5',
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PROBLEMS: {
    GET_ALL: '/problems',
    GET_ONE: (id) => `/problems/${id}`,
    GET_BY_SLUG: (slug) => `/problems/slug/${slug}`,
  },
  SUBMISSIONS: {
    CREATE: '/submissions',
    GET_STATUS: (id) => `/submissions/${id}`,
    GET_ALL: '/submissions',
    RUN: '/submissions/run',
  },
  CONTESTS: {
    GET_ALL: '/contests',
    GET_ONE: (id) => `/contests/${id}`,
    JOIN: (id) => `/contests/${id}/join`,
    LEADERBOARD: (id) => `/contests/${id}/leaderboard`,
  },
  USERS: {
    GET_PROFILE: (id) => `/users/${id}`,
    GET_STATS: (id) => `/users/${id}/stats`,
    GET_LEADERBOARD: '/users/leaderboard',
    UPDATE_PROFILE: (id) => `/users/${id}`,
  },
};
