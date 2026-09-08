import React, { useState } from 'react';
import { Note, Order, Chapter } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { NoteNestDB } from '../services/db';
import { submitCustomerOrder } from '../services/ordersRealtime';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Upload,
  Crown,
  BookOpen
} from 'lucide-react';

interface CheckoutPageProps {
  note?: Note | null;
  chapter?: Chapter | null;
  chapterId?: string;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  note,
  chapter,
  chapterId,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const { paymentSettings } = useSettings();

  const [order, setOrder] = useState<Order | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const targetChapter = chapter || (chapterId ? NoteNestDB.getChapterById(chapterId) : null);

  const isChapterPurchase = Boolean(targetChapter);
  const isPremiumChapter = targetChapter?.accessType === 'premium';
  const chapterPrice = targetChapter
    ? (typeof targetChapter.price === 'number' && !isNaN(targetChapter.price) && targetChapter.price > 0
        ? targetChapter.price
        : (isPremiumChapter ? 30 : 10))
    : 0;

  const itemTitle = targetChapter
    ? `${isPremiumChapter ? '👑 Premium Chapter' : 'Chapter'}: ${targetChapter.title}`
    : note?.title || 'Study Material';

  const itemPrice = targetChapter
    ? chapterPrice
    : note?.offerPrice || 0;

  const originalPrice = targetChapter
    ? (isPremiumChapter ? Math.max(itemPrice, 60) : Math.max(itemPrice, 20))
    : note?.originalPrice || note?.offerPrice || 0;

  // Initialize order on mount if not already created
  React.useEffect(() => {
    if (!order && user && (note || targetChapter)) {
      const newOrder = NoteNestDB.createOrder({
        customerId: user.uid,
        customerName: user.name,
        customerEmail: user.email,
        noteId: note?.id,
        chapterId: targetChapter?.id,
        noteTitle: itemTitle,
        amount: itemPrice,
        paymentMethod: 'manual_upi'
      });
      setOrder(newOrder);
    }
  }, [note, targetChapter, user, order, itemTitle, itemPrice]);

  if ((!note && !targetChapter) || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Please log in or select a study note or chapter to proceed with payment.</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold cursor-pointer"
        >
          Browse Materials
        </button>
      </div>
    );
  }

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg('Please log in to submit payment proof.');
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid UPI Reference / UTR Number (minimum 6-12 digits).');
      return;
    }

    setSubmitting(true);
    try {
      const canonicalOrderId = order?.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const savedOrder = await submitCustomerOrder({
        orderId: canonicalOrderId,
        customerId: user.uid,
        customerName: user.name || 'Student',
        customerEmail: user.email || '',
        chapterId: targetChapter?.id,
        chapterTitle: targetChapter?.title,
        accessType: targetChapter?.accessType,
        noteId: note?.id || targetChapter?.id || 'chapter-curriculum',
        noteTitle: itemTitle,
        amount: itemPrice,
        paymentMethod: 'manual_upi',
        utr: utrNumber.trim(),
        screenshotUrl: screenshotPreview || undefined
      });

      setOrder(savedOrder);
      setSubmittedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('[CheckoutPage] Error submitting payment proof to Firestore:', err);
      setErrorMsg(err?.message || 'Failed to submit payment proof to database. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </button>

        <div className="text-right">
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
            Manual UPI Checkout
          </span>
        </div>
      </div>

      {submittedSuccess ? (
        /* Payment Submitted State */
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 sm:p-10 shadow-sm text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Order ID: #{order?.id}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Payment Submitted Successfully!
            </h2>
            <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mt-4">
              Your payment is waiting for Admin verification.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-left text-xs space-y-2 text-slate-600 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400">Item:</span>
              <span className="font-semibold text-slate-800 text-right max-w-xs truncate">{itemTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Paid:</span>
              <span className="font-bold text-slate-900">₹{order?.amount ?? itemPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UTR / Ref:</span>
              <span className="font-mono font-bold text-slate-800">{utrNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Status:</span>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Pending Approval</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            As per our security protocol, access will be automatically unlocked in your <strong>&ldquo;My Purchases&rdquo;</strong> section immediately after the admin confirms the UTR transaction.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onSuccess(order?.id || '')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 transition-colors shadow-md"
            >
              Go to My Purchases Dashboard
            </button>
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Browse More Notes
            </button>
          </div>
        </div>
      ) : (
        /* Order Review & Payment Steps */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Order Summary & QR Code */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Order Summary
                </h3>
                {order && (
                  <span className="text-xs font-mono font-bold text-slate-500">
                    #{order.id}
                  </span>
                )}
              </div>

              {targetChapter ? (
                <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isPremiumChapter ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                  }`}>
                    {isPremiumChapter ? <Crown className="w-6 h-6 text-amber-500" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {targetChapter.educationLevel} • {targetChapter.classOrCourse}
                      </span>
                      {isPremiumChapter ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          <span>👑</span> Premium Chapter
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Normal Chapter
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {targetChapter.chapterNumber ? `Chapter ${targetChapter.chapterNumber}: ` : ''}{targetChapter.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {targetChapter.subject} • {targetChapter.medium} Medium
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium mt-1">
                      {isPremiumChapter
                        ? 'Includes PDF notes, video lessons, slides, flashcards, and quizzes.'
                        : 'Includes full official PDF notes.'}
                    </p>
                  </div>
                </div>
              ) : note ? (
                <div className="flex gap-3">
                  <img
                    src={note.coverImageUrl}
                    alt={note.title}
                    className="w-16 h-20 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {note.subject}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mt-1">
                        {note.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {note.pages} Pages PDF • {note.course} {note.semester}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Standard Price:</span>
                  <span className="line-through">₹{originalPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Student Discount:</span>
                  <span>-₹{Math.max(0, originalPrice - itemPrice)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount to Pay:</span>
                  <span className="text-emerald-600">₹{itemPrice}</span>
                </div>
              </div>
            </div>

            {/* UPI QR Code Block */}
            <div className="bg-gradient-to-b from-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Scan with PhonePe, GPay, Paytm, or BHIM</span>
              </div>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
                <img
                  src={paymentSettings.qrCodeUrl}
                  alt="Admin UPI QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Admin Official UPI ID:</span>
                <div className="flex items-center justify-center gap-2 max-w-xs mx-auto bg-white/10 py-2 px-3 rounded-xl border border-white/15">
                  <span className="font-mono font-bold text-sm text-emerald-300 truncate">
                    {paymentSettings.upiId}
                  </span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedUpi && (
                  <p className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                    UPI ID copied to clipboard!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Instructions & Payment Submission Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* Instructions Accordion/Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-900" />
                Payment Instructions
              </h4>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">
                {paymentSettings.instructions}
              </p>
            </div>

            {/* Submission Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Payment Verification
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your 12-digit transaction number after completing payment.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                {/* UTR input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    UPI Reference ID / UTR Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 402918239012"
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 text-sm font-mono font-medium outline-none transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Found in your PhonePe / GPay payment receipt details.
                  </span>
                </div>

                {/* Optional Screenshot */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Screenshot <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 cursor-pointer bg-slate-50 hover:bg-slate-100/70 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-600">Upload Receipt Screenshot</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>

                  {screenshotPreview && (
                    <div className="mt-2.5 flex items-center gap-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                      <img
                        src={screenshotPreview}
                        alt="Receipt preview"
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="font-semibold text-emerald-800">Screenshot attached successfully</span>
                    </div>
                  )}
                </div>

                {/* Submit button from prompt */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Verifying...</span>
                  ) : (
                    <span>Submit Payment</span>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Manual verification within minutes
                </span>
                <span>Protected by NoteNest</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
