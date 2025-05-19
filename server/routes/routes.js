import express from 'express';
import { uploadImage, getImage } from '../controller/image-controller.js';
import {upload} from '../utils/upload.js';

const router = express.Router();
router.post("/upload", upload.single('file'), uploadImage);
router.get("/file/:fileId", getImage); // 'http://localhost:8000/file/682b9741c8db76ee38c7eecf' sample path returned by the uploadImage function.when the use clicks the link he must get routed
export {router};