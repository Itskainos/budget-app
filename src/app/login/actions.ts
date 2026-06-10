'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const username = (formData.get('username') as string).trim()
  const password = (formData.get('password') as string)

  if (!username || !password) {
    redirect('/login?message=Username+and+password+are+required')
  }

  const supabase = await createClient()

  // Construct email from username — matches how accounts were created
  const email = `${username.toLowerCase()}@budget.com`

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?message=' + encodeURIComponent('Invalid username or password'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const username = (formData.get('username') as string).trim()
  const password = (formData.get('password') as string)

  if (!username || !password) {
    redirect('/login?message=Username+and+password+are+required')
  }

  if (password.length < 6) {
    redirect('/login?message=Password+must+be+at+least+6+characters')
  }

  const supabase = await createClient()
  const email = `${username.toLowerCase()}@budget.com`

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/login?message=' + encodeURIComponent(error.message))
  }

  // Also create a matching public.User row
  if (data.user) {
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    try {
      await pool.query(
        `INSERT INTO "User" (id, email, name, "createdAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT (id) DO NOTHING`,
        [data.user.id, email, username]
      )
    } catch (e) {
      console.error('Failed to insert public User', e)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
