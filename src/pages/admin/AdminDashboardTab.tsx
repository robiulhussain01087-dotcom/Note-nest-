import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import { User, Note, Order, Purchase, Group, Chapter } from '../../types';
import {
  FileText,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  IndianRupee,
  ArrowRight,
  Check,
  X,
  Plus,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  PackageCheck,
  Layers,
  Crown,
  Zap,
  BookOpen
} from 'lucide-react';

interface AdminDashboardTabProps {
  onGoToGroups?: () => void;
  onGoToUsers: () => void;
  onGoToNotes: () => void;
  onGoToOrders: () => void;
  onGoToPurchases: () => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  onGoToGroups,
  onGoToUsers,
  onGoToNotes,
  onGoToOrders,
  onGoToPurchases
}) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [fetchedUsers, fetchedGroups, fetchedChapters, fetchedOrders, fetchedPurchases] = await Promise.all([
          AdminService.fetchUsers(),
          AdminService.fetchGroups(),
          AdminService.fetchChapters(),
          AdminService.fetchOrders(),
          AdminService.fetchPurchases()
        ]);
        if (isMounted) {
          setUsers(fetchedUsers);
          setGroups(fetchedGroups);
          setChapters(fetchedChapters);
          setOrders(fetchedOrders);
          setPurchases(fetchedPurchases);
        }
      } catch (err) {
        console.warn('[AdminDashboard] Error loading data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const customers = users.filter(u => u.role === 'customer');
  const normalChapters = chapters.filter(c => c.accessType !== 'premium');
  const premiumChapters = chapters.filter(c => c.accessType === 'premium');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
  const approvedSales = orders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'successful');
  const totalRevenue = approvedSales.reduce((sum, o) => sum + (o.amount || 0), 0);

  // Recent registered users (last 5)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  // Recent payment verification requests (pending or recent verifications)
  const recentVerificationRequests = orders
    .filter(o => o.paymentStatus === 'pending' || Boolean(o.utr))
    .slice(0, 6);

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleQuickApprove = async (orderId: string) => {
    const updated = await AdminService.verifyOrder(orderId, 'paid', 'Admin Dashboard Quick Verify');
    if (updated) {
      setOrders(await AdminService.fetchOrders());
      setPurchases(await AdminService.fetchPurchases());
    }
  };

  const handleQuickReject = async (orderId: string) => {
    const updated = await AdminService.verifyOrder(orderId, 'rejected', 'Admin Dashboard Quick Verify', 'Amount mismatch or unconfirmed UTR');
    if (updated) {
      setOrders(await AdminService.fetchOrders());
    }
  };

  const statCards = [
    {
      title: 'Total Groups',
      value: groups.length,
      desc: `${groups.filter(g => g.active).length} Active Groups`,
      icon: Layers,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      action: onGoToGroups || onGoToNotes
    },
    {
      title: 'Total Chapters',
      value: chapters.length,
      desc: `${chapters.filter(c => c.published).length} Published to Store`,
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      action: onGoToNotes
    },
    {
      title: 'Normal Chapters',
      value: normalChapters.length,
      desc: 'High-yield PDF chapters',
      icon: Zap,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      action: onGoToNotes
    },
    {
      title: '👑 Premium Chapters',
      value: premiumChapters.length,
      desc: 'Notes + Video, Slides, Quiz',
      icon: Crown,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      action: onGoToNotes
    },
    {
      title: 'Pending Approvals',
      value: pendingOrders.length,
      desc: 'Awaiting UTR verification',
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      highlight: pendingOrders.length > 0,
      action: onGoToOrders
    },
    {
      title: 'Verified Purchases',
      value: purchases.length,
      desc: `${approvedSales.length} approved orders`,
      icon: PackageCheck,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      action: onGoToPurchases
    },
    {
      title: 'Registered Users',
      value: users.length,
      desc: `${customers.length} Student Accounts`,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      action: onGoToUsers
    },
    {
      title: 'Chapter Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      desc: 'Verified manual UPI sales',
      icon: IndianRupee,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      action: onGoToOrders
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overview Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>NoteNest Administration Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Academic Store Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live metrics from Firestore. Manage B.Com study materials, verify manual UPI payments, and review registered student profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToNotes}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload New Note</span>
          </button>
          <button
            onClick={onGoToOrders}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Verify Payments ({pendingOrders.length})</span>
          </button>
        </div>
      </div>

      {/* 8 Chapter-Model Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`rounded-2xl p-4 border transition-all cursor-pointer group hover:border-slate-600 ${
                card.highlight
                  ? 'bg-amber-500/5 border-amber-500/40 shadow-md shadow-amber-500/5'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {loading ? <span className="text-slate-600 text-base animate-pulse">...</span> : card.value}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate group-hover:text-slate-300">
                {card.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Orders & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders & Verification */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Recent Payment Orders</span>
              </h3>
              <p className="text-xs text-slate-400">Review, verify UTR, or approve pending customer transactions.</p>
            </div>
            <button
              onClick={onGoToOrders}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-2">Order</th>
                    <th className="py-2 px-2">Student</th>
                    <th className="py-2 px-2">Amount</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-2">
                        <div className="font-mono font-bold text-white text-[11px]">#{ord.id}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{ord.noteTitle}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-medium">
                        <div className="truncate max-w-[120px] font-semibold">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{ord.customerEmail}</div>
                      </td>
                      <td className="py-3 px-2 font-bold text-emerald-400">
                        ₹{ord.amount}
                      </td>
                      <td className="py-3 px-2">
                        {ord.paymentStatus === 'paid' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Paid
                          </span>
                        )}
                        {ord.paymentStatus === 'pending' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                        {ord.paymentStatus === 'rejected' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {ord.paymentStatus === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickApprove(ord.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Approve and unlock note"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleQuickReject(ord.id)}
                              className="p-1 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 rounded text-[10px] cursor-pointer"
                              title="Reject payment"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No payment orders recorded yet.</p>
          )}
        </div>

        {/* Right Column: Recent Registered Users */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Recent Registered Users</span>
              </h3>
              <p className="text-xs text-slate-400">Authenticated student accounts from Firestore.</p>
            </div>
            <button
              onClick={onGoToUsers}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u.uid}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No users registered yet.</p>
          )}

          {/* Quick System Integrity Badge */}
          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-4 text-xs text-slate-300 space-y-1 mt-4">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Firebase RBAC Protected</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Only authenticated users with Firestore <code className="text-emerald-300">role: &quot;admin&quot;</code> can access this console.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Recent Payment Verification Requests (Mobile-First Card Grid) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Recent Payment Verification Requests</span>
            </h3>
            <p className="text-xs text-slate-400">
              Review student submitted 12-digit UTR numbers and receipt screenshots. Approving instantly unlocks the note in the student's account.
            </p>
          </div>
          <button
            onClick={onGoToOrders}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Manage All Payments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentVerificationRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVerificationRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">#{req.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        req.paymentStatus === 'paid' || req.paymentStatus === 'successful'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.paymentStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {req.paymentStatus}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{req.noteTitle}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>{req.customerName}</span>
                      <span className="font-bold text-emerald-400">₹{req.amount}</span>
                    </p>
                  </div>

                  {/* UTR & Screenshot */}
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">UTR / Ref:</span>
                      <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded">
                        {req.utr || 'Pending submission'}
                      </span>
                    </div>

                    {req.screenshotUrl && (
                      <div className="pt-1.5 flex items-center justify-between">
                        <span className="text-slate-400">Screenshot:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedScreenshot(req.screenshotUrl || null)}
                          className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {req.paymentStatus === 'pending' ? (
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleQuickApprove(req.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleQuickReject(req.id)}
                      className="w-full py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
                    {req.verifiedAt ? `Verified: ${new Date(req.verifiedAt).toLocaleDateString()}` : 'Completed'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">No payment verification requests right now.</p>
        )}
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl overflow-hidden p-4 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center text-white">
              <span className="font-bold text-xs">Student Payment Receipt</span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedScreenshot}
                alt="Payment proof screenshot"
                className="max-h-[65vh] object-contain"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
