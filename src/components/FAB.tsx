import * as React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export function FAB() {
  return (
    <Link 
      href="?modal=add"
      scroll={false}
      className="fixed bottom-6 right-6 w-16 h-16 flex items-center justify-center bg-brand-teal text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 z-50"
      aria-label="Add expense"
    >
      <Plus className="w-8 h-8" />
    </Link>
  );
}
