import * as React from "react";
import { PillToggle } from "@/components/PillToggle";
import { DonutChart } from "@/components/DonutChart";
import { CategoryList, CategoryData } from "@/components/CategoryList";
import { getHexColorForCategory, CATEGORY_CONFIG } from "@/lib/categories";
import { FAB } from "@/components/FAB";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { SettingsModal } from "@/components/SettingsModal";
import { TransactionList, Transaction } from "@/components/TransactionList";
import { CalendarView } from "@/components/CalendarView";
import { Leaderboard, LeaderboardMember } from "@/components/Leaderboard";
import { X, ChevronRight, Pencil } from "lucide-react";
import { Pool } from 'pg';
import Link from "next/link";
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { BalanceCard } from "@/components/BalanceCard";
import { MonthPicker } from "@/components/MonthPicker";
import { SendMoneyModal } from "@/components/SendMoneyModal";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  try {
    const params = await searchParams;
  const showModal = params.modal === "add";
  const showSettingsModal = params.modal === "settings";
  const showSendModal = params.modal === "send";
  const activeTab = params.scope === "personal" ? "personal" : "family";
  const settingsError = params.error as string | undefined;
  const settingsSuccess = params.success as string | undefined;
  const activeCategory = params.category as string | undefined;
  const activeUser = params.user as string | undefined;
  const modalType = (params.type as "INCOME" | "EXPENSE") || "EXPENSE";

  // Real Supabase auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const userId = user.id;

  const [userResult, expResult, leaderboardResult, otherUsersResult] = await Promise.all([
    // Get user details
    pool.query(`SELECT name, "avatarUrl", "initialBalance", "balanceUpdatedAt", "pockets", "monthlyLimit" FROM "User" WHERE id = $1`, [userId]),
    // Fetch expenses based on active tab
    activeTab === "family"
      ? pool.query(`SELECT e.id, e.amount, e.category, e.description, e.date, e."userId", e.type, u.name as "userName" FROM "Transaction" e LEFT JOIN "User" u ON e."userId" = u.id WHERE e.scope = 'GROUP' ORDER BY e.date DESC`)
      : pool.query(`SELECT e.id, e.amount, e.category, e.description, e.date, e."userId", e.type, u.name as "userName" FROM "Transaction" e LEFT JOIN "User" u ON e."userId" = u.id WHERE e."userId" = $1 ORDER BY e.date DESC`, [userId]),
    // Fetch leaderboard data only in family group mode
    activeTab === "family"
      ? pool.query(`SELECT u.id, u.name, u."avatarUrl", COALESCE(SUM(e.amount), 0)::float as "totalSpent" FROM "User" u LEFT JOIN "Transaction" e ON u.id = e."userId" AND e.scope = 'GROUP' AND e.type = 'EXPENSE' GROUP BY u.id, u.name, u."avatarUrl" ORDER BY "totalSpent" DESC`)
      : Promise.resolve({ rows: [] }),
    // Fetch all other users for the Send Money modal
    pool.query(`SELECT id, name FROM "User" WHERE id != $1`, [userId])
  ]);

  const username = userResult.rows[0]?.name || user.email?.split('@')[0] || "User";
  const avatarUrl = userResult.rows[0]?.avatarUrl || null;
  const initialBalance = userResult.rows[0]?.initialBalance || 0;
  const balanceUpdatedAt = new Date(userResult.rows[0]?.balanceUpdatedAt || 0);
  const pockets = userResult.rows[0]?.pockets || [];
  const monthlyLimit = parseFloat(userResult.rows[0]?.monthlyLimit || 0);

  const expenses: Transaction[] = expResult.rows;

  const leaderboardMembers: LeaderboardMember[] = leaderboardResult.rows;
  const groupTotalSpent = activeTab === "family" ? leaderboardMembers.reduce((sum, m) => sum + m.totalSpent, 0) : 0;

  // For chart aggregation: show everyone's total in family group, own total in personal
  let myExpenses = activeTab === "family" ? expenses : expenses.filter(e => e.userId === userId);
  
  // Filter by activeUser if clicked on leaderboard
  if (activeTab === "family" && activeUser) {
    myExpenses = myExpenses.filter(e => e.userId === activeUser);
  }

  const otherUsers = otherUsersResult.rows;

  // Calculate Ledger Metrics
  const now = new Date();
  const selectedMonth = params.month ? parseInt(params.month as string, 10) : now.getMonth();
  const selectedYear = params.year ? parseInt(params.year as string, 10) : now.getFullYear();

  const isSelectedMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  };

  const monthlyExpenses = myExpenses.filter(tx => isSelectedMonth(tx.date));

  // Filter expenses by activeCategory if selected (only affects calendar & list on right)
  const filteredExpenses = activeCategory
    ? monthlyExpenses.filter(e => e.category === activeCategory)
    : monthlyExpenses;

  let lifetimeIncome = 0;
  let lifetimeExpense = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  myExpenses.forEach(tx => {
    const d = new Date(tx.date);
    const inSelectedMonth = isSelectedMonth(tx.date);

    if (tx.type === 'INCOME' || tx.type === 'TRANSFER_IN') {
      if (d >= balanceUpdatedAt) lifetimeIncome += tx.amount;
      if (inSelectedMonth) monthlyIncome += tx.amount;
    } else if (tx.type === 'EXPENSE' || tx.type === 'TRANSFER_OUT') {
      if (d >= balanceUpdatedAt) lifetimeExpense += tx.amount;
      if (inSelectedMonth) monthlyExpense += tx.amount;
    }
  });

  const totalBalance = initialBalance + lifetimeIncome - lifetimeExpense;

  // Aggregate totals by category (EXPENSE ONLY for the Donut Chart)
  const INCOME_KEYS = ['Salary', 'Dev Projects', 'Investment Returns', 'Transfer', 'Refund / Other'];
  const EXPENSE_KEYS = Object.keys(CATEGORY_CONFIG).filter(k => !INCOME_KEYS.includes(k));
  const initialTotals = EXPENSE_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<string, number>);

  const categoryTotals = monthlyExpenses
    .filter(exp => exp.type === 'EXPENSE')
    .reduce((acc: Record<string, number>, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, initialTotals);

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
          {/* Left: Metrics + Donut + Leaderboard + Categories */}
          <div className="flex flex-col gap-6">

            {/* Time Traveling Month Picker */}
            <React.Suspense fallback={<div className="h-[60px]" />}>
              <MonthPicker month={selectedMonth} year={selectedYear} />
            </React.Suspense>

            <section className="flex flex-col gap-4">
              {/* Metric Card (Personal Only) - Cash App Inspired */}
              {activeTab === "personal" && (
                <BalanceCard totalBalance={totalBalance} pockets={pockets} />
              )}

              {/* Donut Chart */}
              <div className="flex justify-center md:sticky md:top-8 z-10 w-full mt-2">
                <div className="w-full max-w-md bg-surface p-6 rounded-[2rem] shadow-sm border border-secondary/5">
                  <DonutChart data={donutData} total={totalSpent} />
                  
                  {/* Monthly Budget Progress Bar */}
                  {monthlyLimit > 0 && activeTab === "personal" && (
                    <div className="mt-6 pt-6 border-t border-secondary/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-secondary uppercase tracking-widest">Monthly Budget</span>
                        <span className="text-[12px] font-black text-primary">
                          {Math.round((monthlyExpense / monthlyLimit) * 100)}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-secondary/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${monthlyExpense > monthlyLimit ? 'bg-brand-coral' : 'bg-brand-teal'}`}
                          style={{ width: `${Math.min((monthlyExpense / monthlyLimit) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold text-primary">Rs. {monthlyExpense.toLocaleString()}</span>
                        <span className="text-xs font-semibold text-secondary">of Rs. {monthlyLimit.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Leaderboard - Only visible in Family Group view */}
            {activeTab === "family" && leaderboardMembers.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Leaderboard 
                  members={leaderboardMembers} 
                  totalSpent={groupTotalSpent} 
                  activeUser={activeUser}
                  transactions={monthlyExpenses}
                  currentUserId={userId}
                />
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
                transactions={monthlyExpenses}
                currentUserId={userId}
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
      
      {showModal && <AddTransactionModal activeTab={activeTab} defaultType={modalType} />}
      {showSendModal && <SendMoneyModal users={otherUsers} />}
      {showSettingsModal && (
        <SettingsModal 
          username={username} 
          avatarUrl={avatarUrl} 
          monthlyLimit={monthlyLimit}
          error={settingsError}
          success={settingsSuccess}
        />
      )}
    </div>
  );
  } catch (err: any) {
    return (
      <div className="p-8 text-red-500 font-mono">
        <h1>Server Error</h1>
        <pre>{err?.message || String(err)}</pre>
        <pre>{err?.stack}</pre>
      </div>
    );
  }
}
