import pool from './db';

export interface EmiRecord {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  scope: string;
  startMonth: number; // 0-indexed (JS convention)
  startYear: number;
  totalMonths: number;
  createdAt: string;
}

/**
 * For each active EMI belonging to userId, check if a transaction has already
 * been inserted for the CURRENT calendar month. If not, insert one automatically.
 * This is called at page-load time so recurring entries always appear without
 * the user having to do anything.
 */
export async function ensureEmiTransactions(userId: string): Promise<void> {
  const now = new Date();
  const currentMonth = now.getMonth();   // 0-indexed
  const currentYear  = now.getFullYear();

  let emis: EmiRecord[];
  try {
    const result = await pool.query<EmiRecord>(
      `SELECT id, "userId", description, amount, category, scope,
              "startMonth", "startYear", "totalMonths"
       FROM "Emi" WHERE "userId" = $1`,
      [userId]
    );
    emis = result.rows;
  } catch {
    // Emi table may not exist yet (pre-migration) — fail silently
    return;
  }

  for (const emi of emis) {
    // Determine whether this EMI is active in the current month
    // startMonth/startYear mark the first month; the EMI runs for totalMonths months.
    const firstMonth = emi.startYear * 12 + emi.startMonth;
    const lastMonth  = firstMonth + emi.totalMonths - 1;
    const nowMonth   = currentYear  * 12 + currentMonth;

    if (nowMonth < firstMonth || nowMonth > lastMonth) continue;

    // Check if a transaction for this EMI+month already exists
    const existing = await pool.query(
      `SELECT id FROM "Transaction"
       WHERE "emiId" = $1
         AND EXTRACT(MONTH FROM date) = $2
         AND EXTRACT(YEAR  FROM date) = $3`,
      [emi.id, currentMonth + 1, currentYear]   // EXTRACT MONTH is 1-indexed
    );

    if (existing.rows.length > 0) continue;

    // Insert the auto-generated monthly transaction (dated the 1st of the month)
    const txDate = new Date(Date.UTC(currentYear, currentMonth, 1, 12, 0, 0));
    await pool.query(
      `INSERT INTO "Transaction"
         (id, amount, category, description, scope, type, "userId", date, "emiId")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'EXPENSE', $5, $6, $7)`,
      [emi.amount, emi.category, emi.description, emi.scope, userId, txDate.toISOString(), emi.id]
    );
  }
}
