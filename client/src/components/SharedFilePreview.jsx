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
        const res = await fetch(`${API_BASE_URL}/files`);
        const files = await res.json();
        const found = files.find(f => f._id === fileId);
        if (!found) throw new Error('File not found');
        setFile(found);
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

  const isImage = file.type && file.type.startsWith('image/');
  const isVideo = file.type && file.type.startsWith('video/');
  const isAudio = file.type && file.type.startsWith('audio/');
  const isPDF = file.type === 'application/pdf';

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
      {!isImage && !isVideo && !isAudio && !isPDF && (
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