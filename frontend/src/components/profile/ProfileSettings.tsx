import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authApi } from '../../services/api';
import {
  User as UserIcon,
  Moon,
  Sun,
  Key,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderSync,
} from 'lucide-react';

interface ProfileSettingsProps {
  onOpenCropModal: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onOpenCropModal }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setPwdSubmitting(true);
      setPwdError(null);
      await authApi.changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(null), 3500);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Account Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal credentials, dark/light theme, and Google Drive avatar synchronization
        </p>
      </div>

      {/* Avatar & Profile Card */}
      <div className="liquid-glass rounded-3xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Profile Information
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Crop Trigger */}
          <div className="relative group">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-jade-500/30 shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-jade-600 to-emerald-500 text-white text-2xl font-bold ring-4 ring-jade-500/30 shadow-lg">
                {user.name.charAt(0)}
              </div>
            )}
            <button
              onClick={onOpenCropModal}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition duration-200 backdrop-blur-xs"
              title="Crop & Upload new photo to Google Drive"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="liquid-glass-pill rounded-full px-3 py-1 text-xs font-semibold text-jade-700 dark:text-jade-300">
                Role: {user.role.replace(/_/g, ' ')}
              </span>
              <span className="rounded-full border border-slate-200/80 bg-white/40 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-charcoal-800/40 dark:text-slate-300 backdrop-blur-md">
                Department: {user.department}
              </span>
            </div>
            {user.driveAvatarId && (
              <p className="pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                <FolderSync className="h-3.5 w-3.5" />
                <span>Avatar synced to Google Drive (ID: {user.driveAvatarId})</span>
              </p>
            )}
          </div>

          <button
            onClick={onOpenCropModal}
            className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:text-jade-600 dark:border-white/10 dark:bg-charcoal-800/50 dark:text-slate-200 dark:hover:bg-charcoal-700 backdrop-blur-md"
          >
            <Camera className="h-4 w-4 text-jade-600 dark:text-jade-400" />
            <span>Update Avatar</span>
          </button>
        </div>
      </div>

      {/* Theme Preference Card */}
      <div className="liquid-glass rounded-3xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          System Theme Mode
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Select your preferred workspace aesthetic. Choice is preserved across devices and sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <button
            onClick={() => setTheme('LIGHT')}
            className={`flex items-center gap-3 rounded-2xl p-4 text-left transition ${
              theme === 'LIGHT'
                ? 'liquid-glass border-jade-500/80 ring-2 ring-jade-500/30 shadow-md'
                : 'border border-slate-200/80 bg-white/40 hover:bg-white/70 dark:border-white/10 dark:bg-charcoal-800/40 dark:hover:bg-charcoal-800/70'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30 backdrop-blur-md">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Clean Light Mode</p>
              <p className="text-[11px] text-slate-500">White liquid glass with Jade accents</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('DARK')}
            className={`flex items-center gap-3 rounded-2xl p-4 text-left transition ${
              theme === 'DARK'
                ? 'liquid-glass border-jade-500/80 ring-2 ring-jade-500/30 shadow-md'
                : 'border border-slate-200/80 bg-white/40 hover:bg-white/70 dark:border-white/10 dark:bg-charcoal-800/40 dark:hover:bg-charcoal-800/70'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-900/60 text-jade-400 border border-white/10 backdrop-blur-md">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Midnight Charcoal</p>
              <p className="text-[11px] text-slate-500">Charcoal glass with soft luminescence</p>
            </div>
          </button>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="liquid-glass rounded-3xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Key className="h-4 w-4 text-jade-600 dark:text-jade-400" />
          Update Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ensure your account uses a strong, secure passphrase.
        </p>

        {pwdError && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400 backdrop-blur-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 backdrop-blur-md">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="liquid-glass-input w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="liquid-glass-input w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="liquid-glass-input w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pwdSubmitting}
              className="liquid-glass-btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
            >
              {pwdSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Save New Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
