import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const API_VERSION = 'v19.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

/**
 * Format Meta API Error response into clean error message string
 */
const formatMetaError = (error, defaultMsg = 'Meta API Error') => {
  if (error.response && error.response.data && error.response.data.error) {
    const metaErr = error.response.data.error;
    let message = metaErr.message || defaultMsg;
    if (metaErr.error_user_msg) {
      message += ` (${metaErr.error_user_msg})`;
    }
    if (metaErr.code) {
      if (metaErr.code === 190) {
        return `Invalid or expired Access Token. Please refresh META_PAGE_ACCESS_TOKEN.`;
      }
      return `${message} (Code: ${metaErr.code})`;
    }
    return message;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMsg;
};

/**
 * Publish photo to Facebook Page
 */
export const publishToFacebook = async ({ imagePath, imageUrl, caption }) => {
  const pageId = process.env.META_PAGE_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || pageId.includes('your_') || !accessToken || accessToken.includes('your_')) {
    return {
      platform: 'facebook',
      success: false,
      message: 'Invalid configuration: META_PAGE_ID or META_PAGE_ACCESS_TOKEN is missing in server environment.'
    };
  }

  try {
    const endpoint = `${GRAPH_BASE_URL}/${pageId}/photos`;
    let response;

    // Prefer file upload via stream if local file path is available
    if (imagePath && fs.existsSync(imagePath)) {
      const formData = new FormData();
      formData.append('source', fs.createReadStream(imagePath));
      formData.append('caption', caption || '');
      formData.append('access_token', accessToken);

      response = await axios.post(endpoint, formData, {
        headers: formData.getHeaders()
      });
    } else if (imageUrl) {
      response = await axios.post(endpoint, null, {
        params: {
          url: imageUrl,
          caption: caption || '',
          access_token: accessToken
        }
      });
    } else {
      throw new Error('No valid image file or URL provided for Facebook publishing.');
    }

    if (response.data && (response.data.id || response.data.post_id)) {
      return {
        platform: 'facebook',
        success: true,
        postId: response.data.post_id || response.data.id,
        id: response.data.id
      };
    }

    throw new Error('Unexpected response format from Facebook Graph API');
  } catch (error) {
    const errorMessage = formatMetaError(error, 'Failed to publish photo to Facebook Page.');
    return {
      platform: 'facebook',
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Helper to poll Instagram container status until READY or ERROR
 */
const checkContainerStatus = async (containerId, accessToken, maxRetries = 10, delayMs = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await axios.get(`${GRAPH_BASE_URL}/${containerId}`, {
        params: {
          fields: 'status_code,status',
          access_token: accessToken
        }
      });

      const statusCode = res.data?.status_code;
      if (statusCode === 'FINISHED') {
        return true;
      }
      if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
        throw new Error(`Media container creation failed with status: ${statusCode}`);
      }
    } catch (err) {
      if (i === maxRetries - 1) throw err;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return true;
};

/**
 * Publish photo to Instagram Business Account (Two-step publishing flow)
 */
export const publishToInstagram = async ({ imageUrl, caption }) => {
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!igAccountId || igAccountId.includes('your_') || !accessToken || accessToken.includes('your_')) {
    return {
      platform: 'instagram',
      success: false,
      message: 'Invalid configuration: INSTAGRAM_BUSINESS_ACCOUNT_ID or META_PAGE_ACCESS_TOKEN is missing in server environment.'
    };
  }

  if (!imageUrl) {
    return {
      platform: 'instagram',
      success: false,
      message: 'Instagram Graph API requires a publicly accessible HTTP/HTTPS image URL.'
    };
  }

  try {
    // Step 1: Create Media Container
    const createContainerEndpoint = `${GRAPH_BASE_URL}/${igAccountId}/media`;
    const containerRes = await axios.post(createContainerEndpoint, null, {
      params: {
        image_url: imageUrl,
        caption: caption || '',
        access_token: accessToken
      }
    });

    const containerId = containerRes.data?.id;
    if (!containerId) {
      throw new Error('Failed to obtain Instagram media container ID.');
    }

    // Optional status check
    await checkContainerStatus(containerId, accessToken);

    // Step 2: Publish Media Container
    const publishContainerEndpoint = `${GRAPH_BASE_URL}/${igAccountId}/media_publish`;
    const publishRes = await axios.post(publishContainerEndpoint, null, {
      params: {
        creation_id: containerId,
        access_token: accessToken
      }
    });

    const mediaId = publishRes.data?.id;
    if (mediaId) {
      return {
        platform: 'instagram',
        success: true,
        mediaId: mediaId,
        id: mediaId
      };
    }

    throw new Error('Unexpected response format when publishing Instagram media container.');
  } catch (error) {
    const errorMessage = formatMetaError(error, 'Failed to publish photo to Instagram Business.');
    return {
      platform: 'instagram',
      success: false,
      message: errorMessage
    };
  }
};
