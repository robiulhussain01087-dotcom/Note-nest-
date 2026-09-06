import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, User, LayoutDashboard, BookOpen } from 'lucide-react';

interface AccessDeniedPageProps {
  reason: 'customer-restricted' | 'admin-restricted';
  onNavigateHome: () => void;
  onNavigateAccount: () => void;
  onNavigateAdmin: () => void;
  onNavigateNotes: () => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  reason,
  onNavigateHome,
  onNavigateAccount,
  onNavigateAdmin,
  onNavigateNotes,
}) => {
  const { user, logout } = useAuth();

  if (reason === 'customer-restricted') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Access Restricted
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrative Console
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              The NoteNest Admin Dashboard is strictly reserved for authorized administrators. You are currently logged in with a Student Customer account (<span className="font-semibold text-slate-700">{user?.email}</span>).
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onNavigateAccount}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Go to My Student Account (/account)</span>
            </button>

            <button
              onClick={onNavigateNotes}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-emerald-200"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse B.Com Notes</span>
            </button>

            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out to Switch Accounts</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin trying to access customer checkout or account
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-white text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800">
            Administrator Notice
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Customer Area Restricted
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are logged in with the Administrator account (<span className="text-white font-mono">{user?.email}</span>). Note purchasing and customer profiles are reserved for student customer accounts.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onNavigateAdmin}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-black"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Admin Dashboard (/admin)</span>
          </button>

          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out to Sign In as Customer</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
