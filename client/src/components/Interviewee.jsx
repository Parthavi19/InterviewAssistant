import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateCandidate, addQuestionToCandidate, submitAnswer, setFinalSummary } from '../slices/candidatesSlice';
import { generateQuestion, scoreAnswer } from '../utils/ai';
import useTimer from '../hooks/useTimer';
import { Button, Input, Progress, Modal, Typography } from 'antd';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const difficulties = ['Easy','Easy','Medium','Medium','Hard','Hard'];
const timerMap = { Easy: 20, Medium: 60, Hard: 120 };

export default function Interviewee({ candidateId }) {
  const candidate = useSelector(state => state.candidates.byId[candidateId]);
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [running, setRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);

  const questions = candidate?.questions || [];
  const q = questions[currentIndex];
  const initialSeconds = q?.timerSeconds || 0;

  const onExpire = async () => {
    await handleSubmit();
  };

  const { remaining, setRemaining } = useTimer(initialSeconds, q?.timerEndAt || null, onExpire);

  useEffect(() => {
    async function seedQuestions() {
      if (!candidate || questions.length > 0) return;

      for (let i = 0; i < 6; i++) {
        const diff = difficulties[i];
        setLoadingQ(true);
        try {
          const qData = await generateQuestion(diff);
          const qObj = {
            id: `q-${i+1}`,
            text: qData.text || `Default question ${i+1}`,
            difficulty: diff,
            timerSeconds: timerMap[diff],
            timerEndAt: null,
            answer: undefined,
            submittedAt: null,
            score: null,
            feedback: null,
            keyPoints: qData.keyPoints || []
          };
          dispatch(addQuestionToCandidate({ id: candidate.id, question: qObj }));
        } catch (err) {
          console.error('Failed to load question', err);
          dispatch(addQuestionToCandidate({
            id: candidate.id,
            question: {
              id: `q-${i+1}`,
              text: `Explain a concept related to ${diff} difficulty.`,
              difficulty: diff,
              timerSeconds: timerMap[diff],
              timerEndAt: null,
              answer: undefined,
              submittedAt: null,
              score: null,
              feedback: null,
              keyPoints: []
            }
          }));
        } finally {
          setLoadingQ(false);
        }
      }
    }
    seedQuestions();
  }, [candidate]);

  useEffect(() => {
    if (!q) return;
    const now = Date.now();
    const endAt = now + (q.timerSeconds * 1000);
    dispatch(updateCandidate({
      id: candidate.id,
      patch: {
        questions: questions.map((qq, idx) => idx === currentIndex ? { ...qq, timerEndAt: endAt } : qq)
      }
    }));
    setRemaining(Math.ceil((endAt - Date.now())/1000));
  }, [currentIndex, q?.id]);

  if (!candidate) return <div>Select a candidate to start interview</div>;

  const missing = [];
  if (!candidate.name) missing.push('name');
  if (!candidate.email) missing.push('email');
  if (!candidate.phone) missing.push('phone');

  async function handleFillMissing(field, value) {
    dispatch(updateCandidate({ id: candidate.id, patch: { [field]: value } }));
  }

  async function handleStart() {
    setRunning(true);
  }

  async function handleSubmit() {
    if (!q) return;
    const ans = inputVal.trim();
    setInputVal('');

    let score = 0, feedback = 'No feedback';
    try {
      const resp = await scoreAnswer(q.text, ans, q.keyPoints || []);
      score = parseInt(resp.score, 10) || 0;
      feedback = resp.feedback || '';
    } catch (err) {
      console.error('Scoring failed', err);
      feedback = 'Scoring service failed.';
    }

    dispatch(submitAnswer({
      id: candidate.id,
      qIndex: currentIndex,
      answer: ans,
      submittedAt: Date.now(),
      score,
      feedback
    }));

    if (currentIndex < (questions.length - 1)) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const all = questions.map((qq, idx) => idx === currentIndex ? { ...qq, answer: ans, score, feedback } : qq);
      const weight = { Easy:1, Medium:1.5, Hard:2 };
      let sum = 0, max = 0;
      for (const qq of all) {
        const w = weight[qq.difficulty] || 1;
        sum += (qq.score != null ? qq.score : 0) * w;
        max += 10 * w;
      }
      const finalScore = Math.round((sum / max) * 100);
      const summary = `Candidate completed interview with score ${finalScore}. See per-question feedback.`;
      dispatch(setFinalSummary({ id: candidate.id, finalScore, summary }));
      setModalVisible(true);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Interview — {candidate.name || 'Unnamed Candidate'}</Title>

      {missing.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Paragraph type="warning">We need some info before starting: {missing.join(', ')}</Paragraph>
          {missing.map((m) => (
            <div key={m} style={{ marginBottom: 8 }}>
              <Input placeholder={`Enter ${m}`} onBlur={(e) => handleFillMissing(m, e.target.value)} />
            </div>
          ))}
          <Button type="primary" onClick={handleStart}>Start Interview</Button>
        </div>
      )}

      {questions.length > 0 && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <strong>Progress:</strong> Question {currentIndex+1}/{questions.length} — {q?.difficulty}
            <div style={{ width: 300, marginTop: 8 }}>
              <Progress percent={Math.round(((currentIndex+1) / questions.length)*100)} />
            </div>
          </div>

          <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ marginBottom: 8 }}><strong>Q{currentIndex+1}:</strong> {q?.text}</div>
            <div style={{ marginBottom: 8 }}>
              <small>Time left: {remaining}s</small>
            </div>
            <TextArea rows={4} value={inputVal} onChange={(e)=>setInputVal(e.target.value)} placeholder="Write your answer here..." />
            <div style={{ marginTop: 8 }}>
              <Button type="primary" onClick={handleSubmit}>Submit Answer</Button>
            </div>
          </div>

          <div>
            <Title level={5}>Previous Qs</Title>
            {questions.map((qq, idx) => (
              <div key={qq.id} style={{ borderBottom: '1px dashed #ddd', padding: 8 }}>
                <div><strong>Q{idx+1}</strong> ({qq.difficulty}): {qq.text}</div>
                <div><em>Answer:</em> {qq.answer || <i>Not answered</i>}</div>
                <div><em>Score:</em> {qq.score != null ? qq.score : '-' } &nbsp; <em>Feedback:</em> {qq.feedback || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modalVisible} onOk={() => setModalVisible(false)} onCancel={() => setModalVisible(false)}>
        <Title level={4}>Interview completed</Title>
        <Paragraph>The interview has completed. You can switch to the Interviewer dashboard to see candidate summary and scores.</Paragraph>
      </Modal>
    </div>
  );
}
