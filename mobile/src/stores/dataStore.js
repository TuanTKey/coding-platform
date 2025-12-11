import { create } from 'zustand';

export const useProblemStore = create((set) => ({
  problems: [],
  currentProblem: null,
  submissions: [],

  setProblems: (problems) => set({ problems }),
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  setSubmissions: (submissions) => set({ submissions }),

  addSubmission: (submission) =>
    set((state) => ({
      submissions: [submission, ...state.submissions],
    })),
}));

export const useContestStore = create((set) => ({
  contests: [],
  currentContest: null,
  leaderboard: [],

  setContests: (contests) => set({ contests }),
  setCurrentContest: (contest) => set({ currentContest: contest }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
}));

export const useUIStore = create((set) => ({
  loading: false,
  error: null,
  success: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  clearMessages: () => set({ error: null, success: null }),
}));
