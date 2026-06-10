'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function MonthPicker({ month, year }: { month: number, year: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePrev = () => {
    const params = new URLSearchParams(searchParams.toString());
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    params.set('month', newMonth.toString());
    params.set('year', newYear.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleNext = () => {
    const params = new URLSearchParams(searchParams.toString());
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    params.set('month', newMonth.toString());
    params.set('year', newYear.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('month');
    params.delete('year');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const dateStr = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center justify-between bg-surface rounded-2xl px-4 py-3 shadow-sm border border-secondary/5 w-full max-w-md mx-auto md:max-w-none mb-6 mt-2">
      <button onClick={handlePrev} className="p-2 text-secondary hover:text-primary transition-colors hover:bg-secondary/10 rounded-full">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={handleReset} className="text-[14px] font-extrabold tracking-wide text-primary hover:text-brand-teal transition-colors uppercase">
        {dateStr}
      </button>
      <button onClick={handleNext} className="p-2 text-secondary hover:text-primary transition-colors hover:bg-secondary/10 rounded-full">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
