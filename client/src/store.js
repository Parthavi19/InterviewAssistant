import { configureStore } from '@reduxjs/toolkit';
import candidatesReducer from './slices/candidatesSlice';

export const store = configureStore({
  reducer: {
    candidates: candidatesReducer,
  },
});
