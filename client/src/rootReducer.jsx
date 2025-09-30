// rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import exampleSlice from './exampleSlice';

const rootReducer = combineReducers({
  example: exampleSlice,
});

export default rootReducer;
