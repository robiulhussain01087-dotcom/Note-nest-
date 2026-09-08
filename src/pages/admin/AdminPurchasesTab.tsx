import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import { Purchase } from '../../types';
import { subscribeToAdminPurchases } from '../../services/ordersRealtime';
import { NoteNestDB } from '../../services/db';
import {
  PackageCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  FileText,
  User,
  IndianRupee,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const AdminPurchasesTab: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>(() => NoteNestDB.getPurchases());
  const [loading, setLoading] = useState(true);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Real-time listener continuously synchronizes Firestore /purchases via onSnapshot()
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAdminPurchases(
      (newPurchases) => {
        if (isMounted) {
          setPurchases(newPurchases);
          setLoading(false);
          setRealtimeError(null);
        }
      },
      (err) => {
        if (isMounted) {
          console.error('[AdminPurchasesTab] Real-time listener error:', err);
          setRealtimeError(err?.message || 'Real-time purchase synchronization error.');
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fetched = await AdminService.fetchPurchases();
      setPurchases(fetched);
      setRealtimeError(null);
    } catch (err: any) {
      console.error('[AdminPurchasesTab] Manual sync error:', err);
      setRealtimeError(err?.message || 'Manual purchase sync failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (semesterFilter !== 'all' && p.semester !== semesterFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.noteTitle.toLowerCase().includes(q) ||
        p.customerId.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalValue = purchases.reduce((sum, p) => sum + (p.purchasedPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
            <span>Customer Active Purchases</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Display verified student purchase records from Firestore <code className="text-emerald-300">/purchases</code> with permanent download entitlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-[11px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Firestore Sync</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>
        </div>
      </div>

      {realtimeError && (
        <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Real-time Purchase Synchronization Notice: </span>
            <span>{realtimeError}</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Purchases</div>
          <div className="text-2xl font-black text-white mt-1">{purchases.length}</div>
          <div className="text-[10px] text-slate-500">Active PDF access licenses</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Purchase Value</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{totalValue.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">Direct student sales volume</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Licensing Status</div>
          <div className="text-2xl font-black text-blue-400 mt-1">100% Active</div>
          <div className="text-[10px] text-slate-500">Unrevoked customer access</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Note Title, Customer UID, or Order ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-slate-400">Semester:</span>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-white px-3 py-2 outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">All Semesters</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="3rd Semester">3rd Semester</option>
            <option value="4th Semester">4th Semester</option>
            <option value="5th Semester">5th Semester</option>
            <option value="6th Semester">6th Semester</option>
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item / Study Note</th>
                <th className="py-3 px-4">Customer UID</th>
                <th className="py-3 px-4">Course & Semester</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading purchases from Firestore database...</div>
                  </td>
                </tr>
              ) : filteredPurchases.length > 0 ? (
                filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Note Item */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs max-w-xs truncate" title={pur.noteTitle}>
                        {pur.noteTitle}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Order #{pur.orderId}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {pur.customerId.slice(0, 12)}...
                      </span>
                    </td>

                    {/* Course & Sem */}
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      <div>{pur.course}</div>
                      <div className="text-[10px] text-slate-500">{pur.semester}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{pur.purchasedPrice}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(pur.purchasedAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPurchase(pur)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No purchases recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-400" />
                <span>Purchase Record Details</span>
              </h3>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Study Note:</span>
                <span className="text-white font-bold text-right max-w-[200px] truncate">{selectedPurchase.noteTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purchase ID:</span>
                <span className="text-slate-300 font-mono text-[10px]">{selectedPurchase.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer UID:</span>
                <span className="text-slate-300 font-mono text-[10px]">{selectedPurchase.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Linked Order:</span>
                <span className="text-white font-mono">#{selectedPurchase.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Course & Semester:</span>
                <span className="text-slate-300 font-medium">{selectedPurchase.course} - {selectedPurchase.semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="text-slate-300">{selectedPurchase.subject}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-emerald-400 font-bold text-sm">₹{selectedPurchase.purchasedPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access Status:</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">{selectedPurchase.accessStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purchased At:</span>
                <span className="text-slate-300">{new Date(selectedPurchase.purchasedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
