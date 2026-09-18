import multer from 'multer';

// Use memory storage so we can directly pipe the file buffer to Google Drive API
const storage = multer.memoryStorage();

// Max file size: 25MB
const limits = {
  fileSize: 25 * 1024 * 1024,
};

export const uploadSingle = multer({
  storage,
  limits,
}).single('file');

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for avatar
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed for profile pictures.'));
    }
  },
}).single('avatar');
