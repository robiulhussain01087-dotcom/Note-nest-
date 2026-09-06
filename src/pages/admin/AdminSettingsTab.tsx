import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AdminService } from '../../services/adminService';
import { Logo } from '../../components/Logo';
import {
  QR_CODE_OPTIONS,
  NOTENEST_OFFICIAL_LOGO,
  getActiveQrCodePath
} from '../../utils/assetService';
import {
  Image as ImageIcon,
  QrCode,
  Smartphone,
  Save,
  CheckCircle2,
  Database,
  Key,
  ShieldCheck,
  ExternalLink,
  Info,
  User,
  Mail,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

interface AdminSettingsTabProps {
  filterSection?: 'all' | 'profile' | 'payment' | 'website';
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ filterSection = 'all' }) => {
  const { user, isAdmin } = useAuth();
  const { websiteSettings, paymentSettings, updateWebsiteSettings, updatePaymentSettings, setActiveQrCode } = useSettings();

  // Branding states
  const [siteName, setSiteName] = useState(websiteSettings.siteName);
  const [tagline, setTagline] = useState(websiteSettings.tagline);
  const [supportEmail, setSupportEmail] = useState(websiteSettings.supportEmail);
  const [phone, setPhone] = useState(websiteSettings.phone || '+91 98765 43210');
  const [primaryCourse, setPrimaryCourse] = useState(websiteSettings.primaryCourse || 'B.Com');
  const [primarySemester, setPrimarySemester] = useState(websiteSettings.primarySemester || '1st Semester');
  const [brandingSaved, setBrandingSaved] = useState(false);

  // Active QR selection state (qr-1 | qr-2 | qr-3)
  const initialQr = (paymentSettings.activeQrCode === 'qr-2' || paymentSettings.activeQrCode === 'qr-3')
    ? paymentSettings.activeQrCode
    : 'qr-1';
  const [selectedActiveQr, setSelectedActiveQr] = useState<'qr-1' | 'qr-2' | 'qr-3'>(initialQr);
  const [savingQr, setSavingQr] = useState(false);
  const [qrSavedSuccess, setQrSavedSuccess] = useState(false);

  // General payment configuration states
  const [upiId, setUpiId] = useState(paymentSettings.upiId);
  const [accountName, setAccountName] = useState(paymentSettings.accountName);
  const [instructions, setInstructions] = useState(paymentSettings.instructions);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const [operationError, setOperationError] = useState<string | null>(null);

  // Copy UID helper
  const [copiedUid, setCopiedUid] = useState(false);

  // Load settings from Firestore on startup
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const settings = await AdminService.fetchSettings();
        if (!isMounted) return;
        if (settings) {
          if (settings.activeQrCode) {
            setSelectedActiveQr(settings.activeQrCode);
          }
          if (settings.upiId) setUpiId(settings.upiId);
          if (settings.accountName) setAccountName(settings.accountName);
          if (settings.instructions) setInstructions(settings.instructions);
          if (settings.siteName) setSiteName(settings.siteName);
          if (settings.tagline) setTagline(settings.tagline);
          if (settings.supportEmail) setSupportEmail(settings.supportEmail);
          if (settings.phone) setPhone(settings.phone);
          if (settings.primaryCourse) setPrimaryCourse(settings.primaryCourse);
          if (settings.primarySemester) setPrimarySemester(settings.primarySemester);
        }
      } catch (err) {
        console.warn('[AdminSettingsTab] Error loading initial settings from Firestore:', err);
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  // 1. SAVE ACTIVE QR CODE SELECTION TO FIRESTORE
  const handleSaveActiveQr = async () => {
    if (!isAdmin || user?.role !== 'admin') {
      setOperationError('Access Denied: Only authenticated administrators can change the active QR code.');
      return;
    }

    setSavingQr(true);
    setOperationError(null);
    try {
      await setActiveQrCode(selectedActiveQr, user?.email);
      setQrSavedSuccess(true);
      setTimeout(() => setQrSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('[AdminSettingsTab] Error saving active QR:', err);
      setOperationError(err?.message || 'Failed to persist active QR code in Firestore.');
    } finally {
      setSavingQr(false);
    }
  };

  // 2. SAVE BRANDING SETTINGS
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || user?.role !== 'admin') {
      setOperationError('Access Denied: Only administrators can save branding settings.');
      return;
    }
    setOperationError(null);
    try {
      await updateWebsiteSettings(
        {
          logoUrl: NOTENEST_OFFICIAL_LOGO,
          siteName,
          tagline,
          supportEmail,
          phone,
          primaryCourse,
          primarySemester
        },
        user?.email
      );
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 3000);
    } catch (err: any) {
      console.error('[AdminSettingsTab] Error saving branding:', err);
      setOperationError('Failed to save website branding to Firestore.');
    }
  };

  // 3. SAVE PAYMENT INSTRUCTIONS & GENERAL UPI DETAILS
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || user?.role !== 'admin') {
      setOperationError('Access Denied: Only administrators can save payment settings.');
      return;
    }
    setSavingPayment(true);
    setOperationError(null);
    try {
      await updatePaymentSettings(
        {
          upiId,
          accountName,
          instructions,
          activeQrCode: selectedActiveQr,
          qrCodeUrl: getActiveQrCodePath(selectedActiveQr)
        },
        user?.email
      );
      setPaymentSaved(true);
      setTimeout(() => setPaymentSaved(false), 3000);
    } catch (err: any) {
      console.error('[AdminSettingsTab] Error saving payment settings:', err);
      setOperationError('Failed to save payment configuration.');
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Alert Banner */}
      {operationError && (
        <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-200 shadow-xl animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <span>Operation Notice</span>
              </div>
              <p className="font-mono text-[11px] leading-relaxed break-all text-rose-200">{operationError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOperationError(null)}
            className="text-rose-400 hover:text-white font-bold px-2 py-1 cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. ADMIN PROFILE SECTION */}
      {(filterSection === 'all' || filterSection === 'profile') && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Administrator Profile</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authenticated session identity verified via Firebase Auth and Firestore <code className="text-purple-300">/users/{user?.uid || 'admin'}</code>.
              </p>
            </div>
            <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role: Administrator</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-purple-400" /> Name
              </div>
              <div className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Primary Superuser</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-purple-400" /> Email
              </div>
              <div className="text-sm font-bold text-white font-mono truncate">{user?.email || 'admin@notenest.com'}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Firebase Auth Login</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-400" /> Security UID
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs text-slate-300 font-mono truncate">{user?.uid || '—'}</span>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="p-1 text-slate-500 hover:text-white cursor-pointer"
                  title="Copy UID"
                >
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Firestore Primary Key</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-purple-400" /> Security Status
              </div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> RBAC Enforced
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero-Bypass Policy</div>
            </div>
          </div>
        </section>
      )}

      {/* 2. PAYMENT QR SETTINGS (DEDICATED SELECTION INTERFACE) */}
      {(filterSection === 'all' || filterSection === 'payment') && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>Payment QR Settings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select which official UPI QR code is currently active on the customer checkout page. Exactly one QR is active at any time.
              </p>
            </div>
            {qrSavedSuccess && (
              <span className="self-start sm:self-auto text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Active QR Updated in Firestore!
              </span>
            )}
          </div>

          {/* 3 Bundled QR Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QR_CODE_OPTIONS.map((qr) => {
              const isSelected = selectedActiveQr === qr.id;
              const isPersistedActive = (paymentSettings.activeQrCode || 'qr-1') === qr.id;

              return (
                <div
                  key={qr.id}
                  onClick={() => setSelectedActiveQr(qr.id as 'qr-1' | 'qr-2' | 'qr-3')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-4 relative ${
                    isSelected
                      ? 'bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  {/* Active Indicator Badge */}
                  {isPersistedActive && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Live
                    </span>
                  )}

                  {/* Header Title */}
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white">{qr.title}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{qr.beneficiaryName}</p>
                  </div>

                  {/* QR Image Preview */}
                  <div className="p-3.5 bg-white rounded-2xl shadow-md inline-block">
                    <img
                      src={qr.path}
                      alt={qr.title}
                      className="w-40 h-40 object-contain"
                      loading="eager"
                    />
                  </div>

                  {/* UPI Details */}
                  <div className="space-y-1 w-full">
                    <div className="text-[11px] font-mono text-emerald-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 truncate">
                      {qr.upiId}
                    </div>
                  </div>

                  {/* Radio Selector */}
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer pt-1">
                    <input
                      type="radio"
                      name="activeQrCode"
                      checked={isSelected}
                      onChange={() => setSelectedActiveQr(qr.id as 'qr-1' | 'qr-2' | 'qr-3')}
                      className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                    />
                    <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                      Use {qr.title}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Action Control: Save Active QR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div className="text-xs text-slate-400">
              Selected: <strong className="text-white">QR Code {selectedActiveQr.split('-')[1]}</strong> — Saves directly to Firestore <code className="text-emerald-400">/settings/payment</code>
            </div>

            <button
              type="button"
              onClick={handleSaveActiveQr}
              disabled={savingQr}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition-colors"
            >
              {savingQr ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Active QR...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Active QR</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* 3. PAYMENT INSTRUCTIONS & ACCOUNT DETAILS */}
      {(filterSection === 'all' || filterSection === 'payment') && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>UPI Payment Instructions & Beneficiary Details</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure student guidelines and bank beneficiary display shown at NoteNest checkout.
              </p>
            </div>
            {paymentSaved && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instructions Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Admin UPI ID <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="notenest01@ptyes"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Students copy this UPI ID on mobile devices</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Account / Beneficiary Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="NoteNest Education"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Display name for UPI payments</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Step-by-Step Payment Instructions for Students
              </label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="1. Scan the active NoteNest QR code..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPayment}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-colors"
              >
                {savingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Payment Info</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 4. APP SETTINGS & WEBSITE BRANDING */}
      {(filterSection === 'all' || filterSection === 'website') && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <span>App Settings & Website Branding</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize store metadata, primary syllabus course program, tagline, and student support contact info.
              </p>
            </div>
            {brandingSaved && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Branding Saved!
              </span>
            )}
          </div>

          {/* Official NoteNest Permanent Logo Display */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner flex items-center justify-center">
                <img
                  src={NOTENEST_OFFICIAL_LOGO}
                  alt="Official NoteNest Logo"
                  className="h-14 w-auto max-w-[200px] object-contain"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Official NoteNest Logo</h4>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                    Permanent Asset
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Fixed static asset: <code className="text-emerald-300 font-mono text-[11px]">/assets/notenest-logo.png</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Bundled directly with the web application for instant, 100% reliable loading across all client views.
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 text-xs text-slate-400 space-y-1">
              <span className="inline-block text-[11px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                Logo Upload Disabled
              </span>
              <p className="text-[10px] text-slate-500">
                Permanent branding ensures zero broken logos or storage quota issues.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-6">
            {/* App General Configurations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-400 font-bold text-xs uppercase mb-1">Store / Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-xs uppercase mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-xs uppercase mb-1">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-xs uppercase mb-1">Support Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-xs uppercase mb-1">Primary Academic Course</label>
                <input
                  type="text"
                  value={primaryCourse}
                  onChange={(e) => setPrimaryCourse(e.target.value)}
                  placeholder="B.Com"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-xs uppercase mb-1">Default Semester</label>
                <select
                  value={primarySemester}
                  onChange={(e) => setPrimarySemester(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save App Settings
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 5. FIREBASE AUTH & FIRESTORE STATUS */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Database & Security Status</span>
          </h3>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Firestore Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">Firebase Authentication</div>
            <p className="text-slate-400 text-[11px]">
              Strict password checking using Google Firebase Auth SDK. No client-side plaintext password checks.
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">Firestore RBAC Security</div>
            <p className="text-slate-400 text-[11px]">
              Rules deployed at <code className="text-emerald-300">firestore.rules</code> verify <code className="text-emerald-300">role == &quot;admin&quot;</code> before permitting writes to notes, purchases, and order verifications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
