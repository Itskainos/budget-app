import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query(`SELECT name, pockets FROM "User"`);
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}
run();
