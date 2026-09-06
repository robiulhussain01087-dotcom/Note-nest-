import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  User as UserIcon,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CustomerRegisterPageProps {
  onSuccess?: () => void;
  onRegisterSuccess?: () => void;
  onNavigateLogin: () => void;
  onNavigateHome?: () => void;
  onBackToHome?: () => void;
  onNavigateAdminLogin?: () => void;
}

export const CustomerRegisterPage: React.FC<CustomerRegisterPageProps> = ({
  onSuccess,
  onRegisterSuccess,
  onNavigateLogin,
  onNavigateHome,
  onBackToHome,
  onNavigateAdminLogin,
}) => {
  const { registerCustomer, isConfigured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHomeClick = () => {
    if (onBackToHome) onBackToHome();
    else if (onNavigateHome) onNavigateHome();
  };

  const handleSuccess = () => {
    if (onRegisterSuccess) onRegisterSuccess();
    else if (onSuccess) onSuccess();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Requirement 9: Prevent duplicate requests
    console.log('[AUTH] login started');
    console.log('[AUTH] Register button clicked');
    console.log('[AUTH] Email submitted:', email.trim());
    setErrorMsg(null);

    // Form validations
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password is too weak.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // registerCustomer strictly uses Firebase createUserWithEmailAndPassword() and creates Firestore profile
      const res = await registerCustomer(name.trim(), email.trim(), password);
      if (res.success) {
        console.log('[ROUTE] redirecting to: account');
        handleSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to create student account.');
      }
    } catch (err: any) {
      console.error('[NoteNest Auth] Customer registration error:', err);
      setErrorMsg(err?.message || 'Failed to create customer account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-50 via-white to-blue-50/20 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Navigation back & badge */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleHomeClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to NoteNest</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span>Customer Registration</span>
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
              Create Customer Account
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Join NoteNest to purchase, save, and download B.Com 1st Semester exam-ready study notes.
            </p>
          </div>

          {!isConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Firebase Setup Required</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Registration creates verified Firebase Authentication accounts. Please configure your Firebase credentials in Settings or environment variables.
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

          {/* Registration Form */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-900 outline-none transition-colors"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-900 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Public registration security notice */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Public accounts are strictly registered with the Customer role in Firestore. Customers cannot assign administrator privileges.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>Create Customer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Customer Login */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Already have a NoteNest student account?
            </p>
            <button
              onClick={onNavigateLogin}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50"
            >
              <span>Sign In to Existing Customer Account</span>
            </button>
          </div>

          {/* Discreet Admin Link */}
          {onNavigateAdminLogin && (
            <div className="pt-2 text-center">
              <button
                onClick={onNavigateAdminLogin}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>NoteNest Administrator? Sign in here</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
