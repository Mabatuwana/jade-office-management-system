import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Sun,
  Moon,
  UploadCloud,
  Cloud,
  ChevronDown,
  User as UserIcon,
  Key,
  LogOut,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenUploadModal: () => void;
  onOpenCropModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenUploadModal,
  onOpenCropModal,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-6 liquid-glass-navbar">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/5 border border-transparent hover:border-white/20 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Live Drive Status Badge */}
        <div className="hidden items-center gap-2 rounded-full liquid-glass-pill px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 sm:flex">
          <Cloud className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Google Drive Cloud Active</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Upload Action */}
        <button
          onClick={onOpenUploadModal}
          className="liquid-glass-btn-primary flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-95"
        >
          <UploadCloud className="h-4 w-4" />
          <span className="hidden md:inline">Upload Document</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative rounded-xl p-2 text-slate-600 transition hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5 border border-transparent hover:border-white/20 backdrop-blur-sm"
          title={`Switch to ${theme === 'LIGHT' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'LIGHT' ? (
            <Moon className="h-4 w-4 text-charcoal-700" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-2xl p-1.5 transition hover:bg-white/60 dark:hover:bg-white/5 border border-transparent hover:border-white/20 backdrop-blur-sm"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-jade-500/50 shadow-sm"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-jade-600 to-jade-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="hidden text-left text-xs font-medium sm:block">
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                {user.name}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                {user.department}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl liquid-glass-card p-2.5 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="border-b border-white/15 dark:border-white/10 px-3 py-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>

                <div className="py-1.5 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10 transition"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    Profile & Theme
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCropModal();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-jade-700 hover:bg-jade-50/80 dark:text-jade-400 dark:hover:bg-jade-950/40 transition"
                  >
                    <UploadCloud className="h-4 w-4 text-jade-600 dark:text-jade-400" />
                    Update Avatar (Google Drive)
                  </button>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10 transition"
                  >
                    <Key className="h-4 w-4 text-slate-400" />
                    Change Password
                  </Link>
                </div>

                <div className="border-t border-white/15 dark:border-white/10 pt-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
