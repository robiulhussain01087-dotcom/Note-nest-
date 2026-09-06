import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onExit: () => void;
  onNavigateForgotPassword?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExit, onNavigateForgotPassword }) => {
  const { user, isCustomer, loginAdmin, isConfigured, profileError, reloadProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Requirement 9: Prevent duplicate requests
    console.log('[AUTH] login started');
    console.log('[AUTH] Login button clicked');
    console.log('[AUTH] Email submitted:', email.trim());
    setErrorMsg(null);
    setLoading(true);

    console.log('[AdminLogin Diagnostic] Attempting loginAdmin for:', email.trim());
    console.log('[AdminLogin Diagnostic] current pathname:', window.location.pathname, 'hash:', window.location.hash);

    try {
      // Strictly uses loginAdmin with real Firebase Authentication & Firestore role verification
      const res = await loginAdmin(email.trim(), password);

      if (res.success) {
        console.log('[AdminLogin Diagnostic] loginAdmin returned success=true, invoking onSuccess callback');
        console.log('[ROUTE] redirecting to: admin/dashboard');
        onSuccess();
      } else {
        console.log('[AdminLogin Diagnostic] exact condition that causes navigation(\'/admin/login\') / staying on login:', res.error);
        setErrorMsg(res.error || 'Authentication failed. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('[AdminLogin Diagnostic] Unhandled error during admin login:', err);
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative text-white font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Return to Storefront */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to NoteNest Storefront</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Restricted Console</span>
          </span>
        </div>

        {/* High-security Card Container */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Authorized personnel only. Authenticate via Firebase with administrator privileges to access the NoteNest console.
            </p>
          </div>

          {!isConfigured && (
            <div className="p-3 bg-amber-950/40 border border-amber-800 text-amber-300 rounded-2xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Firebase Authentication Required</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                NoteNest requires active Firebase Authentication credentials. Please configure your Firebase credentials in Settings or environment variables.
              </p>
            </div>
          )}

          {user && isCustomer && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/80 text-blue-300 rounded-2xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-200">
                <span>Account Switcher</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Currently logged in as student customer (<span className="font-mono text-white">{user.email}</span>). Authenticate below with your administrator credentials to switch to the admin console.
              </p>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 bg-amber-950/70 border border-amber-800 text-amber-300 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-amber-200">Database Profile Notice</div>
                <div className="text-[11px] leading-relaxed text-slate-300 break-words">{profileError}</div>
                <button
                  type="button"
                  onClick={() => reloadProfile()}
                  className="mt-1 text-[11px] font-bold text-amber-300 underline hover:text-amber-100 cursor-pointer"
                >
                  Retry verification
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* ADMIN LOGIN FORM */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@notenest.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Admin Password
                </label>
                {onNavigateForgotPassword && (
                  <button
                    type="button"
                    onClick={onNavigateForgotPassword}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Firebase Authentication and Cloud Firestore security rules strictly enforce role validation. Accounts with customer roles are automatically denied access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
