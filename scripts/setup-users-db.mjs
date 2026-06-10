import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.qeuylbkvmprwbiarnbtz:AzADYCFDZTEbp9I4@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

const users = [
  { username: 'Jimmy', password: 'Jimmy123' },
  { username: 'Minttuk', password: 'Minttuk123' },
  { username: 'Dorje', password: 'Dorje123' },
  { username: 'Dali', password: 'Dali123' }
];

async function setup() {
  const client = new Client({ connectionString });
  await client.connect();

  for (const user of users) {
    const email = `${user.username.toLowerCase()}@budget.com`;
    // Create UUID
    const idRes = await client.query(`SELECT gen_random_uuid() as id`);
    const id = idRes.rows[0].id;

    console.log(`Inserting ${user.username}...`);
    try {
      // Insert into auth.users
      await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, 
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
          created_at, updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated', $2, 
          crypt($3, gen_salt('bf')), 
          now(), '{"provider":"email","providers":["email"]}', '{}', 
          now(), now()
        )
      `, [id, email, user.password]);

      // Insert into public.User
      await client.query(`
        INSERT INTO public."User" (id, email, name, "createdAt")
        VALUES ($1, $2, $3, now())
      `, [id, email, user.username]);
      
      console.log(`Success: ${user.username}`);
    } catch (e) {
      if (e.code === '23505') {
        console.log(`${user.username} already exists, skipping.`);
      } else {
        console.error(`Error inserting ${user.username}:`, e.message);
      }
    }
  }

  console.log("All accounts created successfully! You can now log in using just the usernames (e.g., Jimmy).");
  await client.end();
}

setup();
