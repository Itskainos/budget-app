'use client';

import * as React from "react";
import { ChevronRight, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TransactionList, Transaction } from "./TransactionList";
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
}

export function CategoryList({
  categories,
  activeCategory,
  activeTab,
  transactions,
  currentUserId,
}: {
  categories: CategoryData[];
  activeCategory?: string;
  activeTab: "personal" | "family";
  transactions: Transaction[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [pendingCategory, setPendingCategory] = React.useState<string | null>(null);

  const handleCategoryClick = (catName: string, isActive: boolean) => {
    setPendingCategory(catName);
    const targetUrl = isActive
      ? (activeTab === "personal" ? "/?scope=personal" : "/?scope=family")
      : (activeTab === "personal"
          ? `/?scope=personal&category=${encodeURIComponent(catName)}`
          : `/?scope=family&category=${encodeURIComponent(catName)}`);
    
    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  if (categories.length === 0) {
    return <div className="text-center text-secondary py-12">No transactions yet for this scope. Add one!</div>;
  }

  return (
    <div className="w-full pb-24">
      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const Icon = getIconForCategory(cat.name);
          const colorClass = getColorForCategory(cat.name);

          const isActive = activeCategory === cat.name;
          const isDimmed = activeCategory && !isActive;
          const activeRingClass = colorClass.replace('bg-', 'ring-');

          return (
            <motion.div
              key={cat.id}
              layout
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => handleCategoryClick(cat.name, isActive)}
                className={`relative w-full overflow-hidden transition-all duration-300 flex items-center justify-between group rounded-2xl p-4
                  ${isActive 
                    ? `bg-surface border-2 shadow-md ${activeRingClass}` 
                    : isDimmed 
                    ? 'opacity-40 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 hover:bg-[var(--secondary)]/5 border-2 border-transparent' 
                    : 'hover:bg-[var(--secondary)]/5 border-2 border-transparent'}`}
                style={isActive ? { borderColor: colorClass.replace('bg-', 'var(--') + ')' } : {}}
              >
                {/* Background tint for active state */}
                {isActive && (
                  <div className={`absolute inset-0 opacity-10 ${colorClass}`} />
                )}

                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 ${colorClass} text-white shadow-sm`}>
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-[15px] text-primary transition-colors">
                      {cat.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <span className={`font-extrabold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-[var(--secondary)] group-hover:text-primary'}`}>
                    Rs. {cat.spent.toLocaleString()}
                  </span>
                  
                  {isPending && pendingCategory === cat.name ? (
                    <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full bg-[var(--secondary)]/10 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-primary" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--secondary)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  )}
                </div>
              </button>

              {/* Transaction Dropdown */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 px-2 pb-4">
                      <TransactionList 
                        transactions={transactions.filter(t => t.category === cat.name)} 
                        currentUserId={currentUserId} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
