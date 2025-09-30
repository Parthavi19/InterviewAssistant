import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function generateQuestion(difficulty, role = 'Full Stack (React/Node)') {
  const resp = await axios.post(`${API_BASE}/api/generate-question`, { difficulty, role });
  return resp.data;
}

export async function scoreAnswer(questionText, candidateAnswer, keyPoints) {
  const resp = await axios.post(`${API_BASE}/api/score-answer`, { questionText, candidateAnswer, keyPoints });
  return resp.data;
}

