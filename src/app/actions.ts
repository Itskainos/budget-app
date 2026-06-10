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

  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const scope = formData.get('scope') as 'PERSONAL' | 'GROUP'

  try {
    await pool.query(
      `INSERT INTO "Expense" (id, amount, category, description, scope, "userId", date) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())`,
      [amount, category, description, scope, user.id]
    )
  } catch (error) {
    console.error('Failed to create transaction', error)
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
    `DELETE FROM "Expense" WHERE id = $1 AND "userId" = $2`,
    [id, user.id]
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

  const avatarUrl = formData.get('avatarUrl') as string

  await pool.query(
    `UPDATE "User" SET "avatarUrl" = $1 WHERE id = $2`,
    [avatarUrl, user.id]
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
