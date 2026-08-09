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

// Simple In-Memory Cache for Account Info, Analytics, and Posts
const cache = {
  accountInfo: { data: null, timestamp: 0 },
  analytics: { data: null, timestamp: 0 },
  posts: { data: null, timestamp: 0 }
};
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache TTL

/**
 * Fetch Facebook Page Account Details
 */
export const getFacebookAccountInfo = async () => {
  const pageId = process.env.META_PAGE_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || pageId.includes('your_') || !accessToken || accessToken.includes('your_')) {
    return {
      connected: false,
      platform: 'facebook',
      error: 'META_PAGE_ID or META_PAGE_ACCESS_TOKEN is missing or not configured in environment.'
    };
  }

  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/${pageId}`, {
      params: {
        fields: 'id,name,username,picture{url},followers_count,fan_count',
        access_token: accessToken
      }
    });

    const data = response.data;
    return {
      connected: true,
      platform: 'facebook',
      id: data.id || pageId,
      name: data.name || 'Facebook Page',
      username: data.username || data.name?.toLowerCase().replace(/\s+/g, '') || 'facebook_page',
      picture: data.picture?.data?.url || null,
      followersCount: data.followers_count ?? data.fan_count ?? 0,
      fanCount: data.fan_count ?? data.followers_count ?? 0
    };
  } catch (error) {
    return {
      connected: false,
      platform: 'facebook',
      error: formatMetaError(error, 'Failed to fetch Facebook Page profile information.')
    };
  }
};

/**
 * Fetch Instagram Business Account Details
 */
export const getInstagramAccountInfo = async () => {
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!igAccountId || igAccountId.includes('your_') || !accessToken || accessToken.includes('your_')) {
    return {
      connected: false,
      platform: 'instagram',
      error: 'INSTAGRAM_BUSINESS_ACCOUNT_ID or META_PAGE_ACCESS_TOKEN is missing or not configured in environment.'
    };
  }

  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/${igAccountId}`, {
      params: {
        fields: 'id,name,username,profile_picture_url,followers_count,media_count',
        access_token: accessToken
      }
    });

    const data = response.data;
    return {
      connected: true,
      platform: 'instagram',
      id: data.id || igAccountId,
      name: data.name || 'Instagram Business',
      username: data.username || 'instagram_account',
      profilePictureUrl: data.profile_picture_url || null,
      followersCount: data.followers_count ?? 0,
      mediaCount: data.media_count ?? 0
    };
  } catch (error) {
    return {
      connected: false,
      platform: 'instagram',
      error: formatMetaError(error, 'Failed to fetch Instagram Business profile information.')
    };
  }
};

/**
 * Fetch Recent Facebook Page Published Posts
 */
export const getFacebookPosts = async () => {
  const pageId = process.env.META_PAGE_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || pageId.includes('your_') || !accessToken || accessToken.includes('your_')) {
    return {
      connected: false,
      posts: [],
      totalCount: 0,
      error: 'META_PAGE_ID or META_PAGE_ACCESS_TOKEN missing in environment.'
    };
  }

  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/${pageId}/published_posts`, {
      params: {
        fields: 'id,message,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true)',
        access_token: accessToken
      }
    });

    const items = response.data.data || [];
    const totalCount = items.length;

    const posts = items.map(post => ({
      id: post.id,
      platform: 'facebook',
      caption: post.message || '',
      imageUrl: post.full_picture || null,
      permalink: post.permalink_url || `https://facebook.com/${post.id}`,
      timestamp: post.created_time || new Date().toISOString(),
      likeCount: post.likes?.summary?.total_count || 0,
      commentCount: post.comments?.summary?.total_count || 0
    }));

    return {
      connected: true,
      posts,
      totalCount
    };
  } catch (error) {
    return {
      connected: false,
      posts: [],
      totalCount: 0,
      error: formatMetaError(error, 'Failed to fetch Facebook published posts.')
    };
  }
};

/**
 * Fetch Recent Instagram Business Media Posts
 */
