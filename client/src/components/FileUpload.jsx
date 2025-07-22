import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Image, Video, Music, FileText } from 'lucide-react';

const FileUpload = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.startsWith('text/') || type.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = (file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      }, 200);
    });
  };

  const handleFiles = useCallback(async (files) => {
    console.log('handleFiles called with:', files);
    const fileArray = Array.from(files);
    // Check for files over 50MB
    const largeFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE);
    if (largeFiles.length > 0) {
      alert(`File(s) over 50MB detected: ${largeFiles.map(f => f.name).join(', ')}. Please select files under 50MB.`);
      return;
    }
    setUploadingFiles(fileArray);

    // Simulate upload progress for each file
    for (const file of fileArray) {
      await simulateUpload(file);
    }

    try {
      await onFileUpload(fileArray);
    } finally {
      setUploadingFiles([]);
      setUploadProgress({});
      console.log('Upload process completed');
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e) => {
    console.log('File input change event:', e);
    const files = e.target.files;
    console.log('Selected files:', files);
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeUploadingFile = (fileName) => {
    setUploadingFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Upload Area */}
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'contents' }}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-105'
              : 'border-gray-600 hover:border-blue-400 hover:bg-blue-500/5'
          }`}
        >
          <div className="space-y-3 sm:space-y-4">
            <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-blue-500' : 'bg-gray-700'
            }`}>
              <Upload className={`w-6 h-6 sm:w-8 sm:h-8 ${isDragging ? 'text-white' : 'text-blue-400'}`} />
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-white mb-2">
                {isDragging ? 'Drop your files here' : 'Upload your files'}
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-xs text-red-400 mb-2">Maximum file size : 50MB per file</p>
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                <span>Supports:</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-xs">Images</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-xs">Videos</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-xs">Documents</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-xs">Audio</span>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </form>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-medium text-gray-400">Uploading files...</h4>
          {uploadingFiles.map((file) => (
            <div key={file.name} className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {getFileIcon(file.type)}
                  <span className="text-xs sm:text-sm text-white truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">({formatFileSize(file.size)})</span>
                </div>
                <button
                  onClick={() => removeUploadingFile(file.name)}
                  className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress[file.name] || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;