import * as React from "react";
import { PillToggle } from "@/components/PillToggle";
import { DonutChart } from "@/components/DonutChart";
import { CategoryList, CategoryData } from "@/components/CategoryList";
import { getHexColorForCategory } from "@/lib/categories";
import { FAB } from "@/components/FAB";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { SettingsModal } from "@/components/SettingsModal";
import { TransactionList, Transaction } from "@/components/TransactionList";
import { CalendarView } from "@/components/CalendarView";
import { Leaderboard, LeaderboardMember } from "@/components/Leaderboard";
import { X } from "lucide-react";
import { Pool } from 'pg';
import Link from "next/link";
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const showModal = params.modal === "add";
  const showSettingsModal = params.modal === "settings";
  const activeTab = params.scope === "personal" ? "personal" : "family";
  const settingsError = params.error as string | undefined;
  const settingsSuccess = params.success as string | undefined;
  const activeCategory = params.category as string | undefined;

  // Real Supabase auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const userId = user.id;

  // Get user details from public.User
  const userResult = await pool.query(
    `SELECT name, "avatarUrl" FROM "User" WHERE id = $1`,
    [userId]
  );
  const username = userResult.rows[0]?.name || user.email?.split('@')[0] || "User";
  const avatarUrl = userResult.rows[0]?.avatarUrl || null;

  // Fetch expenses based on active tab
  let expResult;
  if (activeTab === "family") {
    // Family Group: all group transactions (all members)
    expResult = await pool.query(
      `SELECT e.id, e.amount, e.category, e.description, e.date, e."userId"
       FROM "Expense" e
       WHERE e.scope = 'GROUP'
       ORDER BY e.date DESC`
    );
  } else {
    // Personal: current user's transactions only (both PERSONAL and GROUP)
    expResult = await pool.query(
      `SELECT e.id, e.amount, e.category, e.description, e.date, e."userId"
       FROM "Expense" e
       WHERE e."userId" = $1
       ORDER BY e.date DESC`,
      [userId]
    );
  }
  const expenses: Transaction[] = expResult.rows;

  // Filter expenses by activeCategory if selected (only affects calendar & list on right)
  const filteredExpenses = activeCategory
    ? expenses.filter(e => e.category === activeCategory)
    : expenses;

  // Fetch leaderboard data only in family group mode
  let leaderboardMembers: LeaderboardMember[] = [];
  let groupTotalSpent = 0;
  if (activeTab === "family") {
    const leaderboardResult = await pool.query(
      `SELECT u.id, u.name, u."avatarUrl", COALESCE(SUM(e.amount), 0)::float as "totalSpent"
       FROM "User" u
       LEFT JOIN "Expense" e ON u.id = e."userId" AND e.scope = 'GROUP'
       GROUP BY u.id, u.name, u."avatarUrl"
       ORDER BY "totalSpent" DESC`
    );
    leaderboardMembers = leaderboardResult.rows;
    groupTotalSpent = leaderboardMembers.reduce((sum, m) => sum + m.totalSpent, 0);
  }

  // For chart aggregation: show everyone's total in family group, own total in personal
  const myExpenses = activeTab === "family" ? expenses : expenses.filter(e => e.userId === userId);

  // Aggregate totals by category
  const categoryTotals = myExpenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const donutData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: getHexColorForCategory(name)
  })).sort((a, b) => b.value - a.value);

  const categoryListData: CategoryData[] = Object.entries(categoryTotals).map(([name, spent], idx) => ({
    id: String(idx),
    name,
    spent,
    limit: 50000
  })).sort((a, b) => b.spent - a.spent);

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 inset-x-0 h-[35rem] bg-gradient-to-b from-brand-teal/10 to-transparent -z-10 dark:from-brand-teal/15 pointer-events-none" />

      <main className="pb-24 max-w-5xl mx-auto px-4 md:px-8 pt-6">
        <header className="flex items-center justify-between mt-2 w-full max-w-md mx-auto md:max-w-none">
          <span className="text-[13px] font-bold text-secondary tracking-wide uppercase">
            Overview: <strong className="text-primary tracking-normal">{activeTab === "family" ? "My Household" : "Personal"}</strong>
          </span>
          {/* Avatar — opens settings */}
          <Link href="?modal=settings" scroll={false} className="p-1">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-teal/40 hover:ring-brand-teal transition-all" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal font-bold text-sm ring-2 ring-brand-teal/20 hover:ring-brand-teal/50 transition-all">
                {username[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        </header>

        <PillToggle activeTab={activeTab} />

        {/* Main Desktop Grid */}
        <div className="md:grid md:grid-cols-2 md:gap-12 mt-6 md:mt-10 items-start">
          {/* Left: Donut + Leaderboard + Categories */}
          <div className="flex flex-col gap-6">
            <section className="flex justify-center md:sticky md:top-8 z-10">
              <div className="w-full max-w-md bg-surface p-6 rounded-[2rem] shadow-sm border border-secondary/5">
                <DonutChart data={donutData} total={totalSpent} />
              </div>
            </section>

            {/* Leaderboard - Only visible in Family Group view */}
            {activeTab === "family" && leaderboardMembers.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Leaderboard members={leaderboardMembers} totalSpent={groupTotalSpent} />
              </section>
            )}

            <section>
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-secondary bg-surface px-4 py-1.5 rounded-full border border-secondary/10">Categories</span>
              </div>
              <CategoryList 
                categories={categoryListData} 
                activeCategory={activeCategory} 
                activeTab={activeTab} 
              />
            </section>
          </div>

          {/* Right: Calendar + Day Transactions */}
          <section className="mt-8 md:mt-0">
            <div className="flex justify-between items-center mb-4 px-1 min-h-[36px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-secondary bg-surface px-4 py-1.5 rounded-full border border-secondary/10">Calendar</span>
                
                {/* Active Category Filter Badge */}
                {activeCategory && (
                  <Link
                    href={activeTab === "personal" ? "/?scope=personal" : "/?scope=family"}
                    scroll={false}
                    className="text-[10px] font-extrabold text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal/20 flex items-center gap-1.5 hover:bg-brand-teal/20 transition-all cursor-pointer animate-in fade-in zoom-in-95"
                  >
                    <span>{activeCategory}</span>
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                )}
              </div>
              <span className="text-[11px] text-secondary font-medium pr-2">
                {activeCategory 
                  ? `${filteredExpenses.length} of ${expenses.length} transactions`
                  : `${expenses.length} total transactions`}
              </span>
            </div>
            <CalendarView transactions={filteredExpenses} currentUserId={userId} />
          </section>
        </div>
      </main>

      <FAB />
      
      {showModal && <AddTransactionModal />}
      {showSettingsModal && (
        <SettingsModal 
          username={username} 
          avatarUrl={avatarUrl} 
          error={settingsError}
          success={settingsSuccess}
        />
      )}
    </div>
  );
}
