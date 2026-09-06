import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminGroupsTab } from './AdminGroupsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminNotesTab } from './AdminNotesTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminPurchasesTab } from './AdminPurchasesTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { Logo } from '../../components/Logo';
import {
  LayoutDashboard,
  Layers,
  Users,
  BookOpen,
  ShoppingBag,
  PackageCheck,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  onExitAdmin: () => void;
}

export type AdminTabType = 'dashboard' | 'groups' | 'notes' | 'users' | 'orders' | 'purchases' | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin }) => {
  const { user, isAdmin, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabType>('dashboard');
  const [selectedGroupIdForNotes, setSelectedGroupIdForNotes] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Wait for Firebase auth state initialization before making any redirect or access decision
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-300">Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // If not logged in as Admin, show the secure Admin Login screen
  if (!user || !isAdmin) {
    console.log('[AdminLayout Diagnostic] Access denied or unauthenticated admin:', {
      userUid: user?.uid,
      role: user?.role,
      isAdmin,
      loading
    });
    return <AdminLogin onSuccess={() => setActiveTab('dashboard')} onExit={onExitAdmin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & metrics' },
    { id: 'groups', label: 'Groups', icon: Layers, desc: 'Syllabus units & groups' },
    { id: 'notes', label: 'Curriculum & Notes', icon: BookOpen, desc: 'Multi-education syllabus' },
    { id: 'users', label: 'Users', icon: Users, desc: 'Firestore accounts & roles' },
    { id: 'orders', label: 'Orders / Purchases', icon: ShoppingBag, desc: 'UPI approvals & audit' },
    { id: 'purchases', label: 'Purchases Audit', icon: PackageCheck, desc: 'Active student licenses' },
    { id: 'settings', label: 'Settings', icon: Settings, desc: 'Academic levels & config' },
  ] as const;

  const handleSelectTab = (tabId: AdminTabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTabLabel = navItems.find((item) => item.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Permanent on md+ screens) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen z-30">
        {/* Sidebar Header with NoteNest Branding */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
              <Logo size="sm" showTagline={false} />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider uppercase text-white">NoteNest Admin</div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Superuser</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5 scrollbar-none">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as AdminTabType)}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Sidebar Bottom: Storefront & Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          {/* Admin User Badge */}
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user.name || 'Admin'}</div>
              <div className="text-[10px] text-slate-400 truncate font-mono">{user.email}</div>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to NoteNest</span>
          </button>

          <button
            onClick={logout}
            className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/30 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE / TABLET HEADER & DRAWER */}
      {/* ========================================================================= */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <Logo size="sm" showTagline={false} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExitAdmin}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-rose-950/40 text-rose-400 hover:text-rose-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-2.5 pb-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as AdminTabType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Slide-in Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 border-r border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <Logo size="sm" showTagline={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 space-y-1.5">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Administration Menu
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id as AdminTabType)}
                      className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-colors min-h-[48px] ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer Bottom */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={onExitAdmin}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                <span>Back to NoteNest Store</span>
              </button>
              <button
                onClick={logout}
                className="w-full px-4 py-3 rounded-xl bg-rose-950/40 text-rose-300 text-xs font-bold flex items-center gap-2 min-h-[44px]"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Breadcrumb Bar (Desktop) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-950/60 border-b border-slate-800/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Admin Console</span>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 font-bold">{currentTabLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </header>

        {/* Tab Canvas Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab
              onGoToGroups={() => setActiveTab('groups')}
              onGoToUsers={() => setActiveTab('users')}
              onGoToNotes={() => {
                setSelectedGroupIdForNotes(undefined);
                setActiveTab('notes');
              }}
              onGoToOrders={() => setActiveTab('orders')}
              onGoToPurchases={() => setActiveTab('purchases')}
            />
          )}
          {activeTab === 'groups' && (
            <AdminGroupsTab
              onNavigateToChapters={(groupId) => {
                setSelectedGroupIdForNotes(groupId);
                setActiveTab('notes');
              }}
            />
          )}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'notes' && (
            <AdminNotesTab
              key={selectedGroupIdForNotes || 'all-notes-tab'}
              initialGroupId={selectedGroupIdForNotes}
              onNavigateToGroups={() => setActiveTab('groups')}
            />
          )}
          {activeTab === 'orders' && <AdminOrdersTab />}
          {activeTab === 'purchases' && <AdminPurchasesTab />}
          {activeTab === 'settings' && <AdminSettingsTab filterSection="all" />}
        </main>
      </div>
    </div>
  );
};
