'use client';

import * as React from "react";
import { Plus, Send, Receipt } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function FAB() {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-end gap-3 mb-2"
          >
            <Link
              href="?modal=send"
              scroll={false}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group"
            >
              <span className="bg-surface px-3 py-1.5 rounded-lg text-sm font-bold text-primary shadow-sm border border-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                Send Money
              </span>
              <div className="w-12 h-12 flex items-center justify-center bg-brand-teal text-white rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform">
                <Send className="w-5 h-5" />
              </div>
            </Link>

            <Link
              href="?modal=add"
              scroll={false}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group"
            >
              <span className="bg-surface px-3 py-1.5 rounded-lg text-sm font-bold text-primary shadow-sm border border-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                Add Transaction
              </span>
              <div className="w-12 h-12 flex items-center justify-center bg-primary text-background rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 flex items-center justify-center bg-brand-teal text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 z-50"
        aria-label="Actions menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus className="w-8 h-8" />
        </motion.div>
      </button>
    </div>
  );
}
