'use client';

import * as React from 'react';
import { Crown, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export interface LeaderboardMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalSpent: number;
}

export function Leaderboard({
  members,
  totalSpent,
}: {
  members: LeaderboardMember[];
  totalSpent: number;
}) {
  if (members.length === 0) {
    return null;
  }

  // Filter out any members who have 0 spent if desired, or show everyone. Showing everyone is cleaner.
  // The members list is already sorted by totalSpent DESC in SQL, but we can double check or sort here.
  const sortedMembers = [...members].sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="w-full bg-surface p-6 rounded-[2rem] shadow-sm border border-secondary/5 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-primary text-sm tracking-wide uppercase">Leaderboard</h3>
          <p className="text-[10px] text-secondary font-medium uppercase tracking-widest mt-0.5">Whos spent what</p>
        </div>
      </div>

      {/* Leaderboard Rows */}
      <div className="flex flex-col gap-4">
        {sortedMembers.map((member, index) => {
          const percentage = totalSpent > 0 ? (member.totalSpent / totalSpent) * 100 : 0;
          const isWinner = index === 0 && member.totalSpent > 0;

          return (
            <motion.div
              key={member.id}
              layout
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-3">
                {/* Rank number or Gold Crown for #1 */}
                <div className="w-5 flex items-center justify-center">
                  {isWinner ? (
                    <Crown className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                  ) : (
                    <span className="text-xs font-bold text-secondary">{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-secondary/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-teal/15 flex items-center justify-center text-brand-teal font-extrabold text-xs">
                    {member.name[0]?.toUpperCase()}
                  </div>
                )}

                {/* Name */}
                <span className={`text-sm font-semibold ${isWinner ? 'text-primary' : 'text-secondary'}`}>
                  {member.name}
                </span>

                {/* Amount Spent */}
                <span className="ml-auto text-sm font-extrabold text-primary">
                  Rs. {member.totalSpent.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar indicating contribution */}
              <div className="h-1.5 w-full bg-background rounded-full overflow-hidden ml-8 max-w-[calc(100%-2rem)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className={`h-full rounded-full ${
                    isWinner ? 'bg-brand-teal' : 'bg-secondary/20'
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
