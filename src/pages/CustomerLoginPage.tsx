import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

interface CustomerLoginPageProps {
  onSuccess?: (role?: string) => void;
  onLoginSuccess?: (role?: string) => void;
  onNavigateRegister: () => void;
  onNavigateHome?: () => void;
  onBackToHome?: () => void;
  onNavigateAdminLogin?: () => void;
  onNavigateForgotPassword?: () => void;
}

export const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({
  onSuccess,
  onLoginSuccess,
  onNavigateRegister,
  onNavigateHome,
  onBackToHome,
  onNavigateAdminLogin,
  onNavigateForgotPassword,
}) => {
  const { loginCustomer, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHomeClick = () => {
    if (onBackToHome) onBackToHome();
    else if (onNavigateHome) onNavigateHome();
  };

  const handleSuccess = (role?: string) => {
    if (onLoginSuccess) onLoginSuccess(role);
    else if (onSuccess) onSuccess(role);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Requirement 9: Prevent duplicate requests
    console.log('[AUTH] login started');
    console.log('[AUTH] Login button clicked');
    console.log('[AUTH] Email submitted:', email.trim());
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await loginCustomer(email, password);
      if (res.success) {
        if (res.role === 'admin') {
          console.log('[ADMIN] Redirect: /admin/dashboard');
          handleSuccess('admin');
        } else {
          console.log('[ROUTE] redirecting to: account');
          handleSuccess('customer');
        }
      } else {
        setErrorMsg(res.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('[NoteNest Auth] Login error:', err);
      setErrorMsg(err?.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-50 via-white to-blue-50/20 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleHomeClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to NoteNest</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-full">
            <GraduationCap className="w-3.5 h-3.5 text-blue-800" />
            <span>Customer Portal</span>
          </span>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Logo size="md" showTagline={false} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer Sign In
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Sign in with your Firebase account credentials to access your notes and study materials.
            </p>
          </div>

          {!isConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Firebase Authentication Setup Required</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Authentication is strictly powered by Firebase. Please configure your Firebase Web API keys in Settings or <code className="font-mono bg-amber-100 px-1 rounded">.env</code> to connect to your Firebase project.
              </p>
            </div>
          )}

          {/* Alert messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* STANDARD CUSTOMER LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-900 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {onNavigateForgotPassword && (
                  <button
                    type="button"
                    onClick={onNavigateForgotPassword}
                    className="text-xs font-semibold text-blue-900 hover:text-blue-950 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-900 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 active:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <span>Log In to Customer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Customer Register */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500">
              New to NoteNest?
            </p>
            <button
              onClick={onNavigateRegister}
              className="w-full py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Create Customer Account</span>
            </button>
          </div>

          {/* Discreet Admin Login Link */}
          {onNavigateAdminLogin && (
            <div className="pt-2 text-center">
              <button
                onClick={onNavigateAdminLogin}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Publisher or Staff? Admin Console Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
