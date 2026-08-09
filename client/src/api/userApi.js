import axios from 'axios';

/**
 * Get all users (Admin only)
 */
export const fetchUsers = async (token) => {
  try {
    const res = await axios.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || new Error('Failed to fetch users');
  }
};

/**
 * Create a new user with Username and Password (Admin only)
 */
export const createUserApi = async ({ username, password, can_publish_facebook, can_publish_instagram }, token) => {
  try {
    const res = await axios.post(
      '/api/users',
      { username, password, can_publish_facebook, can_publish_instagram },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || new Error('Failed to create user');
  }
};

/**
 * Toggle platform permissions for a user (Admin only)
 */
export const updateUserPermissionsApi = async (userId, { can_publish_facebook, can_publish_instagram }, token) => {
  try {
    const res = await axios.patch(
      `/api/users/${userId}/permissions`,
      { can_publish_facebook, can_publish_instagram },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || new Error('Failed to update permissions');
  }
};

/**
 * Delete a user (Admin only)
 */
export const deleteUserApi = async (userId, token) => {
  try {
    const res = await axios.delete(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || new Error('Failed to delete user');
  }
};
