import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    console.log('Adding initialBalance column...');
    await pool.query('ALTER TABLE "User" ADD COLUMN "initialBalance" FLOAT DEFAULT 0');
    console.log('Migration successful');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}
run();
