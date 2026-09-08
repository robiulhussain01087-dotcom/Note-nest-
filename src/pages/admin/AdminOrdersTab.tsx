import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import { Order, PaymentStatus } from '../../types';
import { subscribeToAdminOrders } from '../../services/ordersRealtime';
import { NoteNestDB } from '../../services/db';
import {
  Check,
  X,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Copy,
  RefreshCw,
  ShoppingBag,
  Calendar,
  IndianRupee,
  User,
  FileText
} from 'lucide-react';

export const AdminOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => NoteNestDB.getOrders());
  const [loading, setLoading] = useState(true);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [rejectPromptId, setRejectPromptId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Real-time listener continuously synchronizes Firestore /orders via onSnapshot()
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAdminOrders(
      (newOrders) => {
        if (isMounted) {
          setOrders(newOrders);
          setLoading(false);
          setRealtimeError(null);
        }
      },
      (err) => {
        if (isMounted) {
          console.error('[AdminOrdersTab] Real-time listener error:', err);
          setRealtimeError(err?.message || 'Real-time order synchronization error.');
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
      const fetched = await AdminService.fetchOrders();
      setOrders(fetched);
      setRealtimeError(null);
    } catch (err: any) {
      console.error('[AdminOrdersTab] Manual sync error:', err);
      setRealtimeError(err?.message || 'Manual order sync failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.paymentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.noteTitle.toLowerCase().includes(q) ||
        (o.utr && o.utr.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApprove = async (orderId: string) => {
    setActionInProgress(orderId);
    try {
      await AdminService.verifyOrder(orderId, 'paid', 'Administrator Verification');
      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails(null);
      }
    } catch (err: any) {
      console.error('[AdminOrdersTab] Approve error:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectPromptId) return;
    setActionInProgress(rejectPromptId);
    try {
      await AdminService.verifyOrder(
        rejectPromptId,
        'rejected',
        'Administrator Verification',
        rejectReason || 'Amount mismatch or invalid 12-digit UTR.'
      );
      setRejectPromptId(null);
      setRejectReason('');
      if (selectedOrderDetails?.id === rejectPromptId) {
        setSelectedOrderDetails(null);
      }
    } catch (err: any) {
      console.error('[AdminOrdersTab] Reject error:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>Orders & Manual UPI Verification</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review student transactions from Firestore <code className="text-amber-300">/orders</code>, verify 12-digit UTR numbers, and unlock high-res B.Com study materials.
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
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
        </div>
      </div>

      {realtimeError && (
        <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Real-time Synchronization Notice: </span>
            <span>{realtimeError}</span>
          </div>
        </div>
      )}

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Student Name, Note, or UTR..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'pending', 'paid', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st === 'all'
                ? `All (${orders.length})`
                : `${st} (${orders.filter((o) => o.paymentStatus === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Item / Study Note</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">UTR Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Details & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading orders from Firestore...</div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      #{ord.id}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
                        {ord.customerEmail}
                      </div>
                    </td>

                    {/* Item */}
                    <td className="py-3 px-4 text-slate-300 font-medium max-w-[200px] truncate" title={ord.noteTitle}>
                      {ord.noteTitle}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{ord.amount}
                    </td>

                    {/* UTR */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="font-mono text-xs text-white font-bold flex items-center gap-1">
                          {ord.utr ? (
                            <>
                              <span>{ord.utr}</span>
                              <button
                                onClick={() => handleCopy(ord.utr!, ord.id)}
                                className="text-slate-500 hover:text-slate-300"
                                title="Copy UTR"
                              >
                                {copiedUtr === ord.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </>
                          ) : (
                            <span className="text-amber-400 font-normal italic text-[11px]">Pending UTR</span>
                          )}
                        </div>
                        {ord.screenshotUrl && (
                          <button
                            onClick={() => setSelectedScreenshot(ord.screenshotUrl || null)}
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View Proof
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {ord.paymentStatus === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {ord.paymentStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {ord.paymentStatus === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions & View Details */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="View complete order details"
                        >
                          Details
                        </button>
                        {ord.paymentStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(ord.id)}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                              title="Confirm UPI payment and unlock PDF"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => setRejectPromptId(ord.id)}
                              className="px-2 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Reject payment"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No orders matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View for Android Screens (hidden on md and larger) */}
      <div className="md:hidden space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Student Payment Requests ({filteredOrders.length})
        </div>

        {filteredOrders.map((ord) => (
          <div
            key={`mobile-${ord.id}`}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400">#{ord.id}</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                  ord.paymentStatus === 'paid' || ord.paymentStatus === 'successful'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : ord.paymentStatus === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {ord.paymentStatus}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{ord.noteTitle}</h4>
              <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                <span>{ord.customerName}</span>
                <span className="font-bold text-emerald-400 text-sm">₹{ord.amount}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{ord.customerEmail}</div>
            </div>

            {/* UTR & Screenshot */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">12-Digit UTR:</span>
                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                  {ord.utr || 'Pending'}
                  {ord.utr && (
                    <button
                      onClick={() => handleCopy(ord.utr!, ord.id)}
                      className="text-slate-500 hover:text-slate-300 ml-1"
                    >
                      {copiedUtr === ord.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </span>
              </div>

              {ord.screenshotUrl && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="text-slate-400">Receipt Image:</span>
                  <button
                    onClick={() => setSelectedScreenshot(ord.screenshotUrl || null)}
                    className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                  >
                    View Screenshot
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrderDetails(ord)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Details
              </button>

              {ord.paymentStatus === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(ord.id)}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setRejectPromptId(ord.id)}
                    className="py-2 px-3 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-bold"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Order Details #{selectedOrderDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Customer Info */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Customer Information
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white font-bold">{selectedOrderDetails.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white font-mono">{selectedOrderDetails.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer UID:</span>
                  <span className="text-slate-400 font-mono text-[10px]">{selectedOrderDetails.customerId}</span>
                </div>
              </div>

              {/* Item Info */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Ordered Study Material
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Item:</span>
                  <span className="text-white font-bold truncate max-w-[220px]">{selectedOrderDetails.noteTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Charged:</span>
                  <span className="text-emerald-400 font-bold text-sm">₹{selectedOrderDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Date:</span>
                  <span className="text-slate-300">{new Date(selectedOrderDetails.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Payment Verification Details
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">12-Digit UTR:</span>
                  <span className="text-white font-mono font-bold text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {selectedOrderDetails.utr || 'Pending submission'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status:</span>
                  <span className="capitalize font-bold text-white">{selectedOrderDetails.paymentStatus}</span>
                </div>
                {selectedOrderDetails.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified By:</span>
                    <span className="text-slate-300">{selectedOrderDetails.verifiedBy}</span>
                  </div>
                )}
                {selectedOrderDetails.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified At:</span>
                    <span className="text-slate-400">{new Date(selectedOrderDetails.verifiedAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedOrderDetails.adminNote && (
                  <div className="border-t border-slate-800 pt-1.5 text-slate-400">
                    <span className="font-semibold text-slate-300">Admin Note: </span>
                    {selectedOrderDetails.adminNote}
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-2">
              {selectedOrderDetails.screenshotUrl && (
                <button
                  onClick={() => setSelectedScreenshot(selectedOrderDetails.screenshotUrl || null)}
                  className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Receipt Image
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {selectedOrderDetails.paymentStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedOrderDetails.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Approve & Unlock</span>
                    </button>
                    <button
                      onClick={() => setRejectPromptId(selectedOrderDetails.id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Rejection Dialog */}
      {rejectPromptId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Payment #{rejectPromptId}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide an optional explanation for the customer (e.g. Invalid UTR, amount mismatch, or bank failure).
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. UTR number was not found on the bank statement. Please retry or contact support."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectPromptId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl overflow-hidden p-4 space-y-4">
            <div className="flex justify-between items-center text-white">
              <span className="font-bold text-xs">Payment Receipt Proof</span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-slate-400 hover:text-white"
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
          </div>
        </div>
      )}
    </div>
  );
};
