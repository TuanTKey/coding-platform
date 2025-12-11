import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { submissionService } from '../../services/submissionService';

export const submitSolution = createAsyncThunk(
  'submissions/submitSolution',
  async ({ problemId, code, language, contestId }, { rejectWithValue }) => {
    try {
      const response = await submissionService.submitSolution(
        problemId,
        code,
        language,
        contestId
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSubmissionStatus = createAsyncThunk(
  'submissions/getSubmissionStatus',
  async (submissionId, { rejectWithValue }) => {
    try {
      const response = await submissionService.getSubmissionStatus(submissionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserSubmissions = createAsyncThunk(
  'submissions/fetchUserSubmissions',
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await submissionService.getUserSubmissions(page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  submissions: [],
  currentSubmission: null,
  loading: false,
  submitting: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  total: 0,
};

const submissionSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSubmission: (state, action) => {
      state.currentSubmission = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Submit Solution
    builder
      .addCase(submitSolution.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitSolution.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentSubmission = action.payload;
      })
      .addCase(submitSolution.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    // Get Submission Status
    builder
      .addCase(getSubmissionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubmissionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubmission = action.payload.submission;
      })
      .addCase(getSubmissionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch User Submissions
    builder
      .addCase(fetchUserSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload.submissions;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchUserSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
