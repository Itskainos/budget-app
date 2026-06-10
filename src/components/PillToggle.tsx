"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PillToggleProps {
  activeTab: "personal" | "family";
}

export function PillToggle({ activeTab }: PillToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [pendingTab, setPendingTab] = React.useState<"personal" | "family" | null>(null);

  const handleTabClick = (tab: "personal" | "family") => {
    if (activeTab === tab) return;
    setPendingTab(tab);
    startTransition(() => {
      router.push(`/?scope=${tab}`, { scroll: false });
    });
  };

  return (
    <div className="flex bg-surface p-1 rounded-full shadow-sm border border-secondary/5 max-w-[280px] mx-auto relative mt-2 w-full">
      {(["personal", "family"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`flex-1 flex justify-center items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase py-3 rounded-full relative z-10 transition-colors ${
            activeTab === tab ? "text-primary" : "text-secondary hover:text-primary"
          }`}
        >
          {activeTab === tab && (
            <motion.div
              layoutId="pill-active-top"
              className="absolute inset-0 bg-background rounded-full -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span>{tab === "personal" ? "Personal" : "Family Group"}</span>
          {isPending && pendingTab === tab && (
            <Loader2 className="w-3 h-3 animate-spin text-brand-teal" />
          )}
        </button>
      ))}
    </div>
  );
}
