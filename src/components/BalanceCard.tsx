'use client';

import * as React from 'react';
import { Pencil, Check, X as XIcon, ChevronRight, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { updatePockets } from '@/app/actions';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export type Pocket = { id: string, name: string, balance: number };

export function BalanceCard({ totalBalance, pockets }: { totalBalance: number, pockets: Pocket[] }) {
  const [isEditingPockets, setIsEditingPockets] = React.useState(false);
  const [localPockets, setLocalPockets] = React.useState<Pocket[]>(pockets);

  // Sync state if props change (e.g. from server action)
  React.useEffect(() => {
    setLocalPockets(pockets);
  }, [pockets]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    // Validate empty names or balances
    const validPockets = localPockets.filter(p => p.name.trim() !== '' && !isNaN(p.balance));
    formData.append('pockets', JSON.stringify(validPockets));
    
    const res = updatePockets(formData);
    toast.promise(res, {
      loading: 'Saving banks...',
      success: 'Banks updated!',
      error: 'Failed to update'
    });
    await res;
    setIsEditingPockets(false);
  };

  const addPocket = () => {
    setLocalPockets([...localPockets, { id: crypto.randomUUID(), name: 'New Bank', balance: 0 }]);
  };

  const removePocket = (id: string) => {
    setLocalPockets(localPockets.filter(p => p.id !== id));
  };

  const updatePocket = (id: string, field: 'name' | 'balance', value: string) => {
    setLocalPockets(localPockets.map(p => {
      if (p.id === id) {
        if (field === 'name') return { ...p, name: value };
        if (field === 'balance') return { ...p, balance: parseFloat(value) || 0 };
      }
      return p;
    }));
  };

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-sm border border-secondary/5 w-full max-w-md mx-auto md:max-w-none mb-2 relative">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-bold text-primary">Total Balance</span>
        <Link href="?modal=settings" scroll={false} className="text-[13px] font-semibold text-secondary flex items-center gap-1 hover:text-primary transition-colors">
          Manage Account <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight truncate">
            Rs. {totalBalance.toLocaleString()}
          </span>
          {!isEditingPockets && (
            <button type="button" onClick={() => setIsEditingPockets(true)} className="p-2.5 bg-secondary/10 hover:bg-secondary/20 rounded-full text-secondary hover:text-primary transition-colors cursor-pointer mt-1">
              <Pencil className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Pockets Section */}
      <AnimatePresence>
        {isEditingPockets ? (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
            onSubmit={handleSave}
          >
            <div className="flex flex-col gap-3 mb-4">
              {localPockets.map(pocket => (
                <div key={pocket.id} className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={pocket.name}
                    onChange={(e) => updatePocket(pocket.id, 'name', e.target.value)}
                    placeholder="Bank Name"
                    className="flex-1 bg-background border border-brand-teal/20 rounded-xl px-3 py-2 text-sm font-semibold text-primary focus:outline-none focus:border-brand-teal"
                  />
                  <input 
                    type="number"
                    step="any"
                    value={pocket.balance}
                    onChange={(e) => updatePocket(pocket.id, 'balance', e.target.value)}
                    placeholder="0"
                    className="w-28 bg-background border border-brand-teal/20 rounded-xl px-3 py-2 text-sm font-black text-primary focus:outline-none focus:border-brand-teal"
                  />
                  <button type="button" onClick={() => removePocket(pocket.id)} className="p-2 text-brand-coral/70 hover:text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <button type="button" onClick={addPocket} className="flex items-center gap-1.5 text-[13px] font-bold text-brand-teal hover:text-brand-teal/80 transition-colors px-2 py-1">
                <Plus className="w-4 h-4" /> Add Bank
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setIsEditingPockets(false); setLocalPockets(pockets); }} className="px-4 py-2 text-[13px] font-bold text-secondary hover:text-primary transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-brand-teal text-white text-[13px] font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Save
                </button>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {pockets.length === 0 ? (
              <button 
                type="button" 
                onClick={() => setIsEditingPockets(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 border border-brand-teal/20 rounded-lg text-brand-teal text-[12px] font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bank Account
              </button>
            ) : (
              pockets.map(pocket => (
                <div key={pocket.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/5 border border-secondary/10 rounded-lg">
                  <span className="text-[12px] font-medium text-secondary">{pocket.name}</span>
                  <span className="text-[12px] font-black text-primary">Rs. {pocket.balance.toLocaleString()}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <Link 
          href="?modal=add&type=INCOME" 
          scroll={false}
          className="flex-1 bg-secondary/10 hover:bg-secondary/20 text-primary font-bold text-[15px] py-3.5 rounded-full text-center transition-colors"
        >
          Money In
        </Link>
        <Link 
          href="?modal=add&type=EXPENSE" 
          scroll={false}
          className="flex-1 bg-secondary/10 hover:bg-secondary/20 text-primary font-bold text-[15px] py-3.5 rounded-full text-center transition-colors"
        >
          Money Out
        </Link>
      </div>
    </div>
  );
}
