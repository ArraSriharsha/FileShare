import React, { useState, useEffect } from 'react';
import { Download, Share2, Trash2, Edit2, Eye, File, Image, Video, Music, FileText, Copy, Check, X } from 'lucide-react';

// CodePreview component for better code file handling
const CodePreview = ({ file }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/files/${file._id}/preview`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch file content');
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error fetching file content:', err);
        setError('Failed to load file content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [file._id]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-medium">{file.name}</h4>
          <span className="text-gray-400 text-sm">{file.type}</span>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-medium">{file.name}</h4>
          <span className="text-gray-400 text-sm">{file.type}</span>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-medium">{file.name}</h4>
        <span className="text-gray-400 text-sm">{file.type}</span>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 h-[70vh] overflow-auto">
        <pre className="text-white font-mono text-sm whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    </div>
  );
};

const FileGrid = ({ files, onFileDelete, onFileRename }) => {
  console.log('FileGrid files:', files);
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (type.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (type.startsWith('text/') || type.includes('document')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000/files/${file._id}/download`;
    link.download = file.name;
    link.click();
  };

  const handleShare = async (file) => {
    try {
      await navigator.clipboard.writeText(file.shareLink);
      setCopiedLink(file._id);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  const handleEdit = (file) => {
    setEditingFile(file._id);
    setEditName(file.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onFileRename(editingFile, editName.trim());
    }
    setEditingFile(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setEditName('');
  };

  const renderPreview = (file) => {
    // Image files - show actual thumbnail
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
          <img
            src={`http://localhost:8000/files/${file._id}/preview`}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ display: 'none' }}>
            <Image className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      );
    }
    
    // Video files - show video thumbnail with play button
    if (file.type.startsWith('video/')) {
      return (
        <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden group">
          <video
            src={`http://localhost:8000/files/${file._id}/preview`}
            className="w-full h-full object-cover"
            muted
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ display: 'none' }}>
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      );
    }
    
    // Audio files - show waveform or audio icon
    if (file.type.startsWith('audio/')) {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Music className="w-8 h-8 text-white mb-2" />
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/60 rounded-full animate-pulse"
                  style={{ height: `${Math.random() * 20 + 10}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // PDF files - show PDF icon with document preview
    if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-white mb-2" />
            <div className="text-white text-xs font-medium">PDF</div>
          </div>
        </div>
      );
    }
    
    // Document files (Word, Excel, PowerPoint)
    if (file.type.includes('document') || file.type.includes('spreadsheet') || file.type.includes('presentation')) {
      const getDocIcon = () => {
        if (file.type.includes('word')) return 'DOC';
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'XLS';
        if (file.type.includes('powerpoint') || file.type.includes('presentation')) return 'PPT';
        return 'DOC';
      };
      
      return (
        <div className="w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-white mb-2" />
            <div className="text-white text-xs font-medium">{getDocIcon()}</div>
          </div>
        </div>
      );
    }
    
    // Archive files (ZIP, RAR, etc.)
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar') || file.type.includes('7z')) {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <File className="w-8 h-8 text-white mb-2" />
            <div className="text-white text-xs font-medium">ZIP</div>
          </div>
        </div>
      );
    }
    
    // Code files - check this BEFORE text files
    if (file.type.includes('javascript') || file.type.includes('python') || file.type.includes('java') || 
        file.type.includes('cpp') || file.type.includes('csharp') || file.type.includes('php') ||
        file.name.endsWith('.js') || file.name.endsWith('.py') || file.name.endsWith('.java') ||
        file.name.endsWith('.cpp') || file.name.endsWith('.cs') || file.name.endsWith('.php') ||
        file.name.endsWith('.ts') || file.name.endsWith('.jsx') || file.name.endsWith('.tsx') ||
        file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.scss') ||
        file.name.endsWith('.json') || file.name.endsWith('.xml') || file.name.endsWith('.sql') ||
        file.name.endsWith('.sh') || file.name.endsWith('.bash') || file.name.endsWith('.md')) {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <File className="w-8 h-8 text-white mb-2" />
            <div className="text-white text-xs font-medium">CODE</div>
          </div>
        </div>
      );
    }
    
    // Text files - show text preview (but NOT code files)
    if (file.type.startsWith('text/')) {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-white mb-2" />
            <div className="text-white text-xs font-medium">TEXT</div>
          </div>
        </div>
      );
    }
    
    // Default file icon
    return (
      <div className="w-full h-32 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <File className="w-8 h-8 text-gray-300 mb-2" />
          <div className="text-gray-300 text-xs font-medium">
            {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {files.map((file) => (
          <div
            key={file._id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10"
          >
            {/* File Preview */}
            <div className="mb-4 relative">
              {renderPreview(file)}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg" />
            </div>

            {/* File Info */}
            <div className="space-y-2">
              {editingFile === file._id ? (
                <div className="flex space-x-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <h3 className="font-medium text-white text-sm truncate">{file.name}</h3>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.uploadDate)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreview(file)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare(file)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Share"
                >
                  {copiedLink === file._id ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(file)}
                  className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                  title="Rename"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onFileDelete(file._id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-6xl max-h-[95vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-white font-medium text-lg">{previewFile.name}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(95vh-140px)] overflow-auto">
              {/* Image Preview */}
              {previewFile.type.startsWith('image/') && (
                <img
                  src={`http://localhost:8000/files/${previewFile._id}/preview`}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              )}
              
              {/* Video Preview */}
              {previewFile.type.startsWith('video/') && (
                <video
                  src={`http://localhost:8000/files/${previewFile._id}/preview`}
                  controls
                  className="max-w-full max-h-full mx-auto"
                  autoPlay={false}
                />
              )}
              
              {/* Audio Preview */}
              {previewFile.type.startsWith('audio/') && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Music className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-4">{previewFile.name}</h4>
                  <audio
                    src={`http://localhost:8000/files/${previewFile._id}/preview`}
                    controls
                    className="mx-auto"
                  />
                </div>
              )}
              
              {/* PDF Preview */}
              {previewFile.type === 'application/pdf' && (
                <div className="w-full h-[70vh]">
                  <iframe
                    src={`http://localhost:8000/files/${previewFile._id}/preview`}
                    className="w-full h-full bg-white rounded"
                    title="PDF preview"
                  />
                </div>
              )}
              
              {/* Document Preview (Word, Excel, PowerPoint) */}
              {(previewFile.type.includes('document') || previewFile.type.includes('spreadsheet') || previewFile.type.includes('presentation')) && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-2">{previewFile.name}</h4>
                  <p className="text-gray-400 mb-4">Document preview not available</p>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download to View
                  </button>
                </div>
              )}
              
              {/* Archive Preview */}
              {(previewFile.type.includes('zip') || previewFile.type.includes('rar') || previewFile.type.includes('tar') || previewFile.type.includes('7z')) && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <File className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-2">{previewFile.name}</h4>
                  <p className="text-gray-400 mb-4">Archive preview not available</p>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download to Extract
                  </button>
                </div>
              )}
              
              {/* Code Preview - check this BEFORE text preview */}
              {(previewFile.type.includes('javascript') || previewFile.type.includes('python') || previewFile.type.includes('java') || 
                previewFile.type.includes('cpp') || previewFile.type.includes('csharp') || previewFile.type.includes('php') ||
                previewFile.name.endsWith('.js') || previewFile.name.endsWith('.py') || previewFile.name.endsWith('.java') ||
                previewFile.name.endsWith('.cpp') || previewFile.name.endsWith('.cs') || previewFile.name.endsWith('.php') ||
                previewFile.name.endsWith('.ts') || previewFile.name.endsWith('.jsx') || previewFile.name.endsWith('.tsx') ||
                previewFile.name.endsWith('.html') || previewFile.name.endsWith('.css') || previewFile.name.endsWith('.scss') ||
                previewFile.name.endsWith('.json') || previewFile.name.endsWith('.xml') || previewFile.name.endsWith('.sql') ||
                previewFile.name.endsWith('.sh') || previewFile.name.endsWith('.bash') || previewFile.name.endsWith('.md')) && (
                <CodePreview file={previewFile} />
              )}
              
              {/* Text Preview - but NOT code files */}
              {previewFile.type.startsWith('text/') && 
               !previewFile.name.endsWith('.js') && !previewFile.name.endsWith('.py') && !previewFile.name.endsWith('.java') &&
               !previewFile.name.endsWith('.cpp') && !previewFile.name.endsWith('.cs') && !previewFile.name.endsWith('.php') &&
               !previewFile.name.endsWith('.ts') && !previewFile.name.endsWith('.jsx') && !previewFile.name.endsWith('.tsx') &&
               !previewFile.name.endsWith('.html') && !previewFile.name.endsWith('.css') && !previewFile.name.endsWith('.scss') &&
               !previewFile.name.endsWith('.json') && !previewFile.name.endsWith('.xml') && !previewFile.name.endsWith('.sql') &&
               !previewFile.name.endsWith('.sh') && !previewFile.name.endsWith('.bash') && !previewFile.name.endsWith('.md') && (
                <CodePreview file={previewFile} />
              )}
              
              {/* Default Preview */}
              {!previewFile.type.startsWith('image/') && !previewFile.type.startsWith('video/') && !previewFile.type.startsWith('audio/') && 
               previewFile.type !== 'application/pdf' && !previewFile.type.startsWith('text/') && 
               !previewFile.type.includes('document') && !previewFile.type.includes('spreadsheet') && !previewFile.type.includes('presentation') &&
               !previewFile.type.includes('zip') && !previewFile.type.includes('rar') && !previewFile.type.includes('tar') && !previewFile.type.includes('7z') &&
               !previewFile.type.includes('javascript') && !previewFile.type.includes('python') && !previewFile.type.includes('java') && 
               !previewFile.type.includes('cpp') && !previewFile.type.includes('csharp') && !previewFile.type.includes('php') &&
               !previewFile.name.endsWith('.js') && !previewFile.name.endsWith('.py') && !previewFile.name.endsWith('.java') &&
               !previewFile.name.endsWith('.cpp') && !previewFile.name.endsWith('.cs') && !previewFile.name.endsWith('.php') && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <File className="w-16 h-16 text-gray-300" />
                  </div>
                  <h4 className="text-white font-medium mb-2">{previewFile.name}</h4>
                  <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileGrid;