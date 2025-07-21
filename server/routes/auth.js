import express from 'express';
import { register, login, checkAuth } from '../controller/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/check', protect, checkAuth);

export default router; 