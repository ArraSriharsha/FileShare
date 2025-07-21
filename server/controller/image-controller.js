import File from '../models/file.js';

const uploadFile = async(req,res)=>{
    try {
        // Check if file exists in request
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Get user ID from the authenticated request
        const userId = req.userId || 'default-user-id'; // Fallback for testing

        const fileobj = {
            userId: userId,
            fileId: req.file.filename,
            name: req.file.originalname,
            fileLink: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadDate: new Date(),
            previewLink: null
        }
        
        const file = await File.create(fileobj);
        res.status(200).json({
            _id: file._id,
            path: `http://localhost:8000/files/${file._id}/download`,
            name: file.name
        });
    } catch (error) {
        console.error("Error in uploadFile function", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
const getImage = async(req,res)=>{
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        
        // Increment download count if the field exists
        if (file.downloadCount !== undefined) {
            file.downloadCount++;
            await file.save();
        }
        
        res.download(file.fileLink, file.name);
    } catch (error) {
        console.error("Error in getImage function", error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

const previewFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        
        // Set appropriate headers for preview based on file type
        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
        
        // Set content type based on file extension for better preview
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        // Map file extensions to content types for better preview
        const contentTypeMap = {
            'py': 'text/plain',
            'js': 'text/javascript',
            'ts': 'text/typescript',
            'jsx': 'text/javascript',
            'tsx': 'text/typescript',
            'html': 'text/html',
            'css': 'text/css',
            'scss': 'text/css',
            'json': 'application/json',
            'xml': 'text/xml',
            'sql': 'text/plain',
            'sh': 'text/plain',
            'bash': 'text/plain',
            'md': 'text/markdown',
            'txt': 'text/plain',
            'java': 'text/plain',
            'cpp': 'text/plain',
            'c': 'text/plain',
            'cs': 'text/plain',
            'php': 'text/plain',
            'rb': 'text/plain',
            'go': 'text/plain',
            'rs': 'text/plain',
            'swift': 'text/plain',
            'kt': 'text/plain'
        };
        
        // Set content type if we have a mapping for this extension
        if (fileExtension && contentTypeMap[fileExtension]) {
            res.setHeader('Content-Type', contentTypeMap[fileExtension]);
        } else {
            // Use the original mimetype if no specific mapping
            res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
        }
        
        res.sendFile(file.fileLink, { root: '.' });
    } catch (error) {
        console.error('Error in previewFile function', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getShareLink = async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        const shareLink = `http://localhost:8000/files/${file._id}/download`;
        res.status(200).json({ shareLink });
    } catch (error) {
        console.error('Error in getShareLink function', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const listFiles = async (req, res) => {
    try {
        const userId = req.userId;
        const files = await File.find({ userId: userId });
        const filesWithDetails = files.map(file => ({
            _id: file._id,
            name: file.name,
            size: file.fileSize || 0,
            type: file.fileType || 'application/octet-stream',
            uploadDate: file.uploadDate,
            fileLink: file.fileLink,
            previewLink: file.previewLink
        }));
        res.status(200).json(filesWithDetails);
    } catch (error) {
        console.error('Error in listFiles function', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        
        // Delete the file from storage (you might want to add fs.unlink here)
        await File.findByIdAndDelete(req.params.fileId);
        
        res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error in deleteFile function', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const renameFile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        
        file.name = name.trim();
        await file.save();
        
        res.status(200).json({ success: true, file });
    } catch (error) {
        console.error('Error in renameFile function', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { uploadFile, getImage, previewFile, getShareLink, listFiles, deleteFile, renameFile };