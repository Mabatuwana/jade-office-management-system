import { Router } from 'express';
import { login, getMe, changePassword, updateTheme } from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.post('/change-password', authenticateJWT, changePassword);
router.patch('/theme', authenticateJWT, updateTheme);

export default router;
