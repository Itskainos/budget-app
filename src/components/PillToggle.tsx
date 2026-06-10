"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface PillToggleProps {
  activeTab: "personal" | "family";
}

export function PillToggle({ activeTab }: PillToggleProps) {
  return (
    <div className="flex bg-surface p-1 rounded-full shadow-sm border border-secondary/5 max-w-[280px] mx-auto relative mt-2 w-full">
      {(["personal", "family"] as const).map((tab) => (
        <Link
          key={tab}
          href={`/?scope=${tab}`}
          scroll={false}
          className={`flex-1 text-center text-[11px] font-bold tracking-widest uppercase py-3 rounded-full relative z-10 transition-colors block ${
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
          {tab === "personal" ? "Personal" : "Family Group"}
        </Link>
      ))}
    </div>
  );
}
