import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res1 = await pool.query(`SELECT data_type FROM information_schema.columns WHERE table_name = 'Transaction' AND column_name = 'date'`);
  const res2 = await pool.query(`SELECT data_type FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'balanceUpdatedAt'`);
  console.log('Transaction.date:', res1.rows[0]);
  console.log('User.balanceUpdatedAt:', res2.rows[0]);
  pool.end();
}
run();
