import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

/**
 * Authentication Middleware validating Supabase JWT access token
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If Supabase is not configured yet, allow fallback admin for local demo
    if (!isSupabaseConfigured) {
      req.user = {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'admin',
        role: 'admin',
        can_publish_facebook: true,
        can_publish_instagram: true
      };
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token.'
      });
    }

    // Fetch user profile permissions from user_profiles table
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const username = profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'user';
    const role = profile?.role || user.user_metadata?.role || (username === 'admin' ? 'admin' : 'user');
    const can_publish_facebook = profile?.can_publish_facebook ?? true;
    const can_publish_instagram = profile?.can_publish_instagram ?? true;

    req.user = {
      id: user.id,
      email: user.email,
      username,
      role,
      can_publish_facebook,
      can_publish_instagram
    };

    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Failed to authenticate user.'
    });
  }
};

/**
 * Middleware requiring Admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. Administrator privileges required.'
    });
  }
  next();
};
