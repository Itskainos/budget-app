import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

import crypto from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    console.log('Adding pockets and monthlyLimit to User table...');
    await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pockets" JSONB DEFAULT '[]'::jsonb`);
    await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyLimit" NUMERIC DEFAULT 0`);
    
    // Seed initial pockets for existing users using their initialBalance if they have no pockets yet.
    const users = await pool.query('SELECT id, "initialBalance", "pockets" FROM "User"');
    for (const u of users.rows) {
      if (u.pockets && u.pockets.length === 0 && u.initialBalance > 0) {
        const defaultPocket = [{
          id: crypto.randomUUID(),
          name: 'Cash',
          balance: parseFloat(u.initialBalance)
        }];
        await pool.query(`UPDATE "User" SET pockets = $1 WHERE id = $2`, [JSON.stringify(defaultPocket), u.id]);
      }
    }
    console.log('Migration successful');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}
run();
