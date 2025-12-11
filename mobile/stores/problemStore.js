import { create } from "zustand";
import { problemService } from "../services/problem";

export const useProblemStore = create((set) => ({
  problems: [],
  currentProblem: null,
  loading: false,
  error: null,
  filters: {
    difficulty: "",
    search: "",
    tags: "",
    page: 1,
  },

  // Get all problems
  getProblems: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await problemService.getAllProblems(filters);
      set({
        problems: data.problems,
        loading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
      throw error;
    }
  },

  // Get problem by ID
  getProblemById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await problemService.getProblemById(id);
      set({
        currentProblem: data.problem,
        loading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
      throw error;
    }
  },

  // Set current problem
  setCurrentProblem: (problem) => set({ currentProblem: problem }),

  // Set filters
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  // Reset filters
  resetFilters: () =>
    set({
      filters: {
        difficulty: "",
        search: "",
        tags: "",
        page: 1,
      },
    }),

  // Clear error
  clearError: () => set({ error: null }),
}));
