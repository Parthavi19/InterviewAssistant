import { createSlice } from '@reduxjs/toolkit';

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState: {
    byId: {},
    allIds: [],
  },
  reducers: {
    addCandidate: (state, action) => {
      const candidate = action.payload;
      state.byId[candidate.id] = candidate;
      state.allIds.push(candidate.id);
    },
    updateCandidate: (state, action) => {
      const { id, patch } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...patch };
      }
    },
    addQuestionToCandidate: (state, action) => {
      const { id, question } = action.payload;
      if (state.byId[id]) {
        state.byId[id].questions = state.byId[id].questions || [];
        state.byId[id].questions.push(question);
      }
    },
    submitAnswer: (state, action) => {
      const { id, qIndex, answer, submittedAt, score, feedback } = action.payload;
      const candidate = state.byId[id];
      if (candidate?.questions?.[qIndex]) {
        candidate.questions[qIndex] = {
          ...candidate.questions[qIndex],
          answer,
          submittedAt,
          score,
          feedback,
        };
      }
    },
    setFinalSummary: (state, action) => {
      const { id, finalScore, summary } = action.payload;
      if (state.byId[id]) {
        state.byId[id].finalScore = finalScore;
        state.byId[id].summary = summary;
      }
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  addQuestionToCandidate,
  submitAnswer,
  setFinalSummary
} = candidatesSlice.actions;

export default candidatesSlice.reducer;
