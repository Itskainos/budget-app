// Script to reset all user passwords via Supabase Admin API
import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  { username: 'Jimmy',   password: 'Jimmy123' },
  { username: 'Minttuk', password: 'Minttuk123' },
  { username: 'Dorje',   password: 'Dorje123' },
  { username: 'Dali',    password: 'Dali123' },
];

async function run() {
  for (const user of users) {
    const email = `${user.username.toLowerCase()}@budget.com`;

    // Get user from Supabase Auth by email
    const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) { console.error('List error:', listErr); continue; }

    const authUser = listData.users.find(u => u.email === email);

    if (authUser) {
      // Update password
      const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
        password: user.password,
        email_confirm: true,
      });
      if (error) {
        console.error(`❌ Failed to update ${user.username}:`, error.message);
      } else {
        // Also ensure the public.User row exists with this id
        await pool.query(
          `INSERT INTO "User" (id, email, name, "createdAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT (email) DO UPDATE SET id = $1, name = $3`,
          [authUser.id, email, user.username]
        );
        console.log(`✅ ${user.username} — password set, public.User synced (id: ${authUser.id})`);
      }
    } else {
      // Create user in Supabase Auth
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: user.password,
        email_confirm: true,
      });
      if (createErr) {
        console.error(`❌ Failed to create ${user.username}:`, createErr.message);
      } else {
        await pool.query(
          `INSERT INTO "User" (id, email, name, "createdAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT (email) DO UPDATE SET id = $1, name = $3`,
          [created.user.id, email, user.username]
        );
        console.log(`✅ ${user.username} — created, public.User synced (id: ${created.user.id})`);
      }
    }
  }

  await pool.end();
  console.log('\nDone! All users can now log in with their passwords.');
}

run().catch(console.error);
