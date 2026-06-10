import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.qeuylbkvmprwbiarnbtz:AzADYCFDZTEbp9I4@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function checkIdentities() {
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'identities';
  `);
  console.log(res.rows);

  await client.end();
}
checkIdentities();
