import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  DollarSign,
  Briefcase,
  TrendingUp,
  FolderSync,
  UserCheck,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'MANAGING_DIRECTOR':
        return { label: 'Managing Director', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'FINANCE_ASSISTANT':
        if (user.email === 'finance1@jade.office') return { label: 'FA 1: Sales & Officers', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
        if (user.email === 'finance2@jade.office') return { label: 'FA 2: Petty Cash Desk', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' };
        if (user.email === 'finance3@jade.office') return { label: 'FA 3: Collections & Credit', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
        if (user.email === 'finance4@jade.office') return { label: 'FA 4: Stock & Invoicing', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
        return { label: 'Finance Assistant', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'OPERATIONAL_MANAGER':
        return { label: 'Operations Lead', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'TECH_SALES_MANAGER':
        return { label: 'Tech & Sales Lead', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      default:
        return { label: role, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    }
  };

  const badge = getRoleBadge(user.role);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col liquid-glass-sidebar text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] border border-white/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-lg">
              JADE <span className="text-jade-400 font-semibold text-xs tracking-wider uppercase">Enterprise</span>
            </div>
            <p className="text-[11px] text-slate-400">Office Management</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 my-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-jade-500/60 shadow-md"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-jade-600 to-jade-800 text-white flex items-center justify-center font-semibold text-sm ring-2 ring-jade-500/60 shadow-md">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 mt-0.5 rounded-full border backdrop-blur-sm ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
            Navigation
          </div>

          {/* MD Executive Link */}
          {user.role === 'MANAGING_DIRECTOR' && (
            <NavLink
              to="/dashboard/executive"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border border-white/25'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/5'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Executive Suite</span>
            </NavLink>
          )}

          {/* Finance Section */}
          {(user.role === 'FINANCE_ASSISTANT' || user.role === 'MANAGING_DIRECTOR') && (
            <NavLink
              to="/dashboard/finance"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border border-white/25'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/5'
                }`
              }
            >
              <DollarSign className="h-4 w-4" />
              <span>Finance Workspace</span>
            </NavLink>
          )}

          {/* Operations Section */}
          {(user.role === 'OPERATIONAL_MANAGER' || user.role === 'MANAGING_DIRECTOR') && (
            <NavLink
              to="/dashboard/operations"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border border-white/25'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/5'
                }`
              }
            >
              <Briefcase className="h-4 w-4" />
              <span>Operations Board</span>
            </NavLink>
          )}

          {/* Technical & Sales Section */}
          {(user.role === 'TECH_SALES_MANAGER' || user.role === 'MANAGING_DIRECTOR') && (
            <NavLink
              to="/dashboard/sales"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border border-white/25'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/5'
                }`
              }
            >
              <TrendingUp className="h-4 w-4" />
              <span>Tech & Sales Pipeline</span>
            </NavLink>
          )}

          {/* Google Drive Explorer (Available to All) */}
          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
            Cloud Infrastructure
          </div>

          <NavLink
            to="/drive"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border border-white/25'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/5'
              }`
            }
          >
            <FolderSync className="h-4 w-4 text-jade-400" />
            <span>Google Drive Files</span>
          </NavLink>

          {/* Profile & Settings */}
          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
            Account
          </div>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border border-white/25'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/5'
              }`
            }
          >
            <UserCheck className="h-4 w-4" />
            <span>Profile & Security</span>
          </NavLink>
        </nav>

        {/* Footer with Sign Out */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
          >
            <span className="flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              Sign Out
            </span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </aside>
    </>
  );
};
