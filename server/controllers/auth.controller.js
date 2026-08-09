import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

/**
 * POST /api/auth/login - Authenticate user via Supabase Auth on Express backend
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Username and password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const email = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@fidsor.cms`;

    if (!isSupabaseConfigured) {
      return res.status(500).json({ error: 'Server Error', message: 'Supabase credentials are not configured in server/.env' });
    }

    // 1. Attempt Sign In with Supabase Auth
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // 2. If admin account is missing in Supabase Auth, attempt auto-creation
    if (error && cleanUsername === 'admin') {
      const { data: signUpData, error: signUpErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username: 'admin',
          role: 'admin',
          can_publish_facebook: true,
          can_publish_instagram: true
        }
      });

      if (!signUpErr && signUpData.user) {
        // Upsert admin profile in user_profiles
        await supabaseAdmin.from('user_profiles').upsert({
          id: signUpData.user.id,
          username: 'admin',
          role: 'admin',
          can_publish_facebook: true,
          can_publish_instagram: true
        });

        // Retry sign in
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    }

    if (error) {
      return res.status(401).json({ error: 'Unauthorized', message: error.message || 'Invalid username or password.' });
    }

    const user = data.user;
    const session = data.session;

    // 3. Fetch custom profile from user_profiles table
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const userProfile = {
      id: user.id,
      email: user.email,
      username: profile?.username || user.user_metadata?.username || cleanUsername,
      role: profile?.role || user.user_metadata?.role || (cleanUsername === 'admin' ? 'admin' : 'user'),
      can_publish_facebook: profile?.can_publish_facebook ?? true,
      can_publish_instagram: profile?.can_publish_instagram ?? true
    };

    return res.status(200).json({
      token: session.access_token,
      user: userProfile
    });
  } catch (err) {
    console.error('Error in loginUser controller:', err);
    return res.status(500).json({ error: 'Internal Error', message: err.message });
  }
};

/**
 * GET /api/auth/me - Validate token and return active user profile
 */
export const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};
