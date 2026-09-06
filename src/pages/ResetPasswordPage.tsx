import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

interface ResetPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateForgotPassword: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateForgotPassword
}) => {
  const { verifyResetCode, confirmResetPassword } = useAuth();

  // Extraction of oobCode from URL (search query or hash query)
  const [oobCode, setOobCode] = useState<string | null>(null);

  // Verification state: 'checking' | 'valid' | 'invalid'
  const [verificationState, setVerificationState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [targetEmail, setTargetEmail] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form submission states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract oobCode on mount and verify with Firebase
  useEffect(() => {
    let extractedCode: string | null = null;

    try {
      // 1. Check window.location.search
      if (typeof window !== 'undefined' && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        extractedCode = searchParams.get('oobCode');
      }

      // 2. Check window.location.hash if not found in search
      if (!extractedCode && typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        const qIndex = hash.indexOf('?');
        if (qIndex !== -1) {
          const hashParams = new URLSearchParams(hash.slice(qIndex + 1));
          extractedCode = hashParams.get('oobCode');
        }
      }

      // 3. Check window.location.href regex fallback
      if (!extractedCode && typeof window !== 'undefined' && window.location.href) {
        const match = window.location.href.match(/[?&#]oobCode=([^&#]+)/);
        if (match && match[1]) {
          extractedCode = decodeURIComponent(match[1]);
        }
      }
    } catch (parseErr) {
      console.warn('[NoteNest Auth] URL parse error for oobCode:', parseErr);
    }

    if (!extractedCode || !extractedCode.trim()) {
      console.warn('[AUTH] No oobCode present in URL');
      setOobCode(null);
      setVerificationState('invalid');
      setVerifyError('This password reset link is invalid or has expired. Please request a new password reset link.');
      return;
    }

    const cleanCode = extractedCode.trim();
    setOobCode(cleanCode);

    // Call Firebase verifyPasswordResetCode(auth, oobCode)
    let isCancelled = false;
    const verifyCode = async () => {
      setVerificationState('checking');
      setVerifyError(null);
      console.log('[AUTH] Verifying reset link code with Firebase');

      try {
        const res = await verifyResetCode(cleanCode);
        if (isCancelled) return;

        if (res.success && res.email) {
          console.log('[AUTH] Reset link code verified successfully');
          setTargetEmail(res.email);
          setVerificationState('valid');
        } else {
          console.warn('[AUTH] Reset link code verification failed:', res.error);
          setVerificationState('invalid');
          setVerifyError(res.error || 'This password reset link is invalid or has expired. Please request a new password reset link.');
        }
      } catch (err: any) {
        if (isCancelled) return;
        console.error('[AUTH] Reset link code verification exception:', err);
        setVerificationState('invalid');
        setVerifyError('This password reset link is invalid or has expired. Please request a new password reset link.');
      }
    };

    verifyCode();

    return () => {
      isCancelled = true;
    };
  }, [verifyResetCode]);

  // Handle password reset submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading) return;

    setFormError(null);

    // Strict validation per user requirements:
    // 1. Empty password → "Please enter a new password."
    if (!newPassword || !newPassword.trim()) {
      setFormError('Please enter a new password.');
      return;
    }

    // 2. Passwords do not match → "Passwords do not match."
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    // 3. Weak password → "Password is too weak."
    if (newPassword.length < 6) {
      setFormError('Password is too weak.');
      return;
    }

    if (!oobCode) {
      setFormError('This password reset link is invalid or has expired. Please request a new password reset link.');
      return;
    }

    console.log('[AUTH] Change Password button clicked');
    setFormLoading(true);

    try {
      const res = await confirmResetPassword(oobCode, newPassword);
      if (res.success) {
        console.log('[AUTH] Password changed successfully');
        setIsSuccess(true);
        // Clear passwords from component state immediately
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFormError(res.error || 'Failed to update password. Please try again.');
      }
    } catch (err: any) {
      console.error('[AUTH] Reset submission exception:', err);
      setFormError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Logo size="md" showTagline={false} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Set a new secure password for your NoteNest account credentials.
            </p>
          </div>

          {/* 1. CHECKING CODE STATE */}
          {verificationState === 'checking' && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-700">Verifying reset link with Firebase...</span>
              <p className="text-[11px] text-slate-400 text-center max-w-xs">
                Checking action code validity and expiration status.
              </p>
            </div>
          )}

          {/* 2. INVALID / EXPIRED CODE STATE */}
          {verificationState === 'invalid' && (
            <div className="space-y-5">
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-rose-900">Reset Link Expired or Invalid</div>
                    <div className="leading-relaxed font-medium">
                      {verifyError || 'This password reset link is invalid or has expired. Please request a new password reset link.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 active:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Request New Reset Link</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. SUCCESS STATE */}
          {verificationState === 'valid' && isSuccess && (
            <div className="space-y-5">
              <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-black text-sm text-emerald-900">
                  Password changed successfully
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed max-w-xs mx-auto">
                  Your NoteNest account password has been updated in Firebase Authentication. You can now log in using your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 active:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 4. VALID CODE FORM STATE */}
          {verificationState === 'valid' && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {targetEmail && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>
                    Resetting password for <strong className="text-slate-900">{targetEmail}</strong>
                  </span>
                </div>
              )}

              {/* Error Banner */}
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium">{formError}</div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-900 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 active:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password with Firebase...</span>
                    </div>
                  ) : (
                    <>
                      <span>Change Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNavigateLogin}
                  disabled={formLoading}
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
