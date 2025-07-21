import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../service/config';

const SharedFilePreview = () => {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/files/${fileId}`);
        const file = await res.json();
        setFile(file);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [fileId]);

  if (loading) return <div className="text-center text-gray-400 p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-400 p-8">{error}</div>;
  if (!file) return null;

  const fileType = file.type || file.fileType || '';
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const isPDF = fileType === 'application/pdf';
  const isText = fileType.startsWith('text/');
  const isCode = fileType.startsWith('text/') && fileType.endsWith('+xml') || fileType.endsWith('+json') || fileType.endsWith('+javascript') || fileType.endsWith('+typescript') || fileType.endsWith('+python') || fileType.endsWith('+java') || fileType.endsWith('+c') || fileType.endsWith('+cpp') || fileType.endsWith('+cs') || fileType.endsWith('+php') || fileType.endsWith('+rb') || fileType.endsWith('+go') || fileType.endsWith('+rs') || fileType.endsWith('+swift') || fileType.endsWith('+kt') || fileType.endsWith('+sql') || fileType.endsWith('+sh') || fileType.endsWith('+bash') || fileType.endsWith('+md') || fileType.endsWith('+txt') || fileType.endsWith('+pdf');

  return (
    <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-6 mt-10 text-center">
      <h2 className="text-white text-lg font-bold mb-4">Shared File: {file.name}</h2>
      {isImage && (
        <img src={`${API_BASE_URL}/files/${file._id}/preview`} alt={file.name} className="mx-auto max-w-full max-h-96 rounded" />
      )}
      {isVideo && (
        <video src={`${API_BASE_URL}/files/${file._id}/preview`} controls className="mx-auto max-w-full max-h-96 rounded" />
      )}
      {isAudio && (
        <audio src={`${API_BASE_URL}/files/${file._id}/preview`} controls className="mx-auto w-full" />
      )}
      {isPDF && (
        <iframe src={`${API_BASE_URL}/files/${file._id}/preview`} className="w-full h-96 bg-white rounded" title="PDF preview" />
      )}
      {isCode && (
        <iframe src={`${API_BASE_URL}/files/${file._id}/preview`} className="w-full h-96 bg-white rounded" title="Code preview" />
      )}
      {isText && (
        <div className="text-gray-300 mb-4">
          <pre className="whitespace-pre-wrap break-words">{file.content}</pre>
        </div>
      )}
      {!isImage && !isVideo && !isAudio && !isPDF && !isCode && !isText && (
        <div className="text-gray-300 mb-4">Preview not available for this file type.</div>
      )}
      <a
        href={`${API_BASE_URL}/files/${file._id}/download`}
        className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        download={file.name}
      >
        Download
      </a>
    </div>
  );
};

export default SharedFilePreview; 