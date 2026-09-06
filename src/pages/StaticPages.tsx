import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface StaticPageProps {
  page: 'about' | 'contact' | 'refund' | 'privacy' | 'terms';
  onNavigate: (route: string) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page, onNavigate }) => {
  const { websiteSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Subpage Navigator Tabs */}
      <div className="flex border-b border-slate-200 pb-3 mb-8 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold text-slate-500">
        <button
          onClick={() => onNavigate('about')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            page === 'about' ? 'border-blue-900 text-blue-900' : 'border-transparent hover:text-slate-900'
          }`}
        >
          About Us
        </button>
        <button
          onClick={() => onNavigate('contact')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            page === 'contact' ? 'border-blue-900 text-blue-900' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Contact Us
        </button>
        <button
          onClick={() => onNavigate('refund')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            page === 'refund' ? 'border-blue-900 text-blue-900' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Refund Policy
        </button>
        <button
          onClick={() => onNavigate('privacy')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            page === 'privacy' ? 'border-blue-900 text-blue-900' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => onNavigate('terms')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            page === 'terms' ? 'border-blue-900 text-blue-900' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Terms & Conditions
        </button>
      </div>

      {/* ABOUT US */}
      {page === 'about' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              About NoteNest
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">
              Quality Study Notes, Made Simple
            </h1>
          </div>

          <p className="text-sm leading-relaxed">
            <strong>NoteNest</strong> is a digital educational marketplace specifically created to empower undergraduate students. In Version 1, NoteNest delivers syllabus-verified, high-scoring study notes for <strong>B.Com 1st Semester</strong> students across core subjects including Financial Accounting, Business Organization & Management, Microeconomics, and Business Law.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Excellence & Clarity</span>
              </h3>
              <p className="text-xs text-slate-600">
                Created by top university scorers and subject matter experts to simplify complex concepts into crisp point-to-point notes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Affordable for Every Student</span>
              </h3>
              <p className="text-xs text-slate-600">
                Premium notes at budget-friendly student rates, making top-tier exam preparation accessible to everyone.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 pt-4 border-t border-slate-100">
            Our mission: <em>Learn • Prepare • Succeed</em>. We continuously expand syllabus coverage and semester options.
          </p>
        </div>
      )}

      {/* CONTACT US */}
      {page === 'contact' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Get in Touch
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Contact Support</h1>
            <p className="text-xs text-slate-500 mt-1">
              Have questions regarding payment approval, order verification, or note contents? We&apos;re here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
              <Mail className="w-5 h-5 text-blue-900" />
              <h3 className="text-xs font-bold text-slate-900 uppercase">Email Support</h3>
              <p className="text-xs font-mono text-slate-600">{websiteSettings.supportEmail}</p>
              <p className="text-[11px] text-slate-400">Response within 2-4 hours</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase">Payment Inquiries</h3>
              <p className="text-xs text-slate-600">+91 98765 43210</p>
              <p className="text-[11px] text-slate-400">WhatsApp & Call (10 AM - 7 PM)</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <MapPin className="w-5 h-5 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase">Headquarters</h3>
              <p className="text-xs text-slate-600">Educational Hub, Delhi & Bengaluru, India</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Immediate Payment Assistance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your payment verification is pending for more than 30 minutes, simply forward your Order ID and PhonePe/GPay UTR screenshot to our support email, and our admin team will approve it immediately.
            </p>
          </div>
        </div>
      )}

      {/* REFUND POLICY */}
      {page === 'refund' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Transparent Policies
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Refund & Cancellation Policy</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: October 2025</p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <h3 className="text-sm font-bold text-slate-900">1. Nature of Digital Study Materials</h3>
            <p>
              All study notes purchased through NoteNest are digital products delivered in secure PDF format. Once an order is approved by the Admin and the PDF file is unlocked in your account, standard returns are not possible due to the digital nature of the content.
            </p>

            <h3 className="text-sm font-bold text-slate-900">2. Eligible Refund Conditions</h3>
            <p>Refunds are granted under the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Duplicate payment: If you were charged twice for the same note due to a technical error.</li>
              <li>Incorrect note received: If the delivered PDF content does not correspond to the subject/title specified.</li>
              <li>Damaged or corrupt file: If the PDF cannot be opened or rendered on standard PDF readers.</li>
            </ul>

            <h3 className="text-sm font-bold text-slate-900">3. How to Request a Refund</h3>
            <p>
              To request a refund, please contact us at {websiteSettings.supportEmail} with your Order ID, UTR number, and description of the issue within 48 hours of purchase. Approved refunds will be credited back to your original UPI account within 3–5 working days.
            </p>
          </div>
        </div>
      )}

      {/* PRIVACY POLICY */}
      {page === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Your Data Privacy
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: October 2025</p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
            <p>
              When you register on NoteNest, we collect your full name, email address, and account credentials. When placing orders, we record the transaction reference (UTR) submitted by you for manual payment reconciliation.
            </p>

            <h3 className="text-sm font-bold text-slate-900">2. How We Use Your Data</h3>
            <p>
              Your data is exclusively used to grant and verify access to your purchased notes, communicate order updates, and safeguard against fraudulent account activity. We never sell or share student details with third-party marketers.
            </p>

            <h3 className="text-sm font-bold text-slate-900">3. PDF Security & Watermarking</h3>
            <p>
              Purchased notes may embed an authorized student license identifier (name and email) on document pages to prevent illegal distribution while ensuring your legitimate access is protected.
            </p>
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS */}
      {page === 'terms' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Terms of Use
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Terms & Conditions</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: October 2025</p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <h3 className="text-sm font-bold text-slate-900">1. Platform Usage</h3>
            <p>
              By accessing NoteNest, you agree to comply with these terms. You must provide genuine information during registration and payment UTR submission.
            </p>

            <h3 className="text-sm font-bold text-slate-900">2. Single-User Personal License</h3>
            <p>
              All purchased study notes are provided under an exclusive single-user educational license for personal academic study. Reselling, uploading to public drives, or unauthorized redistribution of NoteNest materials is strictly prohibited.
            </p>

            <h3 className="text-sm font-bold text-slate-900">3. Payment Verification Protocol</h3>
            <p>
              Under our manual UPI checkout mechanism, access is granted upon verification of the customer&apos;s UTR number by NoteNest administration. Providing fake or fabricated transaction references will result in immediate account suspension.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
