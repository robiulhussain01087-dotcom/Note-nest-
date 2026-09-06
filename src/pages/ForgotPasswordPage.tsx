import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onBackToHome?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onBackToHome
}) => {
  const { sendPasswordReset, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    console.log('[AUTH] Send Reset Link button clicked');
    setLoading(true);

    try {
      const res = await sendPasswordReset(cleanEmail);
      if (res.success) {
        setSuccessMsg('Password reset link has been sent to your email. Please check your inbox and spam folder.');
      } else {
        setErrorMsg(res.error || 'Failed to send password reset email. Please try again.');
      }
    } catch (err: any) {
      console.error('[AUTH] Send password reset exception:', err);
      setErrorMsg(err?.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Navigation Breadcrumb */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to NoteNest</span>
          </button>
        )}

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Logo size="md" showTagline={false} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Enter your registered email address and Firebase Authentication will send you a password reset link.
            </p>
          </div>

          {!isConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Firebase Authentication Setup Required</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Password recovery requires Firebase Authentication. Please ensure Firebase configuration is valid.
              </p>
            </div>
          )}

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg ? (
            <div className="space-y-5">
              <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-2 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-black text-sm text-emerald-900">
                  Reset Link Dispatched
                </div>
                <p className="text-[12px] text-emerald-800 leading-relaxed font-medium">
                  {successMsg}
                </p>
                <p className="text-[11px] text-emerald-700/80">
                  Open the link in your email to securely choose a new password on NoteNest.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 active:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address
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
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-900 outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Works for both student customer accounts and administrator accounts.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 active:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Reset Link via Firebase...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNavigateLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
