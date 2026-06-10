'use client';

import * as React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { addTransaction } from '@/app/actions';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useFormStatus } from 'react-dom';

const EXPENSE_CATEGORIES = [
  { name: 'Household & Groceries',  emoji: '🛒' },
  { name: 'Utilities & Bills',       emoji: '⚡' },
  { name: 'Education & Supplies',    emoji: '📚' },
  { name: 'Transport & Auto',        emoji: '🚗' },
  { name: 'Personal & Shopping',     emoji: '🛍️' },
  { name: 'Dining & Entertainment',  emoji: '🍽️' },
  { name: 'Medical & Wellness',      emoji: '🩺' },
  { name: 'Savings & Investments',   emoji: '📈' },
  { name: 'Gifts & Donations',       emoji: '🎁' },
  { name: 'Miscellaneous',           emoji: '📦' },
];

const INCOME_CATEGORIES = [
  { name: 'Salary',                  emoji: '💰' },
  { name: 'Dev Projects',            emoji: '💻' },
  { name: 'Investment Returns',      emoji: '📈' },
  { name: 'Transfer',                emoji: '🔄' },
  { name: 'Refund / Other',          emoji: '💸' },
];

function SubmitButton({ type }: { type: 'INCOME' | 'EXPENSE' }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full text-background font-bold text-lg py-4 rounded-full mt-2 transition-all shadow-md ${
        pending ? 'bg-secondary opacity-70 cursor-not-allowed' : (type === 'INCOME' ? 'bg-brand-teal hover:opacity-90 active:scale-[0.98] hover:shadow-lg' : 'bg-primary hover:opacity-90 active:scale-[0.98] hover:shadow-lg')
      }`}
    >
      {pending ? 'Saving...' : type === 'INCOME' ? 'Add Income' : 'Add Expense'}
    </button>
  );
}

export function AddTransactionModal({ 
  activeTab, 
  defaultType = 'EXPENSE' 
}: { 
  activeTab?: "personal" | "family";
  defaultType?: 'INCOME' | 'EXPENSE';
}) {
  const [type, setType] = React.useState<'EXPENSE' | 'INCOME'>(defaultType);
  const activeCategories = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  
  const [selectedCategory, setSelectedCategory] = React.useState(activeCategories[0].name);
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedItem = activeCategories.find(c => c.name === selectedCategory) ?? activeCategories[0];

  React.useEffect(() => {
    setSelectedCategory(activeCategories[0].name);
  }, [type]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary tracking-tight">New Transaction</h2>
          <Link href="/" scroll={false} className="p-2 text-secondary hover:text-primary transition-colors bg-background rounded-full">
            <X className="w-5 h-5" />
          </Link>
        </div>

        {/* Type Toggle - Hidden in Family Tab */}
        {activeTab !== 'family' && (
          <div className="flex bg-background p-1 rounded-2xl shadow-inner border border-secondary/5 mb-6">
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2.5 text-sm font-bold tracking-widest uppercase rounded-xl transition-all ${
                type === 'INCOME' ? 'bg-brand-teal text-white shadow-sm' : 'text-secondary hover:text-brand-teal'
              }`}
            >
              Money In
            </button>
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2.5 text-sm font-bold tracking-widest uppercase rounded-xl transition-all ${
                type === 'EXPENSE' ? 'bg-brand-coral text-white shadow-sm' : 'text-secondary hover:text-brand-coral'
              }`}
            >
              Money Out
            </button>
          </div>
        )}

        <form action={addTransaction} className="flex flex-col gap-5">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="category" value={selectedCategory} />

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-secondary mb-2 ml-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary text-sm">Rs.</span>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full bg-background border border-secondary/10 rounded-2xl pl-12 pr-4 py-4 text-primary font-bold text-xl focus:outline-none focus:border-brand-teal transition-colors"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-secondary mb-2 ml-1">Name</label>
            <input
              name="description"
              type="text"
              required
              placeholder="e.g. Weekly groceries, Netflix, Uber…"
              className="w-full bg-background border border-secondary/10 rounded-2xl px-4 py-4 text-primary font-semibold focus:outline-none focus:border-brand-teal transition-colors placeholder:font-normal"
            />
          </div>

          {/* Custom Category Picker */}
          <div ref={dropdownRef}>
            <label className="block text-xs font-bold tracking-widest uppercase text-secondary mb-2 ml-1">Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-background border border-secondary/10 rounded-2xl px-4 py-4 text-primary font-semibold focus:outline-none focus:border-brand-teal transition-all flex items-center justify-between hover:border-brand-teal/50"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{selectedItem.emoji}</span>
                  <span>{selectedItem.name}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-surface border border-secondary/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-72 overflow-y-auto">
                  {activeCategories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => { setSelectedCategory(cat.name); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left font-semibold transition-colors hover:bg-secondary/10 ${
                        selectedCategory === cat.name ? (type === 'INCOME' ? 'text-brand-teal bg-brand-teal/10' : 'text-brand-coral bg-brand-coral/10') : 'text-primary'
                      }`}
                    >
                      <span className="text-lg w-7 text-center">{cat.emoji}</span>
                      <span className="text-sm">{cat.name}</span>
                      {selectedCategory === cat.name && (
                        <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${type === 'INCOME' ? 'bg-brand-teal' : 'bg-brand-coral'}`} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scope: Income is strictly PERSONAL. Expenses are shared to GROUP. */}
          <input type="hidden" name="scope" value={type === 'INCOME' ? 'PERSONAL' : 'GROUP'} />

          <SubmitButton type={type} />
        </form>
      </motion.div>
    </motion.div>
  );
}
