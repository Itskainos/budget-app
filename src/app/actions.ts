'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import { createClient } from '@/utils/supabase/server'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const amount       = parseFloat(formData.get('amount') as string)
  const category     = formData.get('category') as string
  const description  = formData.get('description') as string
  const scope        = formData.get('scope') as 'PERSONAL' | 'GROUP'
  const type         = (formData.get('type') as 'INCOME' | 'EXPENSE') || 'EXPENSE'
  const dateStr      = formData.get('date') as string | null
  const isRecurring  = formData.get('isRecurring') === 'true'
  const totalMonths  = parseInt((formData.get('totalMonths') as string) || '1', 10)

  // Use picked date at noon UTC to avoid timezone date-boundary issues.
  // Falls back to the current moment if no date supplied.
  const txDate = dateStr
    ? new Date(`${dateStr}T12:00:00.000Z`)
    : new Date()

  try {
    if (isRecurring && type === 'EXPENSE') {
      // 1. Insert the EMI definition
      const emiResult = await pool.query(
        `INSERT INTO "Emi" (id, "userId", description, amount, category, scope, "startMonth", "startYear", "totalMonths")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [user.id, description, amount, category, scope,
         txDate.getUTCMonth(), txDate.getUTCFullYear(), totalMonths]
      )
      const emiId = emiResult.rows[0].id

      // 2. Insert the first month's transaction linked to this EMI
      await pool.query(
        `INSERT INTO "Transaction" (id, amount, category, description, scope, type, "userId", date, "emiId")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8)`,
        [amount, category, description, scope, type, user.id, txDate.toISOString(), emiId]
      )
    } else {
      // One-time transaction
      await pool.query(
        `INSERT INTO "Transaction" (id, amount, category, description, scope, type, "userId", date)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7)`,
        [amount, category, description, scope, type, user.id, txDate.toISOString()]
      )
    }
  } catch (error) {
    console.error('Failed to create transaction', error)
  }

  revalidatePath('/')
  redirect('/')
}

export async function sendMoney(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const amount = parseFloat(formData.get('amount') as string)
  const recipientId = formData.get('recipientId') as string
  const description = formData.get('description') as string || 'Transfer'

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Sender -> TRANSFER_OUT
      await client.query(
        `INSERT INTO "Transaction" (id, amount, category, description, scope, type, "userId", date) VALUES (gen_random_uuid()::text, $1, 'Transfer', $2, 'GROUP', 'TRANSFER_OUT', $3, NOW())`,
        [amount, description, user.id]
      )
      
      // Recipient -> TRANSFER_IN
      await client.query(
        `INSERT INTO "Transaction" (id, amount, category, description, scope, type, "userId", date) VALUES (gen_random_uuid()::text, $1, 'Transfer', $2, 'GROUP', 'TRANSFER_IN', $3, NOW())`,
        [amount, description, recipientId]
      )
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to send money', error)
  }

  revalidatePath('/')
  redirect('/')
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = formData.get('id') as string

  // Only delete if the expense belongs to the current user (security check)
  await pool.query(
    `DELETE FROM "Transaction" WHERE id = $1 AND "userId" = $2`,
    [id, user.id]
  )

  revalidatePath('/')
}

export async function deleteEmi(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const emiId = formData.get('emiId') as string

  // Only delete if owned by this user (security check)
  await pool.query(
    `DELETE FROM "Emi" WHERE id = $1 AND "userId" = $2`,
    [emiId, user.id]
  )

  revalidatePath('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const avatarUrl = formData.get('avatarUrl') as string;
  const rawLimit = formData.get('monthlyLimit');
  const monthlyLimit = rawLimit ? parseFloat(rawLimit as string) : 0;

  await pool.query(
    `UPDATE "User" SET "avatarUrl" = $1, "monthlyLimit" = $2 WHERE id = $3`,
    [avatarUrl, monthlyLimit, user.id]
  )

  revalidatePath('/')
}

export async function updatePockets(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawPockets = formData.get('pockets') as string;
  let pockets: { id: string, name: string, balance: number }[] = [];
  try {
    pockets = JSON.parse(rawPockets);
  } catch (e) {
    // invalid JSON
  }

  const totalBalance = pockets.reduce((sum, p) => sum + p.balance, 0);

  await pool.query(
    `UPDATE "User" SET "pockets" = $1::jsonb, "initialBalance" = $2, "balanceUpdatedAt" = NOW() WHERE id = $3`,
    [JSON.stringify(pockets), totalBalance, user.id]
  )

  revalidatePath('/')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    redirect('/?modal=settings&error=Passwords+do+not+match')
  }

  if (newPassword.length < 6) {
    redirect('/?modal=settings&error=Password+must+be+at+least+6+characters')
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    redirect('/?modal=settings&error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/')
  redirect('/?modal=settings&success=Password+updated+successfully')
}

export async function updateCategoryBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const category = formData.get('category') as string
  const limit = parseFloat(formData.get('limit') as string) || 0
  const scope = formData.get('scope') as 'PERSONAL' | 'GROUP'

  if (limit > 0) {
    await pool.query(
      `DELETE FROM "Budget" WHERE category = $1 AND scope = $2 AND "userId" = $3`,
      [category, scope, user.id]
    )
    await pool.query(
      `INSERT INTO "Budget" (id, category, "limit", scope, "userId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
      [category, limit, scope, user.id]
    )
  } else {
    await pool.query(
      `DELETE FROM "Budget" WHERE category = $1 AND scope = $2 AND "userId" = $3`,
      [category, scope, user.id]
    )
  }

  revalidatePath('/')
}
