import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contestService } from '../../services/contestService';

export const fetchContests = createAsyncThunk(
  'contests/fetchContests',
  async ({ page = 1, limit = 20, status = null }, { rejectWithValue }) => {
    try {
      const response = await contestService.getAllContests(page, limit, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchContestById = createAsyncThunk(
  'contests/fetchContestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contestService.getContestById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinContest = createAsyncThunk(
  'contests/joinContest',
  async (contestId, { rejectWithValue }) => {
    try {
      const response = await contestService.joinContest(contestId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchContestLeaderboard = createAsyncThunk(
  'contests/fetchContestLeaderboard',
  async ({ contestId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await contestService.getContestLeaderboard(
        contestId,
        page,
        limit
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  contests: [],
  currentContest: null,
  leaderboard: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  total: 0,
};

const contestSlice = createSlice({
  name: 'contests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Contests
    builder
      .addCase(fetchContests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContests.fulfilled, (state, action) => {
        state.loading = false;
        state.contests = action.payload.contests;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchContests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Contest by ID
    builder
      .addCase(fetchContestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContest = action.payload.contest;
      })
      .addCase(fetchContestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Join Contest
    builder
      .addCase(joinContest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinContest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContest = action.payload;
      })
      .addCase(joinContest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Contest Leaderboard
    builder
      .addCase(fetchContestLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContestLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchContestLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = contestSlice.actions;
export default contestSlice.reducer;
