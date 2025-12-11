import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { problemService } from '../../services/problemService';

export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await problemService.getAllProblems(page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProblemById = createAsyncThunk(
  'problems/fetchProblemById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await problemService.getProblemById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProblemBySlug = createAsyncThunk(
  'problems/fetchProblemBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await problemService.getProblemBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  problems: [],
  currentProblem: null,
  sampleTestCases: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  total: 0,
};

const problemSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Problems
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload.problems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Problem by ID
    builder
      .addCase(fetchProblemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblemById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProblem = action.payload.problem;
        state.sampleTestCases = action.payload.sampleTestCases;
      })
      .addCase(fetchProblemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Problem by Slug
    builder
      .addCase(fetchProblemBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblemBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProblem = action.payload.problem;
        state.sampleTestCases = action.payload.sampleTestCases;
      })
      .addCase(fetchProblemBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = problemSlice.actions;
export default problemSlice.reducer;
