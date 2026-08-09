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
