import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../service/config';

const SharedFilePreview = () => {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState('');

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

  const fileType = file?.type || file?.fileType || '';
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const isPDF = fileType === 'application/pdf';
  const isText = fileType.startsWith('text/') || fileType === 'application/octet-stream';
  const isCode = isText && (
    fileType.endsWith('+xml') || fileType.endsWith('+json') || fileType.endsWith('+javascript') ||
    fileType.endsWith('+typescript') || fileType.endsWith('+python') || fileType.endsWith('+java') ||
    fileType.endsWith('+c') || fileType.endsWith('+cpp') || fileType.endsWith('+cs') || fileType.endsWith('+php') ||
    fileType.endsWith('+rb') || fileType.endsWith('+go') || fileType.endsWith('+rs') || fileType.endsWith('+swift') ||
    fileType.endsWith('+kt') || fileType.endsWith('+sql') || fileType.endsWith('+sh') || fileType.endsWith('+bash') ||
    fileType.endsWith('+md') || fileType.endsWith('+txt') || fileType.endsWith('+pdf')
  );

  useEffect(() => {
    if (file && (isText || isCode)) {
      fetch(`${API_BASE_URL}/files/${file._id}/preview`)
        .then(res => res.text())
        .then(setFileContent)
        .catch(() => setFileContent('Failed to load content'));
    }
  }, [file, isText, isCode]);

  if (loading) return <div className="text-center text-gray-400 p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-400 p-8">{error}</div>;
  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-0 m-0 z-50">
      <div className="w-full flex flex-col items-center justify-center h-full">
        <h2 className="text-white text-2xl font-bold mb-4 mt-8">Shared File: {file.name}</h2>
        <div className="flex-1 w-full h-full flex items-center justify-center">
          {isImage && (
            <img src={`${API_BASE_URL}/files/${file._id}/preview`} alt={file.name} className="w-auto h-auto max-w-full max-h-[80vh] rounded shadow-lg" />
          )}
          {isVideo && (
            <video src={`${API_BASE_URL}/files/${file._id}/preview`} controls className="w-auto h-auto max-w-full max-h-[80vh] rounded shadow-lg" />
          )}
          {isAudio && (
            <audio src={`${API_BASE_URL}/files/${file._id}/preview`} controls className="mx-auto w-full" />
          )}
          {isPDF && (
            <iframe src={`${API_BASE_URL}/files/${file._id}/preview`} className="w-full h-[80vh] bg-white rounded shadow-lg" title="PDF preview" />
          )}
          {isCode && (
            <iframe src={`${API_BASE_URL}/files/${file._id}/preview`} className="w-full h-[80vh] bg-white rounded shadow-lg" title="Code preview" />
          )}
          {isText && !isCode && (
            <div className="w-full h-[80vh] flex items-center justify-center">
              <pre className="whitespace-pre overflow-auto break-words w-full h-full p-6 bg-gray-900 rounded border border-gray-700 text-left text-base text-gray-200 shadow-inner">
                {fileContent}
              </pre>
            </div>
          )}
          {!isImage && !isVideo && !isAudio && !isPDF && !isCode && !isText && (
            <div className="text-gray-300 mb-4">Preview not available for this file type.</div>
          )}
        </div>
        <a
          href={`${API_BASE_URL}/files/${file._id}/download`}
          className="inline-block mt-8 mb-8 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-lg font-semibold shadow-lg"
          download={file.name}
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default SharedFilePreview; 