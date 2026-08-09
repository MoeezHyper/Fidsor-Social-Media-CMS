import { Router } from 'express';
import { handleImageUpload } from '../middleware/upload.middleware.js';
import { validatePublishRequest } from '../middleware/validation.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  publishSocialPost,
  getAccountInfo,
  getSocialAnalytics,
  getSocialPosts
} from '../controllers/social.controller.js';

const router = Router();

// POST /api/social/publish
router.post('/publish', requireAuth, handleImageUpload, validatePublishRequest, publishSocialPost);

// GET /api/social/account-info
router.get('/account-info', requireAuth, getAccountInfo);

// GET /api/social/analytics
router.get('/analytics', requireAuth, getSocialAnalytics);

// GET /api/social/posts
router.get('/posts', requireAuth, getSocialPosts);

export default router;

