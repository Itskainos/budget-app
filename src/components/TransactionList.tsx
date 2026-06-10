'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { deleteTransaction } from '@/app/actions';
import { CATEGORY_CONFIG } from './CategoryList';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  userId: string;
  userName?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
}

// ── Delete-confirmation modal (fixed overlay, never clipped) ──────────────────
function DeleteModal({
  tx,
  onCancel,
  onConfirm,
}: {
  tx: Transaction;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Close on backdrop click
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="z-[9999] bg-surface border border-secondary/10 shadow-2xl rounded-3xl p-6 w-80 mx-4"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-coral/10 mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-brand-coral" />
          </div>

          {/* Text */}
          <h2 className="text-primary font-extrabold text-[17px] text-center mb-1">
            Delete transaction?
          </h2>
          <p className="text-secondary text-[13px] text-center mb-5 leading-relaxed">
            <span className="font-semibold text-primary">
              {tx.description || tx.category}
            </span>{' '}
            · Rs. {tx.amount.toLocaleString()}<br />
            This can&apos;t be undone.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-background hover:bg-secondary/10 border border-secondary/10 transition-colors text-primary px-4 py-2.5 rounded-2xl font-bold text-[13px]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-brand-coral hover:bg-brand-coral/85 transition-colors text-white px-4 py-2.5 rounded-2xl font-bold text-[13px] shadow-md shadow-brand-coral/25"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main list ─────────────────────────────────────────────────────────────────
export function TransactionList({
  transactions,
  currentUserId,
}: {
  transactions: Transaction[];
  currentUserId: string;
}) {
  const [confirmTx, setConfirmTx] = React.useState<Transaction | null>(null);

  const handleDelete = async () => {
    if (!confirmTx) return;
    const tx = confirmTx;
    setConfirmTx(null);

    const formData = new FormData();
    formData.append('id', tx.id);

    toast.promise(deleteTransaction(formData), {
      loading: 'Deleting…',
      success: 'Transaction deleted!',
      error: 'Could not delete.',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center text-secondary py-10 text-sm">
        No transactions yet. Add one! 👆
      </div>
    );
  }

  return (
    <>
      {/* Modal rendered outside the list so it's never clipped */}
      {confirmTx && (
        <DeleteModal
          tx={confirmTx}
          onCancel={() => setConfirmTx(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="w-full flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {transactions.map((tx) => {
            const cfg = CATEGORY_CONFIG[tx.category] ?? { emoji: '📦', hex: 'var(--secondary)' };
            const isOwn = tx.userId === currentUserId;
            const date = new Date(tx.date);
            const dateStr = date.toLocaleDateString('en-NP', { day: 'numeric', month: 'short' });

            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 15, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95, height: 0, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="overflow-hidden"
              >
                <div className="relative flex items-center gap-3 bg-surface rounded-2xl px-4 py-3 border border-secondary/5 group">
                  {/* Category icon */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                    style={{ background: `${cfg.hex}22` }}
                  >
                    <span>{(cfg as any).emoji ?? '📦'}</span>
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <p className="text-primary font-semibold text-sm truncate">
                      {tx.description || tx.category}
                    </p>
                    <p className="text-secondary text-[11px] font-medium">
                      {tx.category} · {dateStr}
                      {!isOwn && (
                        <span className="ml-1.5 text-brand-teal font-bold">· {tx.userName?.split(' ')[0] || 'Family'}</span>
                      )}
                    </p>
                  </div>

                  {/* Amount */}
                  <span className={`font-extrabold text-sm shrink-0 ${tx.type === 'INCOME' ? 'text-brand-teal' : 'text-primary'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                  </span>

                  {/* Delete — only for own transactions */}
                  {isOwn && (
                    <button
                      type="button"
                      title="Delete transaction"
                      onClick={() => setConfirmTx(tx)}
                      className="ml-1 p-2 rounded-full text-secondary/50 hover:text-brand-coral hover:bg-brand-coral/10 transition-all focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
