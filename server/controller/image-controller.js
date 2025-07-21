import File from '../models/file.js';
import { s3, uploadToR2 } from '../utils/upload.js';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();
import stream from 'stream';

const uploadFile = async(req,res)=>{
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const userId = req.userId || 'default-user-id';
        // Upload to R2
        const { key, url } = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype, userId);
        const fileobj = {
            userId: userId,
            fileId: key,
            name: req.file.originalname,
            fileLink: url,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadDate: new Date(),
            previewLink: null
        };
        const file = await File.create(fileobj);
        res.status(200).json({
            _id: file._id,
            path: url,
            name: file.name
        });
    } catch (error) {
        console.error("Error in uploadFile function", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

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
        // Fetch file from R2
        const key = file.fileId;
        const s3Response = await s3.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: key,
        }));
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
        if (s3Response.Body instanceof stream.Readable) {
            return s3Response.Body.pipe(res);
        } else {
            let data = Buffer.from([]);
            for await (const chunk of s3Response.Body) {
                data = Buffer.concat([data, chunk]);
            }
            return res.end(data);
        }
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
        // R2 key
        const key = file.fileId;
        // Get file from R2
        const s3Response = await s3.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: key,
        }));
        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
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
            'kt': 'text/plain',
            'pdf': 'application/pdf',
        };
        if ((file.fileType && file.fileType.startsWith('text/')) || contentTypeMap[fileExtension]) {
            res.setHeader('Content-Type', contentTypeMap[fileExtension] || file.fileType || 'text/plain');
            let data = '';
            for await (const chunk of s3Response.Body) {
                data += chunk.toString();
            }
            return res.send(data);
        } else {
            res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
            if (s3Response.Body instanceof stream.Readable) {
                return s3Response.Body.pipe(res);
            } else {
                let data = Buffer.from([]);
                for await (const chunk of s3Response.Body) {
                    data = Buffer.concat([data, chunk]);
                }
                return res.end(data);
            }
        }
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
        // Delete from R2
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: file.fileId,
        }));
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