import express from 'express';
import { uploadImage, getImage, previewFile, getShareLink, listFiles, deleteFile, renameFile } from '../controller/image-controller.js';
import {upload} from '../utils/upload.js';

const router = express.Router();
router.post("/upload", upload.single('file'), uploadImage);
router.get("/files", listFiles);
router.get("/files/:fileId/download", getImage); // Changed from /file/:fileId to /files/:fileId/download
router.get("/files/:fileId/preview", previewFile); // Changed from /preview/:fileId to /files/:fileId/preview
router.get("/share/:fileId", getShareLink);
router.delete("/files/:fileId", deleteFile); // Added DELETE route
router.put("/files/:fileId", renameFile); // Added PUT route
export default router;