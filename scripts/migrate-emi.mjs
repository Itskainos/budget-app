import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Creating Emi table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Emi" (
        id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId"       TEXT NOT NULL,
        description    TEXT NOT NULL,
        amount         FLOAT NOT NULL,
        category       TEXT NOT NULL DEFAULT 'EMI & Loans',
        scope          TEXT NOT NULL DEFAULT 'PERSONAL',
        "startMonth"   INT NOT NULL,
        "startYear"    INT NOT NULL,
        "totalMonths"  INT NOT NULL,
        "createdAt"    TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    console.log('Adding emiId column to Transaction table...');
    await client.query(`
      ALTER TABLE "Transaction"
      ADD COLUMN IF NOT EXISTS "emiId" TEXT REFERENCES "Emi"(id) ON DELETE SET NULL
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
