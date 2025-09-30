// index.js

import 'dotenv/config'; // replaces require('dotenv').config()
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'text-bison-001';

// Health check
app.get('/', (req, res) => res.send({ ok: true }));

// Gemini helper
async function callGemini(prompt, temperature = 0.2, maxOutputTokens = 512) {
  if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY in env');

  const url = `https://generativelanguage.googleapis.com/v1beta2/models/${GEMINI_MODEL}:generateText`;

  const body = { prompt: { text: prompt }, temperature, maxOutputTokens };

  const resp = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return data?.candidates?.[0]?.output || data?.outputs?.[0]?.content?.[0]?.text || JSON.stringify(data);
}

// Routes
app.post('/api/generate-question', async (req, res) => {
  try {
    const { difficulty = 'Easy', role = 'Full Stack (React/Node)' } = req.body;
    const prompt = `
You are an interviewer for a ${role} role. Produce a single interview question with difficulty "${difficulty}".
Return a JSON object only with keys:
{ "text": "<question text>", "expected": "<short expected answer summary>", "keyPoints": ["point1", "point2", "point3"] }
Keep responses compact and JSON-parseable.
`;
    const output = await callGemini(prompt, 0.1, 400);

    let json;
    try {
      json = JSON.parse(output);
    } catch (e) {
      const m = output.match(/\{[\s\S]*\}/);
      json = m ? JSON.parse(m[0]) : { text: output, expected: '', keyPoints: [] };
    }
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/score-answer', async (req, res) => {
  try {
    const { questionText, candidateAnswer, keyPoints = [] } = req.body;
    const prompt = `
You are a technical interviewer assistant. Grade the candidate's answer on a scale 0-10.
Question: ${questionText}
Key points to look for: ${JSON.stringify(keyPoints)}
Candidate answer: ${candidateAnswer}
Return a JSON object:
{ "score": <integer 0-10>, "feedback": "<one-sentence feedback>" }
Only return JSON.
`;
    const output = await callGemini(prompt, 0.0, 200);
    let json;
    try {
      json = JSON.parse(output);
    } catch (e) {
      const m = output.match(/\{[\s\S]*\}/);
      json = m ? JSON.parse(m[0]) : { score: 0, feedback: output };
    }
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
