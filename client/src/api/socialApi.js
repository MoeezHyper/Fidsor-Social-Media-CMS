import axios from 'axios';

/**
 * Publishes image and caption to selected social media platforms
 * @param {Object} params
 * @param {File} params.imageFile
 * @param {string} params.caption
 * @param {Array<string>} params.platforms
 * @returns {Promise<Object>} API response object { results: Array }
 */
export const publishSocialPost = async ({ imageFile, caption, platforms }, token) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('caption', caption);
  formData.append('platforms', JSON.stringify(platforms));

  try {
    const response = await axios.post('/api/social/publish', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || 'Network error occurred while publishing social post.');
  }
};

/**
 * Fetches basic account information for connected Facebook Page and Instagram Business accounts
 * @param {string} token - Auth Token
 * @param {boolean} [forceRefresh=false] - Bypass backend cache if true
 * @returns {Promise<Object>}
 */
export const fetchAccountInfo = async (token, forceRefresh = false) => {
  try {
    const response = await axios.get('/api/social/account-info', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { forceRefresh }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || 'Failed to fetch social account information.');
  }
};

/**
 * Fetches aggregated social media analytics summary and platform breakdown
 * @param {string} token - Auth Token
 * @param {boolean} [forceRefresh=false] - Bypass backend cache if true
 * @returns {Promise<Object>}
 */
export const fetchSocialAnalytics = async (token, forceRefresh = false) => {
  try {
    const response = await axios.get('/api/social/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { forceRefresh }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || 'Failed to fetch social media analytics.');
  }
};

/**
 * Fetches recent normalized published posts across Facebook and Instagram
 * @param {string} token - Auth Token
 * @param {boolean} [forceRefresh=false] - Bypass backend cache if true
 * @returns {Promise<Object>}
 */
export const fetchSocialPosts = async (token, forceRefresh = false) => {
  try {
    const response = await axios.get('/api/social/posts', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { forceRefresh }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || 'Failed to fetch published social posts.');
  }
};

