const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function run() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;');
  console.log('Added avatarUrl');
  await c.end();
}
run();
