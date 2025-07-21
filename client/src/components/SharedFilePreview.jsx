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
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-2 sm:p-4 m-0 z-50">
      <div className="w-full flex flex-col items-center justify-center h-full max-w-6xl">
        <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 mt-4 sm:mt-8 px-4 text-center break-words">
          Shared File: {file.name}
        </h2>
        <div className="flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4">
          {isImage && (
            <img 
              src={`${API_BASE_URL}/files/${file._id}/preview`} 
              alt={file.name} 
              className="w-auto h-auto max-w-full max-h-[60vh] sm:max-h-[70vh] md:max-h-[80vh] rounded shadow-lg object-contain" 
            />
          )}
          {isVideo && (
            <video 
              src={`${API_BASE_URL}/files/${file._id}/preview`} 
              controls 
              preload="metadata"
              className="w-auto h-auto max-w-full max-h-[60vh] sm:max-h-[70vh] md:max-h-[80vh] rounded shadow-lg" 
              onError={(e) => console.error('Video error:', e)}
              onLoadStart={() => console.log('Video loading started')}
              onCanPlay={() => console.log('Video can play')}
            />
          )}
          {isAudio && (
            <audio 
              src={`${API_BASE_URL}/files/${file._id}/preview`} 
              controls 
              className="mx-auto w-full max-w-md sm:max-w-lg" 
            />
          )}
          {isPDF && (
            <iframe 
              src={`${API_BASE_URL}/files/${file._id}/preview`} 
              className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] bg-white rounded shadow-lg" 
              title="PDF preview" 
            />
          )}
          {isCode && (
            <iframe 
              src={`${API_BASE_URL}/files/${file._id}/preview`} 
              className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] bg-white rounded shadow-lg" 
              title="Code preview" 
            />
          )}
          {isText && !isCode && (
            <div className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center">
              <pre className="whitespace-pre overflow-auto break-words w-full h-full p-3 sm:p-4 md:p-6 bg-gray-900 rounded border border-gray-700 text-left text-xs sm:text-sm md:text-base text-gray-200 shadow-inner">
                {fileContent}
              </pre>
            </div>
          )}
          {!isImage && !isVideo && !isAudio && !isPDF && !isCode && !isText && (
            <div className="text-gray-300 mb-4 text-center px-4">Preview not available for this file type.</div>
          )}
        </div>
        <a
          href={`${API_BASE_URL}/files/${file._id}/download`}
          className="inline-block mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm sm:text-base md:text-lg font-semibold shadow-lg"
          download={file.name}
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default SharedFilePreview; 