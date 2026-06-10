import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log("Testing login for fake@fake.com");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'fake@fake.com',
    password: 'password123'
  });
  
  if (error) {
    console.error("Login Error:", error.message);
  } else {
    console.log("Login Success! User ID:", data.user.id);
  }
}

testLogin();
