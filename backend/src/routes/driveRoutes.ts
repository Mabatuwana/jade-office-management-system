import { Router } from 'express';
import {
  uploadDocument,
  uploadAvatar,
  listFiles,
  downloadFile,
  deleteFile,
  getDriveStatus,
} from '../controllers/driveController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { uploadSingle, uploadAvatar as uploadAvatarMiddleware } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.post('/upload', uploadSingle, uploadDocument);
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar);
router.get('/files', listFiles);
router.get('/download/:fileId', downloadFile);
router.delete('/:fileId', deleteFile);
router.get('/status', getDriveStatus);

export default router;
