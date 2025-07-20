import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Search, Filter, Grid, List } from 'lucide-react';
import FileUpload from './components/FileUpload';
import FileGrid from './components/FileGrid';
import FileList from './components/FileList';
import SearchBar from './components/SearchBar';
import Auth from './components/Auth';

function App() {
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
      console.log('Testing server connectivity...');
      const response = await fetch('http://localhost:8000/files');
      console.log('Server response status:', response.status);
      const fileData = await response.json();
      console.log('Files loaded:', fileData);
      setFiles(fileData);
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
        
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
          redirect: 'manual'
        });
        
        if (response.ok) {
          let uploadedFile;
          try {
            uploadedFile = await response.json();
          } catch (jsonError) {
            uploadedFile = {};
          }
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
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
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
      const response = await fetch(`http://localhost:8000/files/${fileId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setFiles(prev => prev.filter(file => file._id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, []);

  const handleFileRename = useCallback(async (fileId, newName) => {
    try {
      const response = await fetch(`http://localhost:8000/files/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });
      
      if (response.ok) {
        setFiles(prev => prev.map(file => 
          file._id === fileId ? { ...file, name: newName } : file
        ));
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
    <Auth />
    </>
    // <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
    //   {/* Header */}
    //   <header className="bg-black/50 backdrop-blur-md border-b border-blue-500/20">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="flex items-center justify-between h-16">
    //         <div className="flex items-center space-x-3">
    //           <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
    //           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-download-icon lucide-cloud-download"><path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/></svg>
    //           </div>
    //           <h1 className="text-2xl font-bold text-white">Air Fetch</h1>
    //         </div>
            
    //         <div className="flex items-center space-x-4">
    //           <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
    //             <button
    //               onClick={() => setViewMode('grid')}
    //               className={`p-2 rounded-md transition-colors ${
    //                 viewMode === 'grid' 
    //                   ? 'bg-blue-500 text-white' 
    //                   : 'text-gray-400 hover:text-white'
    //               }`}
    //             >
    //               <Grid className="w-5 h-5" />
    //             </button>
    //             <button
    //               onClick={() => setViewMode('list')}
    //               className={`p-2 rounded-md transition-colors ${
    //                 viewMode === 'list' 
    //                   ? 'bg-blue-500 text-white' 
    //                   : 'text-gray-400 hover:text-white'
    //               }`}
    //             >
    //               <List className="w-5 h-5" />
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </header>

    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    //     {/* Upload Section */}
    //     <div className="mb-8">
    //       <FileUpload onFileUpload={handleFileUpload} />
    //     </div>

    //     {/* Search and Filter */}
    //     <div className="mb-8 flex flex-col lg:flex-row gap-4">
    //       <div className="flex-1">
    //         <SearchBar 
    //           searchTerm={searchTerm}
    //           onSearchChange={setSearchTerm}
    //         />
    //       </div>
          
    //       <div className="flex items-center space-x-2">
    //         <Filter className="w-5 h-5 text-gray-400" />
    //         <select
    //           value={filterType}
    //           onChange={(e) => setFilterType(e.target.value)}
    //           className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    //         >
    //           <option value="all">All Files ({getFileTypeCount('all')})</option>
    //           <option value="image">Images ({getFileTypeCount('image')})</option>
    //           <option value="video">Videos ({getFileTypeCount('video')})</option>
    //           <option value="audio">Audio ({getFileTypeCount('audio')})</option>
    //           <option value="text">Documents ({getFileTypeCount('text')})</option>
    //           <option value="application">Applications ({getFileTypeCount('application')})</option>
    //         </select>
    //       </div>
    //     </div>

    //     {/* File Display */}
    //     {loading ? (
    //       <div className="text-center py-16">
    //         <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    //         <p className="text-gray-400 mt-4">Loading files...</p>
    //       </div>
    //     ) : filteredFiles.length === 0 ? (
    //       <div className="text-center py-16">
    //         <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
    //         <h3 className="text-xl font-medium text-gray-400 mb-2">
    //           {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
    //         </h3>
    //         <p className="text-gray-500">
    //           {files.length === 0 
    //             ? 'Drag and drop files or click to upload' 
    //             : 'Try adjusting your search or filter criteria'
    //           }
    //         </p>
    //       </div>
    //     ) : (
    //       <>
    //         {viewMode === 'grid' ? (
    //           <FileGrid 
    //             files={filteredFiles}
    //             onFileDelete={handleFileDelete}
    //             onFileRename={handleFileRename}
    //           />
    //         ) : (
    //           <FileList 
    //             files={filteredFiles}
    //             onFileDelete={handleFileDelete}
    //             onFileRename={handleFileRename}
    //           />
    //         )}
    //       </>
    //     )}
    //   </div>
    // </div>
  );
}

export default App;