import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import ResumeUploader from './components/ResumeUploader';
import Interviewee from './components/Interviewee';
import Interviewer from './components/Interviewer';
import { useSelector } from 'react-redux';

const { Header, Content } = Layout;

export default function App() {
  const [tab, setTab] = useState('interviewee');

  // candidates is an array from your slice
  const candidates = useSelector((s) => s.candidates);
  const firstCandidateId = candidates.allIds[0];  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>Swipe — AI Interview</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[tab]}
          onClick={(e) => setTab(e.key)}
          items={[
            { key: 'interviewee', label: 'Interviewee' },
            { key: 'interviewer', label: 'Interviewer' },
          ]}
        />
      </Header>

      <Content style={{ padding: 24 }}>
        {tab === 'interviewee' && (
          <div>
            <ResumeUploader />
            <div style={{ marginTop: 24 }}>
              <h3>Candidate Details</h3>
              {firstCandidate ? (
                <Interviewee candidate={firstCandidate} />
              ) : (
                <p>No candidate yet. Upload a resume to see details.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'interviewer' && <Interviewer />}
      </Content>
    </Layout>
  );
}
