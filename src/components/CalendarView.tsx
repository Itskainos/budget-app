'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Transaction } from './TransactionList';
import { TransactionList } from './TransactionList';
import { CATEGORY_CONFIG } from './CategoryList';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateStr(date: Date) {
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function txDateStr(tx: Transaction) {
  // tx.date may be an ISO string from Postgres
  return new Date(tx.date).toISOString().split('T')[0];
}

export function CalendarView({
  transactions,
  currentUserId,
}: {
  transactions: Transaction[];
  currentUserId: string;
}) {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = React.useState<string | null>(
    toDateStr(today)
  );

  // Build a map: "YYYY-MM-DD" -> Transaction[]
  const txByDay = React.useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
      const key = txDateStr(tx);
      if (!map[key]) map[key] = [];
      map[key].push(tx);
    }
    return map;
  }, [transactions]);

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-NP', {
    month: 'long', year: 'numeric'
  });

  // Selected day transactions
  const selectedTxs = selectedDay ? (txByDay[selectedDay] ?? []) : transactions;
  const selectedLabel = selectedDay
    ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-NP', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'All Transactions';

  // Build grid cells: nulls for empty leading cells, then day numbers
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-surface px-5 py-3 rounded-2xl border border-secondary/5 shadow-sm">
        <button onClick={prevMonth} className="text-secondary hover:text-primary transition-colors p-1">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-extrabold text-primary">{monthLabel}</span>
        <button onClick={nextMonth} className="text-secondary hover:text-primary transition-colors p-1">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface rounded-2xl border border-secondary/5 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-secondary/5">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-extrabold tracking-widest uppercase text-secondary py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTxs = txByDay[dateStr] ?? [];
            const isToday = dateStr === toDateStr(today);
            const isSelected = dateStr === selectedDay;
            const hasTxs = dayTxs.length > 0;

            // Pick up to 3 category colours for dot indicators
            const dotColors = dayTxs
              .slice(0, 3)
              .map(tx => (CATEGORY_CONFIG[tx.category]?.hex ?? 'var(--secondary)'));

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`relative aspect-square flex flex-col items-center justify-center gap-0.5 transition-all rounded-xl m-0.5 ${
                  isSelected
                    ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/30'
                    : isToday
                    ? 'bg-brand-teal/10 text-brand-teal font-bold'
                    : 'hover:bg-secondary/5 text-primary'
                }`}
              >
                <span className={`text-[13px] font-bold leading-none ${isSelected ? 'text-white' : ''}`}>
                  {day}
                </span>

                {/* Dot indicators */}
                {hasTxs && (
                  <div className="flex gap-[2px] mt-0.5">
                    {dotColors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-1 h-1 rounded-full"
                        style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction count summary */}
      <div className="flex items-center gap-2 px-1">
        <CalendarDays className="w-3.5 h-3.5 text-secondary" />
        <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
          {selectedLabel}
        </span>
        <span className="ml-auto text-[11px] text-secondary font-medium">
          {selectedTxs.length} {selectedTxs.length === 1 ? 'transaction' : 'transactions'}
        </span>
      </div>

      {/* Transactions for selected day */}
      <TransactionList transactions={selectedTxs} currentUserId={currentUserId} />
    </div>
  );
}
