'use client';

import * as React from 'react';
import { X, LogOut, UserCircle, Camera, KeyRound, Moon, Sun, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Link from 'next/link';
import { logout, updateProfile, updatePassword } from '@/app/actions';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function ThemeRow() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';
  return (
    <div className="flex items-center justify-between bg-background rounded-2xl px-4 py-3.5 border border-secondary/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
          {isDark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
        </div>
        <div>
          <p className="text-primary font-semibold text-sm">Appearance</p>
          <p className="text-secondary text-[11px]">{isDark ? 'Dark mode' : 'Light mode'}</p>
        </div>
      </div>
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-brand-teal' : 'bg-secondary/20'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export function SettingsModal({
  username,
  avatarUrl,
  monthlyLimit,
  error,
  success,
  budgetLimits,
  scope,
}: {
  username: string;
  avatarUrl: string | null;
  monthlyLimit: number;
  error?: string;
  success?: string;
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [avatarInput, setAvatarInput] = React.useState(avatarUrl || '');
  const [avatarPreview, setAvatarPreview] = React.useState(avatarUrl || '');
  const [limitInput, setLimitInput] = React.useState(String(monthlyLimit || 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-surface w-full max-w-sm rounded-[2rem] shadow-xl border border-secondary/10 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-bold text-primary tracking-tight">Settings</h2>
          <Link href="/" scroll={false} className="p-2 text-secondary hover:text-primary transition-colors bg-background rounded-full">
            <X className="w-5 h-5" />
          </Link>
        </div>

        <div className="overflow-y-auto max-h-[75vh] px-6 pb-6 flex flex-col gap-4">
          {/* Status messages */}
          {error && (
            <div className="bg-brand-coral/10 border border-brand-coral/20 text-brand-coral text-sm font-semibold p-3 rounded-2xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-sm font-semibold p-3 rounded-2xl text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> {success}
            </div>
          )}

          {/* Profile Section */}
          <div className="flex flex-col items-center gap-3 py-2">
            {/* Avatar */}
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={username}
                  onError={() => setAvatarPreview('')}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-teal/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand-teal/10 flex items-center justify-center ring-4 ring-brand-teal/20">
                  <span className="text-4xl font-extrabold text-brand-teal">{username[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-primary">{username}</p>
              <p className="text-secondary text-xs">Family Member</p>
            </div>
          </div>

          {/* Profile Form */}
          <form
            action={async (fd) => {
              toast.promise(updateProfile(fd), {
                loading: 'Saving...',
                success: 'Profile updated!',
                error: 'Failed to update profile.',
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-secondary ml-1">Profile Picture URL</label>
                <input
                  name="avatarUrl"
                  type="url"
                  value={avatarInput}
                  onChange={(e) => {
                    setAvatarInput(e.target.value);
                    setAvatarPreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full bg-background border border-secondary/10 rounded-2xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-brand-teal transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-secondary ml-1">Monthly Spending Budget</label>
                <div className="flex gap-2">
                  <span className="flex items-center justify-center bg-secondary/10 px-4 rounded-2xl font-bold text-primary">Rs.</span>
                  <input
                    name="monthlyLimit"
                    type="number"
                    step="any"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    placeholder="0"
                    className="w-full bg-background border border-secondary/10 rounded-2xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 bg-brand-teal text-white font-bold px-4 py-3 rounded-2xl hover:opacity-90 transition-opacity text-sm"
              >
                Save Profile
              </button>
            </div>
          </form>

          {/* Theme Toggle */}
          <ThemeRow />

          {/* Change Password */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-between w-full bg-background rounded-2xl px-4 py-3.5 border border-secondary/5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-primary font-semibold text-sm">Change Password</p>
                  <p className="text-secondary text-[11px]">Update your login password</p>
                </div>
              </div>
              {showPassword ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
            </button>

            <AnimatePresence initial={false}>
              {showPassword && (
                <motion.form
                  action={updatePassword}
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex flex-col gap-3 bg-background rounded-2xl p-4 border border-secondary/5 overflow-hidden"
                >
                  <input
                    name="newPassword"
                    type="password"
                    required
                    placeholder="New password"
                    minLength={6}
                    className="w-full bg-surface border border-secondary/10 rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-brand-teal transition-colors"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm new password"
                    minLength={6}
                    className="w-full bg-surface border border-secondary/10 rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-brand-teal transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    Update Password
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-brand-coral/10 text-brand-coral hover:bg-brand-coral hover:text-white font-bold py-4 rounded-2xl transition-all border border-brand-coral/20 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
