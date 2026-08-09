import { Router } from 'express';
import { handleImageUpload } from '../middleware/upload.middleware.js';
import { validatePublishRequest } from '../middleware/validation.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { publishSocialPost } from '../controllers/social.controller.js';

const router = Router();

// POST /api/social/publish
router.post('/publish', requireAuth, handleImageUpload, validatePublishRequest, publishSocialPost);

export default router;
