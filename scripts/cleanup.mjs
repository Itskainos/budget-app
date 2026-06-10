import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.qeuylbkvmprwbiarnbtz:AzADYCFDZTEbp9I4@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function cleanup() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Cleaning up manual users...");
  await client.query(`DELETE FROM auth.identities`);
  await client.query(`DELETE FROM auth.users WHERE email LIKE '%@budget.com'`);
  await client.query(`DELETE FROM public."User"`);

  console.log("Done cleanup.");
  await client.end();
}
cleanup();
