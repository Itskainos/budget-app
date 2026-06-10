import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

const users = [
  { username: 'Jimmy', password: 'Jimmy123' },
  { username: 'Minttuk', password: 'Minttuk123' },
  { username: 'Dorje', password: 'Dorje123' },
  { username: 'Dali', password: 'Dali123' }
];

async function setup() {
  console.log("Setting up users...");
  for (const user of users) {
    const email = `${user.username}@budget.local`;
    console.log(`Signing up ${email}...`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: user.password
    });
    
    if (error) {
      console.error(`Error signing up ${user.username}:`, error.message);
    } else {
      console.log(`Successfully signed up ${user.username}`);
      
      if (data.user) {
        // Insert into public.User
        await supabase.from('User').upsert({
          id: data.user.id,
          email: data.user.email || email,
          name: user.username
        });
      }
    }
  }

  console.log("\\n=== IMPORTANT ===");
  console.log("If you cannot log in with these accounts, it means 'Confirm Email' is enabled in your Supabase project.");
  console.log("To fix this, go to your Supabase Dashboard -> SQL Editor and run this query:");
  console.log("UPDATE auth.users SET email_confirmed_at = now();");
}

setup();
