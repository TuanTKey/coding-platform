import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import problemReducer from './slices/problemSlice';
import submissionReducer from './slices/submissionSlice';
import contestReducer from './slices/contestSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    problems: problemReducer,
    submissions: submissionReducer,
    contests: contestReducer,
    users: userReducer,
  },
});

export default store;
