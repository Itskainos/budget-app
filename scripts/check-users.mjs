import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.qeuylbkvmprwbiarnbtz:AzADYCFDZTEbp9I4@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function checkUsers() {
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'users';
  `);
  console.log(res.rows.map(r => `${r.column_name} (${r.data_type}) - default: ${r.column_default}`));

  await client.end();
}
checkUsers();
