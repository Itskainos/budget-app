import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  console.log("Trying to sign up jimmy@budget.com");
  const { data, error } = await supabase.auth.signUp({
    email: 'jimmy@budget.com',
    password: 'Jimmy123'
  });
  
  if (error) {
    console.error("Signup Error:", error.message);
  } else {
    console.log("Signup Success! User ID:", data?.user?.id);
  }
}

testSignup();
