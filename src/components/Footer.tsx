import React from 'react';
import { Logo } from './Logo';
import { useSettings } from '../context/SettingsContext';
import { ShieldCheck, CheckCircle2, Lock, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { websiteSettings } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white/5 inline-block p-2 rounded-xl backdrop-blur-xs">
              <Logo size="md" showTagline={true} />
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              NoteNest is India&apos;s student-friendly digital marketplace for high-yield university study materials. Curated by university toppers and professors for B.Com 1st Semester exams.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1.5 rounded-md border border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Syllabus
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium bg-blue-950/40 px-3 py-1.5 rounded-md border border-blue-800/40">
                <Lock className="w-3.5 h-3.5" /> Secure UPI Verification
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              B.Com 1st Sem Notes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('notes')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Financial Accounting (Units 1 & 2)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notes')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Business Law (Indian Contract Act)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notes')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Principles of Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notes')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Business Economics (Micro)
                </button>
              </li>
            </ul>
          </div>

          {/* Student Help & Admin */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Student Account & Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notes')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  How to Buy via UPI QR
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${websiteSettings.supportEmail}`}
                  className="hover:text-emerald-400 transition-colors block truncate"
                >
                  Email: {websiteSettings.supportEmail}
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Admin Login & Management
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NoteNest. All rights reserved. Built for B.Com Students.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>for academic excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
