import { login, signup } from './actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Wallet } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
      {/* Top Header Background Area - Full Bleed */}
      <div className="absolute top-0 inset-x-0 h-[35rem] bg-gradient-to-b from-brand-teal/10 to-transparent -z-10 dark:from-brand-teal/15 pointer-events-none" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="bg-surface p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-brand-teal/5 w-full max-w-sm border border-secondary/5 relative animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center mb-4 shadow-lg shadow-brand-teal/30">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Welcome Back</h1>
          <p className="text-secondary font-medium mt-2 text-sm text-center">Sign in to your family budget account</p>
        </div>

        {message && (
          <div className="bg-brand-coral/10 text-brand-coral p-4 rounded-xl text-sm font-bold text-center mb-6 border border-brand-coral/20">
            {message}
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-secondary mb-2 ml-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="e.g. User"
              className="w-full bg-background border border-secondary/10 rounded-2xl px-5 py-4 text-primary font-semibold focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-secondary mb-2 ml-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-background border border-secondary/10 rounded-2xl px-5 py-4 text-primary font-semibold focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              formAction={login}
              className="w-full bg-brand-teal text-white font-bold text-lg py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="w-full bg-transparent text-secondary font-bold py-4 rounded-full hover:text-primary active:scale-[0.98] transition-all text-sm"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
