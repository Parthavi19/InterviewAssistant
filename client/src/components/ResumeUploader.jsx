import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { addCandidate } from '../slices/candidatesSlice';
import { extractBasicFields } from '../utils/resumeParser';

const { Dragger } = Upload;

export default function ResumeUploader() {
  const dispatch = useDispatch();

  const handleUpload = async (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      message.error('Unsupported file type. Please upload PDF or DOCX.');
      return false;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:4000/upload-resume', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error');
      }

      const data = await res.json();
      if (!data.text) throw new Error('No text extracted from resume');

      const basicFields = extractBasicFields(data.text);
      if (!basicFields.name && !basicFields.email && !basicFields.phone) {
        throw new Error('No valid fields extracted from resume');
      }

      dispatch(addCandidate({ id: Date.now(), ...basicFields, resumeText: data.text }));
      message.success('Resume parsed and candidate added!');
    } catch (err) {
      console.error('Upload error:', err);
      message.error(err.message || 'Failed to parse resume.');
    }

    return false; // prevent default Upload behavior
  };

  return (
    <Dragger
      name="file"
      multiple={false}
      beforeUpload={handleUpload}
      showUploadList={false}
    >
      <p className="ant-upload-drag-icon"><InboxOutlined /></p>
      <p className="ant-upload-text">Click or drag PDF/DOCX to upload resume</p>
    </Dragger>
  );
}
