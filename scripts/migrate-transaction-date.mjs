import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    console.log('Altering Transaction date column type...');
    await pool.query('ALTER TABLE "Transaction" ALTER COLUMN "date" TYPE timestamp with time zone USING "date" AT TIME ZONE \'UTC\'');
    console.log('Migration successful');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}
run();
