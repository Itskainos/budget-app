'use client';

import * as React from "react";
import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CATEGORY_CONFIG,
  getIconForCategory,
  getColorForCategory,
  getHexColorForCategory,
} from "@/lib/categories";

// Re-export so other components (TransactionList, CalendarView) that import from here still work
export { CATEGORY_CONFIG, getIconForCategory, getColorForCategory, getHexColorForCategory };

export interface CategoryData {
  id: string;
  name: string;
  spent: number;
  limit: number;
}

export function CategoryList({
  categories,
  activeCategory,
  activeTab,
}: {
  categories: CategoryData[];
  activeCategory?: string;
  activeTab: string;
}) {
  if (categories.length === 0) {
    return <div className="text-center text-secondary py-12">No transactions yet for this scope. Add one!</div>;
  }

  return (
    <div className="w-full pb-24">
      <div className="bg-surface rounded-3xl shadow-sm border border-[var(--secondary)]/5 overflow-hidden">
        {categories.map((cat, index) => {
          const percent = Math.min(100, (cat.spent / cat.limit) * 100);
          const isWarning = percent >= 80;
          const Icon = getIconForCategory(cat.name);
          const colorClass = getColorForCategory(cat.name);

          const isActive = activeCategory === cat.name;
          const isDimmed = activeCategory && !isActive;

          // Determine target URL for toggling the category searchParam
          const href = isActive
            ? (activeTab === "personal" ? "/?scope=personal" : "/?scope=family")
            : (activeTab === "personal"
                ? `/?scope=personal&category=${encodeURIComponent(cat.name)}`
                : `/?scope=family&category=${encodeURIComponent(cat.name)}`);

          return (
            <motion.div
              key={cat.id}
              layout
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full"
            >
              <Link
                href={href}
                scroll={false}
                className={`p-4 flex flex-col gap-1 transition-all duration-200 hover:bg-secondary/5 relative block ${
                  isActive
                    ? "bg-brand-teal/5 border-l-4 border-brand-teal shadow-[inset_4px_0_0_0_rgba(13,148,136,0.1)]"
                    : index !== categories.length - 1
                    ? "border-b border-background"
                    : ""
                } ${isDimmed ? "opacity-40 hover:opacity-70 scale-[0.98]" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                    isActive ? "ring-2 ring-brand-teal ring-offset-2 ring-offset-surface" : ""
                  } ${isWarning ? "bg-brand-coral" : colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="font-semibold text-primary text-[15px]">{cat.name}</span>

                  <div className="flex-1 border-b-2 border-dotted border-secondary opacity-20 mx-2 relative top-[2px]"></div>

                  <span className="font-extrabold text-primary text-[15px]">Rs. {cat.spent.toFixed(0)}</span>
                  
                  {isActive ? (
                    <div className="p-1 rounded-full bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-secondary/40 transition-transform group-hover:translate-x-0.5" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-[3.5px] w-full bg-background rounded-full overflow-hidden mt-1 ml-14 max-w-[calc(100%-4rem)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className={`h-full rounded-full ${isWarning ? "bg-brand-coral" : "bg-brand-teal"}`}
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
