import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query(`SELECT data_type FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'pockets'`);
  console.log(res.rows);
  pool.end();
}
run();
