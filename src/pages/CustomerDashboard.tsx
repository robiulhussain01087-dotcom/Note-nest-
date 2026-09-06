import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NoteNestDB } from '../services/db';
import { Note, Order, Purchase, Chapter } from '../types';
import { GoogleDriveViewerModal } from '../components/GoogleDriveViewerModal';
import { ChapterContentViewerModal } from '../components/ChapterContentViewerModal';
import {
  User as UserIcon,
  ShoppingBag,
  BookOpen,
  LogOut,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  ArrowRight
} from 'lucide-react';

interface CustomerDashboardProps {
  onSelectNote: (note: Note) => void;
  onExploreNotes: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onSelectNote,
  onExploreNotes,
}) => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'purchases' | 'orders' | 'profile'>('purchases');
  const [selectedNoteForModal, setSelectedNoteForModal] = useState<Note | null>(null);
  const [selectedChapterForModal, setSelectedChapterForModal] = useState<Chapter | null>(null);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading your account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to view your dashboard</h2>
        <p className="text-sm text-slate-600 mb-6">Please log in to check your order history and read your purchased notes.</p>
        <button
          onClick={onExploreNotes}
          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold"
        >
          Explore B.Com Notes
        </button>
      </div>
    );
  }

  const allPurchases = NoteNestDB.getCustomerPurchases(user.uid);
  const allOrders = NoteNestDB.getOrders().filter(o => o.customerId === user.uid);

  const handleDownloadPdf = (note: Note) => {
    if (note.pdfUrl) {
      const a = document.createElement('a');
      a.href = note.pdfUrl;
      a.download = note.pdfFileName || `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}_NoteNest.pdf`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      return;
    }
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
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-400 flex items-center justify-center font-extrabold text-2xl shadow-inner">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Student Account
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-slate-200">
                B.Com Student
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-0.5">{user.name}</h1>
            <p className="text-xs text-slate-300">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onExploreNotes}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Chapters</span>
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'purchases'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Purchased Notes ({allPurchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order History ({allOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Details</span>
        </button>
      </div>

      {/* Tab 1: Purchased Notes (Accessible only when approved) */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          {/* Pending Approval Notice if student has unverified orders */}
          {allOrders.some((o) => o.paymentStatus === 'pending') && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold text-sm text-amber-950">
                  Payment Verification in Progress
                </p>
                <p className="text-amber-800">
                  You have{' '}
                  <span className="font-bold">
                    {allOrders.filter((o) => o.paymentStatus === 'pending').length} order(s)
                  </span>{' '}
                  currently awaiting manual administrator verification. Your study material PDF will unlock and appear in this library immediately once approved.
                </p>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="font-bold underline text-amber-900 hover:text-amber-700 cursor-pointer inline-block mt-1"
                >
                  View Order Verification Status →
                </button>
              </div>
            </div>
          )}

          {allPurchases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPurchases.map((purchase) => {
                const chapter = purchase.chapterId ? NoteNestDB.getChapterById(purchase.chapterId) : null;
                const note = purchase.noteId ? NoteNestDB.getNoteById(purchase.noteId) : null;

                if (chapter) {
                  const isPremium = chapter.accessType === 'premium';
                  return (
                    <div
                      key={purchase.id}
                      className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow ${
                        isPremium ? 'border-amber-200' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                            {chapter.subject}
                          </span>
                          {isPremium ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              <span>👑</span> Premium
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              Normal
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {chapter.educationLevel} • {chapter.classOrCourse} • {chapter.medium}
                        </span>

                        <h3 className="text-base font-bold text-slate-900 line-clamp-2 mt-1">
                          {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : ''}{chapter.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {chapter.description || 'Full unlocked interactive curriculum unit.'}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active Lifetime Access
                          </span>
                          <span>₹{purchase.purchasedPrice}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-2">
                        <button
                          onClick={() => setSelectedChapterForModal(chapter)}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPremium
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs'
                              : 'bg-blue-950 hover:bg-blue-900 text-white shadow-xs'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Interactive Chapter</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                if (!note) return null;

                return (
                  <div
                    key={purchase.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                          {note.subject}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {note.course} {note.semester}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {note.unit}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-blue-900" />
                          {note.pages} Pages
                        </span>
                        <span>Purchased for ₹{purchase.purchasedPrice}</span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => setSelectedNoteForModal(note)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-blue-950 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(note)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No approved purchases yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
                Once you submit your UPI payment for a note and the Admin verifies it, your purchased note PDF will appear here for instant reading.
              </p>
              <button
                onClick={onExploreNotes}
                className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors"
              >
                Browse Available B.Com Notes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Order History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {allOrders.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Note Title</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">UTR / Ref</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          #{ord.id}
                        </td>
                        <td className="p-4 font-medium text-slate-800 max-w-xs truncate">
                          {ord.noteTitle || 'Study Material / Chapter Access'}
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          ₹{ord.amount}
                        </td>
                        <td className="p-4 font-mono text-slate-600">
                          {ord.utr || <span className="text-slate-400 italic">Not submitted</span>}
                        </td>
                        <td className="p-4">
                          {ord.paymentStatus === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved & Unlocked
                            </span>
                          )}
                          {ord.paymentStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Verification Pending
                            </span>
                          )}
                          {ord.paymentStatus === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No orders placed yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b pb-3">
            Account Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Full Name</label>
              <div className="p-3 bg-slate-50 rounded-xl font-semibold text-slate-800 border border-slate-200">
                {user.name}
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Email Address</label>
              <div className="p-3 bg-slate-50 rounded-xl font-semibold text-slate-800 border border-slate-200">
                {user.email}
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Account Role</label>
              <div className="p-3 bg-slate-50 rounded-xl font-semibold text-emerald-700 border border-slate-200 capitalize">
                {user.role} Account
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Registered Since</label>
              <div className="p-3 bg-slate-50 rounded-xl font-semibold text-slate-800 border border-slate-200">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Per-Chapter Access Model Info Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Access Model</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Per-Chapter Purchase
                </span>
              </div>
              <p className="text-xs text-slate-300">
                All study chapters are purchased individually. Once verified by Admin, each unlocked chapter is permanently available in your library.
              </p>
            </div>
            <button
              onClick={onExploreNotes}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
            >
              <span>Browse Chapters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <span className="text-xs text-slate-500">Need help with your notes or payment verification?</span>
            <a
              href="mailto:support@notenest.in"
              className="text-xs font-bold text-blue-900 hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}

      {/* Google Drive PDF Reader Modal */}
      {selectedNoteForModal && (
        <GoogleDriveViewerModal
          note={selectedNoteForModal}
          studentName={user.name}
          studentEmail={user.email}
          onClose={() => setSelectedNoteForModal(null)}
        />
      )}

      {/* Chapter Content Viewer Modal */}
      {selectedChapterForModal && (
        <ChapterContentViewerModal
          chapter={selectedChapterForModal}
          user={user}
          onClose={() => setSelectedChapterForModal(null)}
        />
      )}
    </div>
  );
};
