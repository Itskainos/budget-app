'use client';

import * as React from 'react';
import { X, Send } from 'lucide-react';
import { sendMoney } from '@/app/actions';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full text-background font-bold text-lg py-4 rounded-full mt-2 transition-all shadow-md flex items-center justify-center gap-2 ${
        pending ? 'bg-secondary opacity-70 cursor-not-allowed' : 'bg-primary hover:opacity-90 active:scale-[0.98] hover:shadow-lg'
      }`}
    >
      <Send className="w-5 h-5" />
      {pending ? 'Sending...' : 'Send Money'}
    </button>
  );
}

export function SendMoneyModal({ users }: { users: { id: string, name: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-surface w-full max-w-md rounded-[2rem] p-6 shadow-xl border border-secondary/10 relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary tracking-tight">Send Money</h2>
          <Link href="/" scroll={false} className="p-2 text-secondary hover:text-primary transition-colors bg-background rounded-full">
            <X className="w-5 h-5" />
          </Link>
        </div>

        <form 
          action={async (fd) => {
            const res = sendMoney(fd);
            toast.promise(res, {
              loading: 'Sending...',
              success: 'Money sent successfully!',
              error: 'Failed to send money',
            });
            await res;
          }}
          className="flex flex-col gap-6"
        >
          {/* Amount Input */}
          <div className="flex flex-col items-center justify-center py-4 bg-background rounded-[1.5rem] border border-secondary/10 shadow-inner group focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <span className="text-sm font-bold text-secondary mb-1 uppercase tracking-widest">Amount</span>
            <div className="flex items-center justify-center gap-2 px-6 w-full">
              <span className="text-4xl sm:text-5xl font-black text-primary">Rs.</span>
              <input
                name="amount"
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                className="bg-transparent text-5xl sm:text-6xl font-black text-primary focus:outline-none w-full placeholder:text-secondary/30 min-w-[100px]"
              />
            </div>
          </div>

          {/* Recipient Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">Send To</label>
            <div className="relative">
              <select 
                name="recipientId" 
                required
                className="w-full appearance-none bg-background border border-secondary/10 rounded-2xl p-4 pr-12 text-primary font-bold text-lg focus:outline-none focus:border-brand-teal transition-colors"
                defaultValue=""
              >
                <option value="" disabled>Select a family member</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">Note (Optional)</label>
            <input 
              name="description"
              type="text"
              placeholder="What is this for?"
              className="bg-background border border-secondary/10 rounded-2xl p-4 text-primary font-medium focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>

          <SubmitButton />
        </form>
      </motion.div>
    </motion.div>
  );
}
