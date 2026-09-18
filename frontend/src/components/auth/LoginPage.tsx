import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('md@jade.office');
  const [password, setPassword] = useState('Jade2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleRedirect = (role: string) => {
    switch (role) {
      case 'MANAGING_DIRECTOR':
        navigate('/dashboard/executive');
        break;
      case 'FINANCE_ASSISTANT':
        navigate('/dashboard/finance');
        break;
      case 'OPERATIONAL_MANAGER':
        navigate('/dashboard/operations');
        break;
      case 'TECH_SALES_MANAGER':
        navigate('/dashboard/sales');
        break;
      default:
        navigate('/dashboard/executive');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const loggedInUser = await login(email, password);
      roleRedirect(loggedInUser.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('Jade2026!');
  };

  const demoAccounts = [
    { name: 'Chamikara De Silva', role: 'Managing Director', email: 'md@jade.office', badge: 'bg-emerald-500/20 text-emerald-400' },
    { name: 'Ridmi Kashani', role: 'Operational Manager', email: 'operations@jade.office', badge: 'bg-amber-500/20 text-amber-400' },
    { name: 'Nishan Rajapaksha', role: 'Tech & Sales Manager', email: 'techsales@jade.office', badge: 'bg-purple-500/20 text-purple-400' },
    { name: 'Shani Minoshika', role: 'FA 1: Sales & Officer Registration', email: 'finance1@jade.office', badge: 'bg-blue-500/20 text-blue-400' },
    { name: 'Rashini Fernando', role: 'FA 2: Petty Cash Desk', email: 'finance2@jade.office', badge: 'bg-teal-500/20 text-teal-400' },
    { name: 'Thiwara Dilmini', role: 'FA 3: Collections & Credit Limits', email: 'finance3@jade.office', badge: 'bg-indigo-500/20 text-indigo-400' },
    { name: 'Shalki Subashi', role: 'FA 4: Stock Balance & Invoicing', email: 'finance4@jade.office', badge: 'bg-rose-500/20 text-rose-400' },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0b0f19] p-4 text-slate-100 overflow-hidden">
      {/* Background Liquid Mesh Orbs */}
      <div className="pointer-events-none fixed -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/15 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 left-1/4 h-80 w-80 rounded-full bg-jade-600/15 blur-[100px]" />

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl liquid-glass border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] lg:grid-cols-12">
        {/* Left Form Panel */}
        <div className="p-8 sm:p-10 lg:col-span-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.4)] border border-white/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white">JADE System</h2>
              <p className="text-xs text-charcoal-400">Enterprise Office Management</p>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Sign in to your account</h1>
            <p className="mt-1.5 text-xs text-charcoal-400">
              Enter your corporate credentials to access your departmental workspace.
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="liquid-glass-input w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  placeholder="name@jade.office"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="liquid-glass-input w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="liquid-glass-btn-primary mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-lg shadow-jade-600/25 transition active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-slate-500 text-center">
            Role-Based Access Control Protected • Connected to Google Drive Cloud
          </p>
        </div>

        {/* Right Quick Switcher Panel */}
        <div className="border-t border-white/10 bg-white/[0.02] p-6 sm:p-8 lg:col-span-5 lg:border-t-0 lg:border-l backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              7 Designated User Accounts
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">
            Click any corporate account below to populate credentials:
          </p>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {demoAccounts.map((acc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickSelect(acc.email)}
                className={`w-full text-left rounded-2xl p-3 border transition-all flex items-center justify-between ${
                  email === acc.email
                    ? 'border-emerald-500/80 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'liquid-glass-card hover:bg-white/[0.08]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white">{acc.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{acc.email}</p>
                </div>
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${acc.badge}`}>
                  {acc.role}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-slate-400">
            <span className="font-semibold text-white">Default password:</span>{' '}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-emerald-400">Jade2026!</code>
          </div>
        </div>
      </div>
    </div>
  );
};
