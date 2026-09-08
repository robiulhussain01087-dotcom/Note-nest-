import React, { useState } from 'react';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCustomerPurchases } from '../services/ordersRealtime';
import { NoteNestDB } from '../services/db';
import { GoogleDriveViewerModal } from '../components/GoogleDriveViewerModal';
import {
  ArrowLeft,
  FileText,
  ShoppingBag,
  ShieldCheck,
  CheckCircle,
  Eye,
  Lock,
  Download,
  Share2,
  BookOpen,
  Calendar
} from 'lucide-react';

interface NoteDetailPageProps {
  note: Note | null;
  onBack: () => void;
  onBuyNow: (note: Note) => void;
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({
  note,
  onBack,
  onBuyNow,
}) => {
  const { user } = useAuth();
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [showPdfReaderModal, setShowPdfReaderModal] = useState(false);

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Note not found or may have been unlisted.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold"
        >
          Return to Notes Marketplace
        </button>
      </div>
    );
  }

  const { purchases } = useCustomerPurchases(user?.uid);
  const isPurchased = Boolean(
    user && (
      purchases.some(p => (p.noteId === note.id || p.chapterId === note.id) && p.accessStatus !== 'revoked') ||
      NoteNestDB.hasCustomerPurchasedNote(user.uid, note.id)
    )
  );

  const hasOriginalPrice = note.originalPrice && note.originalPrice > note.offerPrice;
  const discountPercent = hasOriginalPrice
    ? Math.round(((note.originalPrice - note.offerPrice) / note.originalPrice) * 100)
    : 0;

  const allPreviewImages = [note.coverImageUrl, ...(note.previewImages || [])];

  const handleDownloadPdf = () => {
    if (!isPurchased || !user) return;
    const content = NoteNestDB.generateSecureNotePDF(note, user.name);
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}_NoteNest.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation & SEO Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-700 hover:text-blue-950 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Notes</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">/</span>
          <span>{note.course}</span>
          <span className="text-slate-400">/</span>
          <span>{note.semester}</span>
          <span className="text-slate-400">/</span>
          <span className="text-emerald-700 font-bold">{note.subject}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cover & Previews */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-16/11 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <img
              src={allPreviewImages[activePreviewIndex] || note.coverImageUrl}
              alt={note.title}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-md shadow-md">
                {discountPercent}% OFF SPECIAL
              </span>
            )}
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>{note.pages} Pages Comprehensive</span>
            </div>
          </div>

          {/* Preview Thumbnails */}
          {allPreviewImages.length > 1 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Sample Preview Pages
              </p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {allPreviewImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activePreviewIndex === idx
                        ? 'border-blue-900 ring-2 ring-blue-900/20 shadow-xs'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security Guarantee Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Protected Digital Learning Guarantee</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full PDF documents are securely stored and encrypted. Direct access is unlocked upon manual UPI payment verification by the Admin.
            </p>
          </div>
        </div>

        {/* Right Column: Details & Pricing */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-blue-900 text-white text-xs font-bold px-2.5 py-0.5 rounded">
                {note.course} • {note.semester}
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded border border-emerald-200">
                {note.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {note.unit}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {note.title}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Student Offer Price
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  ₹{note.offerPrice}
                </span>
                {hasOriginalPrice && (
                  <span className="text-base font-medium text-slate-400 line-through">
                    ₹{note.originalPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {discountPercent}% Savings
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                One-time payment • Lifetime access to PDF study material
              </p>
            </div>

            {/* Action CTA */}
            <div className="shrink-0">
              {isPurchased ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowPdfReaderModal(true)}
                    className="px-5 py-3 rounded-xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Reader</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="px-4 py-3 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Save PDF</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onBuyNow(note)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Buy Now for ₹{note.offerPrice}</span>
                </button>
              )}
            </div>
          </div>

          {/* Details Overview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Note Summary & Syllabus
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {note.description}
            </p>

            {/* Key highlights checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complete unit coverage aligned with B.Com 1st Sem university syllabus</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Includes solved university illustrations & past exam questions</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>High-resolution crisp digital scan, optimized for phone and tablet</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant manual UPI checkout via PhonePe, Paytm, or Google Pay</span>
              </div>
            </div>
          </div>

          {/* Metadata Specs Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 divide-x divide-y sm:divide-y-0 divide-slate-200">
              <div className="p-3">
                <span className="text-slate-400 block font-medium">Pages</span>
                <span className="font-bold text-slate-800 text-sm">{note.pages}</span>
              </div>
              <div className="p-3">
                <span className="text-slate-400 block font-medium">Format</span>
                <span className="font-bold text-slate-800 text-sm">Protected PDF</span>
              </div>
              <div className="p-3">
                <span className="text-slate-400 block font-medium">Course / Sem</span>
                <span className="font-bold text-slate-800 text-sm">{note.course} {note.semester}</span>
              </div>
              <div className="p-3">
                <span className="text-slate-400 block font-medium">Verification</span>
                <span className="font-bold text-emerald-700 text-sm">Admin Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Reader Modal (when student has purchased the note) */}
      {showPdfReaderModal && isPurchased && user && (
        <GoogleDriveViewerModal
          note={note}
          studentName={user.name}
          studentEmail={user.email}
          onClose={() => setShowPdfReaderModal(false)}
        />
      )}
    </div>
  );
};
