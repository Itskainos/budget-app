import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    console.log('Renaming table...');
    await pool.query('ALTER TABLE "Expense" RENAME TO "Transaction"');
    console.log('Adding type column...');
    await pool.query('ALTER TABLE "Transaction" ADD COLUMN type VARCHAR(10) DEFAULT \'EXPENSE\'');
    console.log('Adding constraint...');
    await pool.query('ALTER TABLE "Transaction" ADD CONSTRAINT chk_transaction_type CHECK (type IN (\'INCOME\', \'EXPENSE\'))');
    console.log('Migration successful');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}
run();
