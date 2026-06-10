import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.qeuylbkvmprwbiarnbtz:AzADYCFDZTEbp9I4@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function fixIdentities() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Fetching users...");
  const usersRes = await client.query(`SELECT id, email FROM auth.users WHERE email LIKE '%@budget.com'`);
  
  for (const user of usersRes.rows) {
    console.log(`Fixing identity for ${user.email}...`);
    try {
      const idRes = await client.query(`SELECT gen_random_uuid() as id`);
      const identityId = idRes.rows[0].id;

      await client.query(`
        INSERT INTO auth.identities (
          id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, json_build_object('sub', $4::text, 'email', $5::text, 'email_verified', true), 'email', now(), now(), now()
        ) ON CONFLICT DO NOTHING
      `, [identityId, user.id, user.id, user.id, user.email]);
      console.log(`Success for ${user.email}`);
    } catch (e) {
      console.error(`Error for ${user.email}:`, e.message);
    }
  }

  await client.end();
}

fixIdentities();