export const getInstagramPosts = async () => {
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!igAccountId || igAccountId.includes('your_') || !accessToken || accessToken.includes('your_')) {
    return {
      connected: false,
      posts: [],
      totalCount: 0,
      error: 'INSTAGRAM_BUSINESS_ACCOUNT_ID or META_PAGE_ACCESS_TOKEN missing in environment.'
    };
  }

  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/${igAccountId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
        access_token: accessToken
      }
    });

    const items = response.data.data || [];

    const posts = items.map(item => ({
      id: item.id,
      platform: 'instagram',
      caption: item.caption || '',
      imageUrl: item.media_url || null,
      mediaType: item.media_type || 'IMAGE',
      permalink: item.permalink || `https://instagram.com/p/${item.id}`,
      timestamp: item.timestamp || new Date().toISOString(),
      likeCount: item.like_count || 0,
      commentCount: item.comments_count || 0
    }));

    return {
      connected: true,
      posts,
      totalCount: posts.length
    };
  } catch (error) {
    return {
      connected: false,
      posts: [],
      totalCount: 0,
      error: formatMetaError(error, 'Failed to fetch Instagram media.')
    };
  }
};

/**
 * Get Account Info for Facebook and Instagram (with caching)
 */
export const getAccountInfo = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && cache.accountInfo.data && (Date.now() - cache.accountInfo.timestamp < CACHE_TTL_MS)) {
    return cache.accountInfo.data;
  }

  const [facebook, instagram] = await Promise.all([
    getFacebookAccountInfo(),
    getInstagramAccountInfo()
  ]);

  const result = {
    facebook,
    instagram,
    fetchedAt: new Date().toISOString()
  };

  cache.accountInfo = { data: result, timestamp: Date.now() };
  return result;
};

/**
 * Aggregate Analytics across Facebook & Instagram (with caching)
 */
export const getSocialAnalytics = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && cache.analytics.data && (Date.now() - cache.analytics.timestamp < CACHE_TTL_MS)) {
    return cache.analytics.data;
  }

  const [fbAccount, igAccount, fbPosts, igPosts] = await Promise.all([
    getFacebookAccountInfo(),
    getInstagramAccountInfo(),
    getFacebookPosts(),
    getInstagramPosts()
  ]);

  const fbTotalPosts = fbPosts.connected ? (fbPosts.totalCount || fbPosts.posts.length) : 0;
  const igTotalPosts = igAccount.connected ? (igAccount.mediaCount || igPosts.totalCount || igPosts.posts.length) : (igPosts.totalCount || 0);

  const fbFollowers = fbAccount.connected ? (fbAccount.followersCount || fbAccount.fanCount || 0) : 0;
  const igFollowers = igAccount.connected ? (igAccount.followersCount || 0) : 0;

  const result = {
    summary: {
      totalPosts: fbTotalPosts + igTotalPosts,
      totalFollowers: fbFollowers + igFollowers,
      connectedPlatformsCount: (fbAccount.connected ? 1 : 0) + (igAccount.connected ? 1 : 0)
    },
    platforms: {
      facebook: {
        connected: fbAccount.connected,
        totalPosts: fbTotalPosts,
        followersCount: fbFollowers,
        fanCount: fbAccount.fanCount || 0,
        name: fbAccount.name || 'Facebook Page',
        error: fbAccount.error || fbPosts.error || null
      },
      instagram: {
        connected: igAccount.connected,
        totalMedia: igTotalPosts,
        followersCount: igFollowers,
        mediaCount: igAccount.mediaCount || igTotalPosts,
        name: igAccount.name || 'Instagram Business',
        error: igAccount.error || igPosts.error || null
      }
    },
    fetchedAt: new Date().toISOString()
  };

  cache.analytics = { data: result, timestamp: Date.now() };
  return result;
};

/**
 * Fetch and Normalize Published Posts across platforms ordered by timestamp descending (with caching)
 */
export const getSocialPosts = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && cache.posts.data && (Date.now() - cache.posts.timestamp < CACHE_TTL_MS)) {
    return cache.posts.data;
  }

  const [fbPosts, igPosts] = await Promise.all([
    getFacebookPosts(),
    getInstagramPosts()
  ]);

  const combinedPosts = [...(fbPosts.posts || []), ...(igPosts.posts || [])];
  
  // Sort by timestamp descending (newest first)
  combinedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const result = {
    posts: combinedPosts,
    summary: {
      total: combinedPosts.length,
      facebookCount: (fbPosts.posts || []).length,
      instagramCount: (igPosts.posts || []).length
    },
    platforms: {
      facebook: {
        connected: fbPosts.connected,
        count: (fbPosts.posts || []).length,
        error: fbPosts.error || null
      },
      instagram: {
        connected: igPosts.connected,
        count: (igPosts.posts || []).length,
        error: igPosts.error || null
      }
    },
    fetchedAt: new Date().toISOString()
  };

  cache.posts = { data: result, timestamp: Date.now() };
  return result;
};

