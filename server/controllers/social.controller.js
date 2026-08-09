import { publishToFacebook, publishToInstagram } from '../services/metaGraph.service.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const publishSocialPost = async (req, res) => {
  try {
    const { caption = '', normalizedPlatforms = [] } = req.body;
    const file = req.file;
    const user = req.user;

    if (!file) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'No image file uploaded.'
      });
    }

    // Enforce user platform permissions
    const permissionErrors = [];
    if (normalizedPlatforms.includes('facebook') && user?.can_publish_facebook === false) {
      permissionErrors.push('Your account does not have permission to publish to Facebook Pages.');
    }
    if (normalizedPlatforms.includes('instagram') && user?.can_publish_instagram === false) {
      permissionErrors.push('Your account does not have permission to publish to Instagram Business accounts.');
    }

    if (permissionErrors.length > 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: permissionErrors.join(' ')
      });
    }

    // Determine host server base URL for static image access
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${serverUrl}/uploads/${file.filename}`;
    const imagePath = file.path;

    // Prepare platform execution tasks
    const publishTasks = normalizedPlatforms.map(platform => {
      if (platform === 'facebook') {
        return publishToFacebook({ imagePath, imageUrl, caption });
      } else if (platform === 'instagram') {
        return publishToInstagram({ imageUrl, caption });
      } else {
        return Promise.resolve({
          platform,
          success: false,
          message: `Unsupported platform: ${platform}`
        });
      }
    });

    // Execute concurrently and collect results per platform
    const taskResults = await Promise.allSettled(publishTasks);

    const formattedResults = taskResults.map((resItem, index) => {
      const platformName = normalizedPlatforms[index];
      if (resItem.status === 'fulfilled') {
        return resItem.value;
      } else {
        return {
          platform: platformName,
          success: false,
          message: resItem.reason?.message || 'An unexpected error occurred during publishing.'
        };
      }
    });

    // Log published post entry to Supabase database if configured
    if (isSupabaseConfigured && user) {
      try {
        await supabaseAdmin.from('published_posts').insert({
          user_id: user.id && user.id.length === 36 ? user.id : null,
          username: user.username || 'admin',
          caption,
          image_url: imageUrl,
          platforms: normalizedPlatforms,
          results: formattedResults
        });
      } catch (dbErr) {
        console.warn('Post history DB logging warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      results: formattedResults
    });
  } catch (error) {
    console.error('Error in publishSocialPost controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to process social media publish request.'
    });
  }
};
