import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// In-memory fallback users for local demo mode if Supabase is not configured
let localUsers = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    username: 'admin',
    role: 'admin',
    can_publish_facebook: true,
    can_publish_instagram: true,
    created_at: new Date().toISOString()
  }
];

/**
 * GET /api/users - List all users with platform permissions (Admin only)
 */
export const getUsers = async (req, res) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(200).json({ users: localUsers });
    }

    const { data: profiles, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user profiles:', error);
      return res.status(500).json({ error: 'Database Error', message: error.message });
    }

    return res.status(200).json({ users: profiles });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: 'Internal Error', message: err.message });
  }
};

/**
 * POST /api/users - Create a new user with username & password (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    const { username, password, can_publish_facebook = true, can_publish_instagram = true } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Username is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters long.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const userEmail = `${cleanUsername}@fidsor.cms`;

    if (!isSupabaseConfigured) {
      const existing = localUsers.find(u => u.username === cleanUsername);
      if (existing) {
        return res.status(400).json({ error: 'User Conflict', message: `User '${cleanUsername}' already exists.` });
      }

      const newUser = {
        id: `${Date.now()}-mock-id`,
        username: cleanUsername,
        role: 'user',
        can_publish_facebook: Boolean(can_publish_facebook),
        can_publish_instagram: Boolean(can_publish_instagram),
        created_at: new Date().toISOString()
      };
      localUsers.push(newUser);
      return res.status(201).json({ message: 'User created successfully', user: newUser });
    }

    // 1. Create User in Supabase Auth via Admin Service Role API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        role: 'user',
        can_publish_facebook,
        can_publish_instagram
      }
    });

    if (authError) {
      return res.status(400).json({
        error: 'Failed to create user',
        message: authError.message
      });
    }

    const newUserId = authData.user.id;

    // 2. Insert into user_profiles table
    const { data: profileData, error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: newUserId,
        username: cleanUsername,
        role: 'user',
        can_publish_facebook: Boolean(can_publish_facebook),
        can_publish_instagram: Boolean(can_publish_instagram)
      })
      .select()
      .single();

    if (profileErr) {
      console.warn('Profile creation warning:', profileErr.message);
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: profileData || {
        id: newUserId,
        username: cleanUsername,
        role: 'user',
        can_publish_facebook,
        can_publish_instagram
      }
    });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ error: 'Internal Error', message: err.message });
  }
};

/**
 * PATCH /api/users/:id/permissions - Toggle Facebook or Instagram posting rights (Admin only)
 */
export const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { can_publish_facebook, can_publish_instagram } = req.body;

    if (!isSupabaseConfigured) {
      const u = localUsers.find(user => user.id === id);
      if (!u) {
        return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      }
      if (typeof can_publish_facebook === 'boolean') u.can_publish_facebook = can_publish_facebook;
      if (typeof can_publish_instagram === 'boolean') u.can_publish_instagram = can_publish_instagram;
      return res.status(200).json({ message: 'Permissions updated', user: u });
    }

    const updates = {};
    if (typeof can_publish_facebook === 'boolean') updates.can_publish_facebook = can_publish_facebook;
    if (typeof can_publish_instagram === 'boolean') updates.can_publish_instagram = can_publish_instagram;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Database Error', message: error.message });
    }

    return res.status(200).json({ message: 'Permissions updated successfully', user: data });
  } catch (err) {
    console.error('updateUserPermissions error:', err);
    return res.status(500).json({ error: 'Internal Error', message: err.message });
  }
};

/**
 * DELETE /api/users/:id - Delete a user (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured) {
      localUsers = localUsers.filter(u => u.id !== id);
      return res.status(200).json({ message: 'User deleted successfully' });
    }

    // Delete from Supabase Auth (CASCADE deletes profile entry)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) {
      return res.status(500).json({ error: 'Deletion Error', message: error.message });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: 'Internal Error', message: err.message });
  }
};
