import File from '../models/file.js';

const uploadImage = async(req,res)=>{
    //console.log(req); // logs the requested file data filename,path etc
    const fileobj = {
        path:req.file.path,
        name:req.file.originalname
    }
    try {
        const file = await File.create(fileobj)
        res.status(200).json({
            _id: file._id,
            path: `http://localhost:8000/files/${file._id}/download`, // Updated path to match new route
            name: file.name
        });
    } catch (error) {
        console.error("Error in uploadImage function",error);
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
const getImage = async(req,res)=>{
    try {                            //fileId becuase in the routes file we have used fileId as a parameter
        //const {fileId} = req.params; // destructuring equivalent to req.params.fileId
        const file = await File.findById(req.params.fileId); //can also be written as File.findOne({req.params.fileId})
        file.downloadCount++;
        await file.save();
        res.download(file.path,file.name);// express function to download the file in response
    } catch (error) {
        console.error("Error in getImage function",error); //basically handles the download error
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

const previewFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        // Set appropriate headers for preview
        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
        res.sendFile(file.path, { root: '.' });
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
        const files = await File.find({}, '_id name path createdAt');
        const filesWithDetails = files.map(file => ({
            _id: file._id,
            name: file.name,
            size: 0, // You might want to get actual file size from fs.stat
            type: 'application/octet-stream', // You might want to determine this from file extension
            uploadDate: file.createdAt,
            shareLink: `http://localhost:8000/files/${file._id}/download`
        }));
        res.status(200).json(filesWithDetails);
    } catch (error) {
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

export { uploadImage, getImage, previewFile, getShareLink, listFiles, deleteFile, renameFile };