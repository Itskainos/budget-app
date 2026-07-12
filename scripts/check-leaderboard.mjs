import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  // What months/years of GROUP EXPENSE transactions exist?
  const r1 = await pool.query(
    `SELECT EXTRACT(MONTH FROM date)::int as month, EXTRACT(YEAR FROM date)::int as year,
            COUNT(*)::int as cnt, ROUND(SUM(amount)::numeric, 2) as total
     FROM "Transaction"
     WHERE scope = 'GROUP' AND type = 'EXPENSE'
     GROUP BY 1,2 ORDER BY 2,1`
  );
  console.log('\n--- GROUP EXPENSE transactions by month/year ---');
  console.table(r1.rows);

  // Also check total all-time vs July only
  const r2 = await pool.query(
    `SELECT COALESCE(SUM(amount),0)::float as alltime FROM "Transaction" WHERE scope='GROUP' AND type='EXPENSE'`
  );
  const r3 = await pool.query(
    `SELECT COALESCE(SUM(amount),0)::float as july2026 FROM "Transaction"
     WHERE scope='GROUP' AND type='EXPENSE'
       AND EXTRACT(MONTH FROM date)=7 AND EXTRACT(YEAR FROM date)=2026`
  );
  console.log('All-time total:  Rs.', r2.rows[0].alltime.toLocaleString());
  console.log('July 2026 total: Rs.', r3.rows[0].july2026.toLocaleString());
  await pool.end();
}
check().catch(console.error);
