import React, { useState } from 'react';
import { Download, Share2, Trash2, Edit2, Eye, File, Image, Video, Music, FileText, Check } from 'lucide-react';
import { API_BASE_URL } from '../service/config';
import { getShareLink } from '../service/api';

const FileList = ({ files, onFileDelete, onFileRename }) => {
  console.log('FileList files:', files);
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/files/${file._id}/download`;
    link.download = file.name;
    link.click();
  };

  const handleShare = async (file) => {
    try {
      const link = `${window.location.origin}/shared/${file._id}`;
      await navigator.clipboard.writeText(link);
      setCopiedLink(file._id);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handlePreview = (file) => {
    window.open(`${API_BASE_URL}/files/${file._id}/preview`, '_blank');
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

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Name</th>
              <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm hidden sm:table-cell">Size</th>
              <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm hidden lg:table-cell">Modified</th>
              <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file._id}
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              >
                <td className="p-2 sm:p-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-blue-400 flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    {editingFile === file._id ? (
                      <div className="flex space-x-1 sm:space-x-2 flex-1 min-w-0">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-gray-700 text-white text-xs sm:text-sm rounded px-1.5 sm:px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="px-1.5 sm:px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex-shrink-0"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <span className="text-white text-xs sm:text-sm truncate block">{file.name}</span>
                        <span className="text-gray-400 text-xs sm:hidden">{formatFileSize(file.size)}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm hidden sm:table-cell">
                  {formatFileSize(file.size)}
                </td>
                <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm hidden lg:table-cell">
                  {formatDate(file.uploadDate)}
                </td>
                <td className="p-2 sm:p-4">
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handlePreview(file)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleShare(file)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Share Preview Link"
                    >
                      {copiedLink === file._id ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      ) : (
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(file)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onFileDelete(file._id)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;