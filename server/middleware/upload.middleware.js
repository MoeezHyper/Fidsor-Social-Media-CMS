import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `social-${uniqueSuffix}${ext}`);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const extname = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = ['.jpg', '.jpeg', '.png'].includes(extname);

  if (allowedMimeTypes.includes(file.mimetype) && isAllowedExt) {
    return cb(null, true);
  }

  const error = new Error('Invalid file format. Only JPG, JPEG, and PNG images are supported.');
  error.code = 'INVALID_FILE_TYPE';
  return cb(error, false);
};

// Multer upload middleware instance (Max 8MB file size limit)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 MB
  }
});

export const handleImageUpload = (req, res, next) => {
  const singleUpload = upload.single('image');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size exceeds maximum limit of 8MB.',
          code: 'FILE_TOO_LARGE'
        });
      }
      return res.status(400).json({
        error: `Upload error: ${err.message}`,
        code: err.code
      });
    } else if (err) {
      return res.status(400).json({
        error: err.message || 'Error uploading file',
        code: err.code || 'UPLOAD_ERROR'
      });
    }

    next();
  });
};
