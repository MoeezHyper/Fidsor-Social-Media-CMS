import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder_anon_key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_service_role_key';

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL &&
  !process.env.SUPABASE_URL.includes('your-supabase-project') &&
  process.env.SUPABASE_ANON_KEY &&
  !process.env.SUPABASE_ANON_KEY.includes('your_supabase')
);

if (!isSupabaseConfigured) {
  console.warn('⚠️  Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not fully configured in server/.env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Ensures default Admin user (admin / Admin123!) is seeded directly in Supabase DB
 */
export const seedDefaultAdminUser = async () => {
  if (!isSupabaseConfigured) return;

  try {
    const adminEmail = 'admin@fidsor.cms';
    const adminPass = 'Admin123!';

    // Check if admin user exists in Supabase Auth
    const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();

    if (listErr) {
      console.warn('Warning checking Supabase users:', listErr.message);
      return;
    }

    let existingAdmin = users?.find(u => u.email === adminEmail);

    if (!existingAdmin) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPass,
        email_confirm: true,
        user_metadata: {
          username: 'admin',
          role: 'admin',
          can_publish_facebook: true,
          can_publish_instagram: true
        }
      });

      if (createErr) {
        console.error('Failed to seed admin user in Supabase Auth:', createErr.message);
        return;
      }
      existingAdmin = created.user;
      console.log('🔑 Successfully seeded default Admin account in Supabase DB (admin / Admin123!)');
    }

    if (existingAdmin) {
      // Upsert profile in user_profiles table
      await supabaseAdmin.from('user_profiles').upsert({
        id: existingAdmin.id,
        username: 'admin',
        role: 'admin',
        can_publish_facebook: true,
        can_publish_instagram: true
      });
    }
  } catch (err) {
    console.error('Error seeding default admin:', err);
  }
};
