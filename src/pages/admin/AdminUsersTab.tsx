import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import { User, Order, Purchase } from '../../types';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Copy,
  Check,
  Calendar,
  Mail,
  Key,
  ShoppingBag,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Role modification state
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState<User | null>(null);
  const [newTargetRole, setNewTargetRole] = useState<'customer' | 'admin'>('customer');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [roleUpdateMessage, setRoleUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsersData = async () => {
    try {
      const [fetchedUsers, fetchedOrders, fetchedPurchases] = await Promise.all([
        AdminService.fetchUsers(),
        AdminService.fetchOrders(),
        AdminService.fetchPurchases()
      ]);
      setUsers(fetchedUsers);
      setOrders(fetchedOrders);
      setPurchases(fetchedPurchases);
    } catch (err) {
      console.error('[AdminUsersTab] Failed to load users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsersData();
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Filter users by search query and role
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const promptChangeRole = (user: User) => {
    const target = user.role === 'admin' ? 'customer' : 'admin';
    setSelectedUserForRoleChange(user);
    setNewTargetRole(target);
    setRoleUpdateMessage(null);
  };

  const confirmRoleChange = async () => {
    if (!selectedUserForRoleChange) return;
    setUpdatingRole(true);
    setRoleUpdateMessage(null);

    const result = await AdminService.updateUserRole(selectedUserForRoleChange.uid, newTargetRole);
    setUpdatingRole(false);

    if (result.success) {
      setRoleUpdateMessage({
        type: 'success',
        text: `Successfully updated ${selectedUserForRoleChange.name}'s role to "${newTargetRole}".`
      });
      // Update local state
      setUsers(prev =>
        prev.map(u => (u.uid === selectedUserForRoleChange.uid ? { ...u, role: newTargetRole } : u))
      );
      setTimeout(() => {
        setSelectedUserForRoleChange(null);
        setRoleUpdateMessage(null);
      }, 2000);
    } else {
      setRoleUpdateMessage({
        type: 'error',
        text: result.error || 'Failed to update user role in Firestore.'
      });
    }
  };

  // Metrics
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>User Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse authenticated user profiles in Firestore <code className="text-purple-300">/users</code> and manage role-based permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Role Summary Chips */}
      <div className="grid grid-cols-3 gap-3">
        <div
          onClick={() => setRoleFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-purple-500/10 border-purple-500/50 shadow-md shadow-purple-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">All Accounts</div>
          <div className="text-2xl font-black text-white mt-1">{users.length}</div>
          <div className="text-[10px] text-slate-500">Firestore registered</div>
        </div>

        <div
          onClick={() => setRoleFilter('customer')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'customer'
              ? 'bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customers</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{totalCustomers}</div>
          <div className="text-[10px] text-slate-500">B.Com students</div>
        </div>

        <div
          onClick={() => setRoleFilter('admin')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'admin'
              ? 'bg-rose-500/10 border-rose-500/50 shadow-md shadow-rose-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Administrators</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{totalAdmins}</div>
          <div className="text-[10px] text-slate-500">Full control access</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, or UID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'customer', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r === 'all' ? `All (${users.length})` : `${r}s (${users.filter(u => u.role === r).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Firebase UID</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4">Purchased Chapters</th>
                <th className="py-3 px-4 text-right">Role Elevation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading registered users from Firestore...</div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const userPurchases = purchases.filter(p => p.customerId === u.uid);
                  const isCopied = copiedUid === u.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{u.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* UID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-slate-400 max-w-[140px] truncate" title={u.uid}>
                            {u.uid}
                          </span>
                          <button
                            onClick={() => handleCopyUid(u.uid)}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors"
                            title="Copy UID"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <UserCheck className="w-3 h-3" /> Customer
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Purchases */}
                      <td className="py-3 px-4">
                        {userPurchases.length > 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[10px]">
                            {userPurchases.length} chapter{userPurchases.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">0 chapters</span>
                        )}
                      </td>

                      {/* Role Elevation Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => promptChangeRole(u)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            u.role === 'admin'
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{u.role === 'admin' ? 'Change to Customer' : 'Elevate to Admin'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No users found matching &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirmation Modal */}
      {selectedUserForRoleChange && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-white">
              <div className={`p-2.5 rounded-2xl ${newTargetRole === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">Confirm Role Change</h3>
                <p className="text-xs text-slate-400">Updates Firestore <code className="text-purple-300">/users/{selectedUserForRoleChange.uid}</code></p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <span className="text-white font-bold">{selectedUserForRoleChange.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-mono">{selectedUserForRoleChange.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-bold capitalize text-slate-300">{selectedUserForRoleChange.role}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">New Target Role:</span>
                <span className={`font-bold uppercase tracking-wider ${newTargetRole === 'admin' ? 'text-rose-400' : 'text-blue-400'}`}>
                  {newTargetRole}
                </span>
              </div>
            </div>

            {newTargetRole === 'admin' && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Elevating this user to <strong>admin</strong> will grant them access to the NoteNest Administrator Suite, notes database, and order approvals.
                </p>
              </div>
            )}

            {roleUpdateMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  roleUpdateMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {roleUpdateMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{roleUpdateMessage.text}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForRoleChange(null)}
                disabled={updatingRole}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRoleChange}
                disabled={updatingRole}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg cursor-pointer ${
                  newTargetRole === 'admin'
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                {updatingRole ? 'Updating Firestore...' : `Confirm Set to ${newTargetRole}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
