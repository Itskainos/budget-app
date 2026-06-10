// Shared category config — no 'use client' so it works in Server Components too
import { 
  ShoppingCart, Zap, BookOpen, Car, ShoppingBag, UtensilsCrossed, 
  HeartPulse, TrendingUp, Gift, Package, 
  Briefcase, Code, ArrowRightLeft, RotateCcw
} from 'lucide-react';
import type { ElementType } from 'react';

export const CATEGORY_CONFIG: Record<string, { icon: ElementType; color: string; hex: string; emoji: string }> = {
  // Income Categories
  'Salary':                { icon: Briefcase,       color: 'bg-brand-teal',    hex: 'var(--brand-teal)',         emoji: '💰' },
  'Dev Projects':          { icon: Code,            color: 'bg-brand-teal',    hex: 'var(--brand-teal)',         emoji: '💻' },
  'Investment Returns':    { icon: TrendingUp,      color: 'bg-brand-teal',    hex: 'var(--brand-teal)',         emoji: '📈' },
  'Transfer':              { icon: ArrowRightLeft,  color: 'bg-brand-teal',    hex: 'var(--brand-teal)',         emoji: '🔄' },
  'Refund / Other':        { icon: RotateCcw,       color: 'bg-brand-teal',    hex: 'var(--brand-teal)',         emoji: '💸' },
  
  // Expense Categories
  'Household & Groceries': { icon: ShoppingCart,    color: 'bg-[#0ea5e9]',     hex: '#0ea5e9',                   emoji: '🛒' }, // Changed to blue to avoid conflict with Deep Teal
  'Utilities & Bills':     { icon: Zap,             color: 'bg-[#3b82f6]',     hex: '#3b82f6',                   emoji: '⚡' },
  'Education & Supplies':  { icon: BookOpen,        color: 'bg-[#a855f7]',     hex: '#a855f7',                   emoji: '📚' },
  'Transport & Auto':      { icon: Car,             color: 'bg-[#f59e0b]',     hex: '#f59e0b',                   emoji: '🚗' },
  'Personal & Shopping':   { icon: ShoppingBag,     color: 'bg-[#ec4899]',     hex: '#ec4899',                   emoji: '🛍️' },
  'Dining & Entertainment':{ icon: UtensilsCrossed, color: 'bg-brand-coral',   hex: 'var(--brand-coral)',        emoji: '🍽️' },
  'Medical & Wellness':    { icon: HeartPulse,      color: 'bg-[#10b981]',     hex: '#10b981',                   emoji: '🩺' },
  'Savings & Investments': { icon: TrendingUp,      color: 'bg-[#6366f1]',     hex: '#6366f1',                   emoji: '📈' },
  'Gifts & Donations':     { icon: Gift,            color: 'bg-[#f97316]',     hex: '#f97316',                   emoji: '🎁' },
  'Miscellaneous':         { icon: Package,         color: 'bg-secondary',     hex: 'var(--secondary)',          emoji: '📦' },
};

const FALLBACK = { icon: Package, color: 'bg-secondary', hex: 'var(--secondary)' };

export const getIconForCategory     = (name: string) => (CATEGORY_CONFIG[name] ?? FALLBACK).icon;
export const getColorForCategory    = (name: string) => (CATEGORY_CONFIG[name] ?? FALLBACK).color;
export const getHexColorForCategory = (name: string) => (CATEGORY_CONFIG[name] ?? FALLBACK).hex;
