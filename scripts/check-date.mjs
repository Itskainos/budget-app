import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query('SELECT date FROM "Transaction" LIMIT 1');
  console.log(res.rows[0]);
  pool.end();
}
run();
