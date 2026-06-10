import pkg from 'pg';
const { Client } = pkg;
const connectionString = "postgresql://postgres.qeuylbkvmprwbiarnbtz:AzADYCFDZTEbp9I4@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
async function checkInstances() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const res = await client.query(`SELECT id FROM auth.instances LIMIT 1`);
    console.log("Instance ID:", res.rows[0]?.id);
  } catch (e) {
    console.error(e.message);
  }
  await client.end();
}
checkInstances();
