import { create } from "zustand";
import { submissionService } from "../services/submission";

export const useSubmissionStore = create((set) => ({
  submissions: [],
  currentSubmission: null,
  loading: false,
  error: null,

  // Get user submissions
  getUserSubmissions: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await submissionService.getUserSubmissions(filters);
      set({
        submissions: data.submissions,
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

  // Get submission status
  getSubmissionStatus: async (submissionId) => {
    set({ loading: true, error: null });
    try {
      const data = await submissionService.getSubmissionStatus(submissionId);
      set({
        currentSubmission: data.submission,
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

  // Clear error
  clearError: () => set({ error: null }),
}));
