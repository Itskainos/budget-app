'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative min-h-screen">
      {/* Background Gradient */}
      <div className="absolute top-0 inset-x-0 h-[35rem] bg-gradient-to-b from-brand-teal/10 to-transparent -z-10 dark:from-brand-teal/15 pointer-events-none" />

      <main className="pb-24 max-w-5xl mx-auto px-4 md:px-8 pt-6">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between mt-2 w-full max-w-md mx-auto md:max-w-none">
          <div className="h-4 w-36 bg-secondary/15 rounded-md animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-secondary/15 animate-pulse" />
        </header>

        {/* Tab Toggle Skeleton */}
        <div className="w-full max-w-xs mx-auto mt-6">
          <div className="h-10 w-full bg-surface rounded-full border border-secondary/5 animate-pulse" />
        </div>

        {/* Main Grid Skeleton */}
        <div className="md:grid md:grid-cols-2 md:gap-12 mt-6 md:mt-10 items-start">
          
          {/* Left Column Skeleton */}
          <div className="flex flex-col gap-6">
            {/* Chart Skeleton */}
            <div className="w-full max-w-md bg-surface p-6 rounded-[2rem] border border-secondary/5 flex flex-col items-center justify-center min-h-[280px]">
              <div className="w-44 h-44 rounded-full border-[16px] border-secondary/10 animate-pulse relative flex items-center justify-center">
                <div className="w-16 h-4 bg-secondary/15 rounded-md" />
              </div>
            </div>

            {/* Categories Skeleton */}
            <div className="flex flex-col gap-3">
              <div className="h-6 w-24 bg-surface px-4 py-1.5 rounded-full border border-secondary/10 animate-pulse" />
              <div className="bg-surface rounded-3xl border border-secondary/5 overflow-hidden p-4 flex flex-col gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-secondary/15 shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-3.5 w-1/3 bg-secondary/15 rounded" />
                      <div className="h-1.5 w-full bg-secondary/10 rounded-full" />
                    </div>
                    <div className="w-14 h-4 bg-secondary/15 rounded shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="flex flex-col gap-6 mt-8 md:mt-0">
            {/* Calendar Skeleton */}
            <div>
              <div className="flex justify-between items-center mb-4 px-1 animate-pulse">
                <div className="h-6 w-24 bg-surface px-4 py-1.5 rounded-full border border-secondary/10" />
                <div className="h-4 w-28 bg-secondary/10 rounded" />
              </div>

              {/* Month Navigator Skeleton */}
              <div className="h-12 w-full bg-surface rounded-2xl border border-secondary/5 mb-4 animate-pulse" />

              {/* Calendar Grid Skeleton */}
              <div className="bg-surface rounded-2xl border border-secondary/5 overflow-hidden p-4 animate-pulse">
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={`header-${i}`} className="h-4 bg-secondary/10 rounded-md" />
                  ))}
                  {[...Array(35)].map((_, i) => (
                    <div key={`cell-${i}`} className="aspect-square bg-secondary/5 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions List Skeleton */}
            <div className="flex flex-col gap-3">
              <div className="h-4 w-36 bg-secondary/15 rounded-md animate-pulse" />
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-surface rounded-2xl p-4 border border-secondary/5 flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-secondary/15 shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3.5 w-1/2 bg-secondary/15 rounded" />
                      <div className="h-3 w-1/4 bg-secondary/10 rounded" />
                    </div>
                    <div className="w-16 h-4 bg-secondary/15 rounded shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Center Spinner */}
      <div className="fixed inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] pointer-events-none z-[99]">
        <div className="bg-surface p-4 rounded-3xl shadow-xl border border-secondary/10 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        </div>
      </div>
    </div>
  );
}
