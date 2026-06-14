require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'Transaction'
    `);
    console.log('Columns:', res.rows);

    const enumRes = await pool.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
    `);
    console.log('Enums:', enumRes.rows);

  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
