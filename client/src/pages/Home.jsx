import React, { useState, useCallback, useEffect } from 'react';
import FileGrid from '../components/FileGrid.jsx';
import FileList from '../components/FileList.jsx';
import { deleteFile, fetchFiles, renameFile, uploadFile } from '../service/api';
import { Upload, Search, Filter, Grid, List } from 'lucide-react';
import FileUpload from '../components/FileUpload.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SharedFilePreview from '../components/SharedFilePreview';

function Home() {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  // Load files from server on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fetchFiles();
      
      if (response && response.status === 200) {
        setFiles(response.data || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (newFiles) => {
    try {
      const uploadedFiles = [];
      
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await uploadFile(formData);
        
        if (response && response.status === 200) {
          const uploadedFile = response.data;
          // Defensive: ensure all properties exist
          uploadedFiles.push({
            _id: uploadedFile._id || Date.now().toString(),
            name: uploadedFile.name || file.name,
            path: uploadedFile.path || '',
            size: file.size,
            type: file.type || 'application/octet-stream',
            uploadDate: new Date().toISOString(),
            shareLink: uploadedFile.path || ''
          });
        } else {
          console.error('Upload failed:', response?.data?.message || 'Unknown error');
        }
      }
      
      if (uploadedFiles.length > 0) {
        setFiles(prev => {
          const newFiles = [...prev, ...uploadedFiles];
          console.log('Files after upload:', newFiles);
          return newFiles;
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }, []);

  const handleFileDelete = useCallback(async (fileId) => {
    try {
      const response = await deleteFile(fileId);
      
      if (response && response.status === 200) {
        setFiles(prev => prev.filter(file => file._id !== fileId));
      } else {
        console.error('Delete failed:', response?.data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, []);

  const handleFileRename = useCallback(async (fileId, newName) => {
    try {
      const response = await renameFile(fileId, newName);
      
      if (response && response.status === 200) {
        setFiles(prev => prev.map(file => 
          file._id === fileId ? { ...file, name: newName } : file
        ));
      } else {
        console.error('Rename failed:', response?.data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  }, []);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type.startsWith(filterType);
    return matchesSearch && matchesFilter;
  });

  const getFileTypeCount = (type) => {
    if (type === 'all') return files.length;
    return files.filter(file => file.type.startsWith(type)).length;
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Air Fetch</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Files ({getFileTypeCount('all')})</option>
              <option value="image">Images ({getFileTypeCount('image')})</option>
              <option value="video">Videos ({getFileTypeCount('video')})</option>
              <option value="audio">Audio ({getFileTypeCount('audio')})</option>
              <option value="text">Documents ({getFileTypeCount('text')})</option>
              <option value="application">Applications ({getFileTypeCount('application')})</option>
            </select>
          </div>
        </div>

        {/* File Display */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
            </h3>
            <p className="text-gray-500">
              {files.length === 0 
                ? 'Drag and drop files or click to upload' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <FileGrid 
                files={filteredFiles}
                onFileDelete={handleFileDelete}
                onFileRename={handleFileRename}
              />
            ) : (
              <FileList 
                files={filteredFiles}
                onFileDelete={handleFileDelete}
                onFileRename={handleFileRename}
              />
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}

export default Home;