import express from 'express';
import { uploadFile, getImage, previewFile, getShareLink, listFiles, deleteFile, renameFile } from '../controller/image-controller.js';
import { upload } from '../utils/upload.js';
import protect from '../middleware/authMiddleware.js';

const file = express.Router();
file.post("/upload", protect, upload.single('file'), uploadFile);
file.get("/files", protect, listFiles);
file.get("/files/:fileId/download", getImage);
file.get("/files/:fileId/preview", previewFile);
file.get("/share/:fileId", getShareLink);
file.delete("/files/:fileId", protect, deleteFile);
file.put("/files/:fileId", protect, renameFile);

export default file;