import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Input, Modal, Button } from 'antd';

export default function Interviewer() {
  const candidates = useSelector(state => state.candidates);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const rows = candidates.allIds
    .map((id) => candidates.byId[id])
    .filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()) || (c.email||'').includes(query));

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Score', dataIndex: 'finalScore', key: 'finalScore', render: (s) => s == null ? '-' : s }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <Input placeholder="Search by name or email" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ width: 300 }} />
      </div>
      <Table dataSource={rows} columns={columns} rowKey="id" onRow={(rec)=>({ onClick: ()=>setSelected(rec) })} />
      <Modal visible={!!selected} onCancel={()=>setSelected(null)} footer={<Button onClick={()=>setSelected(null)}>Close</Button>} width={800}>
        {selected && (
          <div>
            <h3>{selected.name} — {selected.email}</h3>
            <p><strong>Phone:</strong> {selected.phone}</p>
            <p><strong>Final Score:</strong> {selected.finalScore ?? 'N/A'}</p>
            <p><strong>Summary:</strong> {selected.summary ?? 'N/A'}</p>
            <hr/>
            <h4>Transcript</h4>
            {selected.questions.map((q, idx) => (
              <div key={q.id} style={{ marginBottom: 12 }}>
                <div><strong>Q{idx+1} — {q.difficulty}</strong>: {q.text}</div>
                <div><em>Answer:</em> {q.answer ?? '-'}</div>
                <div><em>Score:</em> {q.score ?? '-'}</div>
                <div><em>Feedback:</em> {q.feedback ?? '-'}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

