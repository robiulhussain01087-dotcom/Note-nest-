import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CurriculumProvider } from './context/CurriculumContext';
import { NoteNestDB } from './services/db';
import { getFirebaseAuth, isFirebaseConfigured } from './services/firebase';
import { Note, Chapter } from './types';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { NotesPage } from './pages/NotesPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { CustomerRegisterPage } from './pages/CustomerRegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { StaticPages } from './pages/StaticPages';
import { AuthModal } from './pages/AuthModal';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { AlertCircle } from 'lucide-react';

type RouteState =
  | { view: 'home' }
  | { view: 'notes'; subject?: string; search?: string; browseMode?: 'chapters' | 'groups' | 'notes' }
  | { view: 'group-detail'; groupId: string }
  | { view: 'note-detail'; noteId: string }
  | { view: 'checkout'; noteId?: string; chapterId?: string }
  | { view: 'account' }
  | { view: 'login'; redirectAfter?: string }
  | { view: 'register'; redirectAfter?: string }
  | { view: 'forgot-password' }
  | { view: 'reset-password' }
  | { view: 'admin-login' }
  | { view: 'admin' }
  | { view: 'access-denied'; reason: 'customer-restricted' | 'admin-restricted' | 'guest-restricted' }
  | { view: 'static'; page: 'about' | 'contact' | 'refund' | 'privacy' | 'terms' };

const MainContent: React.FC = () => {
  const {
    user,
    currentUser,
    isAdmin,
    isCustomer,
    loading: authLoading,
    authLoading: isAuthInitializing,
    profileLoading,
    profileError,
    reloadProfile,
    logout
  } = useAuth();

  const isAuthInProgress = isAuthInitializing || profileLoading || Boolean(currentUser && !user && !profileError);

  const [route, setRoute] = useState<RouteState>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      const href = window.location.href || '';
      const urlParams = new URLSearchParams(search);
      const isReset = urlParams.get('mode') === 'resetPassword' || hash.includes('mode=resetPassword');
      const hasCode = urlParams.has('oobCode') || hash.includes('oobCode=') || /[?&#]oobCode=/.test(href);
      if (hasCode || isReset || hash.includes('reset-password') || window.location.pathname.includes('reset-password')) {
        return { view: 'reset-password' };
      }
      if (hash.includes('forgot-password') || window.location.pathname.includes('forgot-password')) {
        return { view: 'forgot-password' };
      }
    }
    return { view: 'home' };
  });

  // Quick action modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [postAuthAction, setPostAuthAction] = useState<(() => void) | null>(null);

  const navigateTo = (newHash: string, reason?: string) => {
    try {
      const clean = newHash.startsWith('/') ? newHash.slice(1) : newHash;
      const targetHash = `#${clean}`;
      console.log('[ROUTE] Current path:', window.location.pathname + window.location.hash);
      console.log('[ROUTE] Redirect reason:', reason || `Navigation to ${targetHash}`);
      if (window.location.hash === targetHash || window.location.hash === `#/${clean}`) {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else {
        window.location.hash = clean;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (navErr) {
      console.error('[NoteNest Route] Route/redirect error:', navErr);
    }
  };

  // Sync hash and pathname routing
  useEffect(() => {
    const handleLocationChange = () => {
      console.log('[ROUTE] Current path:', window.location.pathname + window.location.hash);
      const hashPart = window.location.hash.replace(/^#\/?/, '');
      const pathPart = window.location.pathname.replace(/^\/+/, '');
      const rawRoute = hashPart || pathPart || '/';
      const cleanRoute = rawRoute.startsWith('/') ? rawRoute.slice(1) : rawRoute;
      const [routePath, queryString] = cleanRoute.split('?');
      const parts = routePath.split('/').filter(Boolean);

      console.log('[Route Diagnostic] current pathname:', window.location.pathname, 'hash:', window.location.hash, 'parts:', parts);

      // Check for Firebase password reset query params (search, hash, or href)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = queryString ? new URLSearchParams(queryString) : null;
      const hrefMatch = typeof window !== 'undefined' ? window.location.href.match(/[?&#]oobCode=([^&#]+)/) : null;
      const hasOobCode = Boolean(urlParams.get('oobCode') || hashParams?.get('oobCode') || hrefMatch);
      const isResetMode = urlParams.get('mode') === 'resetPassword' || hashParams?.get('mode') === 'resetPassword';

      if (parts[0] === 'reset-password' || hasOobCode || (isResetMode && hasOobCode)) {
        setRoute({ view: 'reset-password' });
      } else if (parts[0] === 'forgot-password' || parts[0] === 'forgot') {
        setRoute({ view: 'forgot-password' });
      } else if (parts.length === 0 || parts[0] === '') {
        setRoute({ view: 'home' });
      } else if (parts[0] === 'groups' || parts[0] === 'group') {
        if (parts[1]) {
          setRoute({ view: 'group-detail', groupId: parts[1] });
        } else {
          setRoute({ view: 'notes', browseMode: 'groups' });
        }
      } else if (parts[0] === 'notes') {
        const queryParams = new URLSearchParams(queryString || window.location.hash.split('?')[1] || '');
        const tab = queryParams.get('tab');
        const groupId = queryParams.get('group') || queryParams.get('groupId');
        if (groupId) {
          setRoute({ view: 'group-detail', groupId });
        } else {
          setRoute({
            view: 'notes',
            subject: queryParams.get('subject') || undefined,
            search: queryParams.get('q') || undefined,
            browseMode: tab === 'groups' ? 'groups' : (tab === 'notes' ? 'notes' : 'chapters'),
          });
        }
      } else if (parts[0] === 'pricing' || parts[0] === 'plans') {
        setRoute({ view: 'notes' });
      } else if (parts[0] === 'note' && parts[1]) {
        setRoute({ view: 'note-detail', noteId: parts[1] });
      } else if (parts[0] === 'checkout') {
        if (parts[1] === 'chapter' && parts[2]) {
          setRoute({ view: 'checkout', chapterId: parts[2] });
        } else if (parts[1] && parts[1] !== 'plan') {
          setRoute({ view: 'checkout', noteId: parts[1] });
        } else {
          setRoute({ view: 'notes' });
        }
      } else if (parts[0] === 'account' || parts[0] === 'my-purchases') {
        setRoute({ view: 'account' });
      } else if (parts[0] === 'login') {
        setRoute({ view: 'login' });
      } else if (parts[0] === 'register') {
        setRoute({ view: 'register' });
      } else if (parts[0] === 'admin') {
        if (parts[1] === 'login') {
          setRoute({ view: 'admin-login' });
        } else {
          setRoute({ view: 'admin' });
        }
      } else if (['about', 'contact', 'refund', 'privacy', 'terms'].includes(parts[0])) {
        setRoute({ view: 'static', page: parts[0] as any });
      } else {
        setRoute({ view: 'home' });
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Auto-redirect authenticated users away from login/register and admins away from customer account
  useEffect(() => {
    if (!isAuthInProgress) {
      if (route.view === 'login' || route.view === 'register') {
        if (isAdmin) {
          navigateTo('admin/dashboard', 'Admin already authenticated');
        } else if (user) {
          navigateTo('account', 'Customer already authenticated');
        }
      } else if (route.view === 'account' && isAdmin) {
        console.log('[ADMIN] Redirect: /admin/dashboard');
        navigateTo('admin/dashboard', 'Admin routed to admin dashboard');
      } else if (route.view === 'admin-login' && isAdmin) {
        console.log('[ADMIN] Redirect: /admin/dashboard');
        navigateTo('admin/dashboard', 'Admin already authenticated');
      }
    }
  }, [route.view, isAuthInProgress, user, isAdmin]);

  const handleOpenAuth = (mode: 'login' | 'register', onComplete?: () => void) => {
    setAuthMode(mode);
    setPostAuthAction(() => onComplete || null);
    setAuthModalOpen(true);
  };

  const handleBuyNote = (note: Note) => {
    if (isAdmin) {
      setRoute({ view: 'access-denied', reason: 'admin-restricted' });
      return;
    }
    if (!user) {
      handleOpenAuth('login', () => {
        navigateTo(`checkout/${note.id}`);
      });
    } else {
      navigateTo(`checkout/${note.id}`);
    }
  };

  const handleBuyChapter = (chapter: Chapter) => {
    if (isAdmin) {
      setRoute({ view: 'access-denied', reason: 'admin-restricted' });
      return;
    }
    if (!user) {
      handleOpenAuth('login', () => {
        navigateTo(`checkout/chapter/${chapter.id}`);
      });
    } else {
      navigateTo(`checkout/chapter/${chapter.id}`);
    }
  };

  // 0. TOP-PRIORITY PASSWORD RESET HANDLING
  // The password reset flow must NEVER depend on reading /users/{uid} from Firestore.
  // It must work directly and immediately whenever a user opens a reset link or route.
  const hasOobCodeInUrl = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).has('oobCode') ||
    window.location.hash.includes('oobCode=') ||
    /[?&#]oobCode=/.test(window.location.href)
  );

  if (route.view === 'reset-password' || hasOobCodeInUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-900 selection:text-white">
        <Navbar onNavigate={navigateTo} currentPath="reset-password" />
        <main className="flex-1">
          <ResetPasswordPage
            onNavigateLogin={() => navigateTo('login')}
            onNavigateForgotPassword={() => navigateTo('forgot-password')}
          />
        </main>
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // 1. DEDICATED ADMIN ROUTE HANDLING (/admin or /admin/dashboard)
  if (route.view === 'admin') {
    console.log('[ROUTE] Current path:', window.location.pathname + window.location.hash);
    const isAwaitingVerification = isAuthInProgress;

    // Wait for Firebase auth and Firestore profile verification before deciding destination (Req 12 & 13)
    if (isAwaitingVerification) {
      console.log('[ROUTE] Redirect reason: Verifying administrator credentials (auth/profile loading)');
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-300">Verifying administrator credentials...</span>
          </div>
        </div>
      );
    }

    // Requirement 9: If Firestore is temporarily offline, show: "Unable to connect to database. Please try again." Do not show "Access Restricted".
    if (profileError) {
      console.log('[ROUTE] Redirect reason: Database error, showing offline/connection message');
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-800/60 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800">
                Database Error
              </span>
              <h1 className="text-xl font-black text-white">Database Connection</h1>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 break-words text-left">
                Unable to connect to database. Please try again.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => reloadProfile()}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer font-black"
              >
                Please try again
              </button>
              <button
                onClick={() => logout()}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Requirement 4 & 10: Authenticated Admin: render Admin Suite
    if (isAdmin) {
      console.log(`[ADMIN] Auth UID: ${user?.uid || ''}`);
      console.log(`[ADMIN] Auth Email: ${user?.email || ''}`);
      console.log(`[ADMIN] Firestore Path: users/${user?.uid || ''}`);
      console.log(`[ADMIN] Document Exists: true`);
      console.log(`[ADMIN] Role: admin`);
      console.log(`[ADMIN] Admin Access: granted`);
      console.log(`[ADMIN] Redirect: /admin/dashboard`);
      console.log('[ROUTE] Redirect reason: Authenticated admin granted access to admin suite');
      return <AdminLayout onExitAdmin={() => navigateTo('/')} />;
    }

    // SECURITY: Only verified customers are restricted
    if (user && isCustomer) {
      console.log(`[ADMIN] Auth UID: ${user.uid}`);
      console.log(`[ADMIN] Auth Email: ${user.email}`);
      console.log(`[ADMIN] Firestore Path: users/${user.uid}`);
      console.log(`[ADMIN] Document Exists: true`);
      console.log(`[ADMIN] Role: customer`);
      console.log(`[ADMIN] Admin Access: denied`);
      console.log(`[ADMIN] Redirect: /account`);
      console.log('[ROUTE] Redirect reason: Customer restricted from admin suite, rendering access-denied');
      return (
        <AccessDeniedPage
          reason="customer-restricted"
          onNavigateHome={() => navigateTo('/')}
          onNavigateAccount={() => navigateTo('account')}
          onNavigateAdmin={() => navigateTo('admin')}
          onNavigateNotes={() => navigateTo('notes')}
        />
      );
    }

    // Guest accessing /admin: redirect to Admin Login
    console.log('[ROUTE] Redirect reason: Guest accessing /admin, displaying AdminLogin');
    return (
      <AdminLogin
        onSuccess={() => navigateTo('admin/dashboard')}
        onExit={() => navigateTo('/')}
        onNavigateForgotPassword={() => navigateTo('forgot-password')}
      />
    );
  }

  // 2. DEDICATED ADMIN LOGIN PAGE ROUTE (/admin/login)
  if (route.view === 'admin-login') {
    console.log('[ROUTE] Current path:', window.location.pathname + window.location.hash);
    const isAwaitingVerification = isAuthInProgress;

    if (isAwaitingVerification) {
      console.log('[ROUTE] Redirect reason: Checking auth state for admin login');
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-300">Checking authentication state...</span>
          </div>
        </div>
      );
    }

    if (isAdmin) {
      console.log(`[ADMIN] Auth UID: ${user?.uid || ''}`);
      console.log(`[ADMIN] Auth Email: ${user?.email || ''}`);
      console.log(`[ADMIN] Firestore Path: users/${user?.uid || ''}`);
      console.log(`[ADMIN] Document Exists: true`);
      console.log(`[ADMIN] Role: admin`);
      console.log(`[ADMIN] Admin Access: granted`);
      console.log(`[ADMIN] Redirect: /admin/dashboard`);
      console.log('[ROUTE] Redirect reason: Admin user already authenticated on /admin/login, redirecting to admin/dashboard');
      navigateTo('admin/dashboard', 'Admin already authenticated');
      return null;
    }

    // Render Admin Login (even if customer is currently signed in, allowing admin credential entry or account switch)
    console.log('[ROUTE] Redirect reason: Rendering AdminLogin form');
    return (
      <AdminLogin
        onSuccess={() => navigateTo('admin/dashboard')}
        onExit={() => navigateTo('/')}
        onNavigateForgotPassword={() => navigateTo('forgot-password')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-900 selection:text-white">
      {/* Customer Header */}
      <Navbar
        currentRoute={route.view}
        onNavigate={navigateTo}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
      />

      {/* Main View Switching */}
      <main className="flex-1">
        {route.view === 'home' && (
          <HomePage
            onExplore={() => navigateTo('notes')}
            onSelectNote={(note) => navigateTo(`note/${note.id}`)}
            onBuyNow={handleBuyNote}
            onBuyChapter={(chap) => {
              if (!user) {
                handleOpenAuth('register', () => navigateTo(`checkout/chapter/${chap.id}`));
              } else {
                navigateTo(`checkout/chapter/${chap.id}`);
              }
            }}
            onNavigate={navigateTo}
          />
        )}

        {route.view === 'group-detail' && (
          <GroupDetailPage
            groupId={route.groupId}
            onBack={() => navigateTo('notes?tab=groups')}
            onBuyChapter={handleBuyChapter}
          />
        )}

        {route.view === 'notes' && (
          <NotesPage
            initialSubject={route.subject}
            initialSearch={route.search}
            initialBrowseMode={route.browseMode || 'chapters'}
            onSelectNote={(note) => navigateTo(`note/${note.id}`)}
            onBuyNow={handleBuyNote}
            onBuyNote={handleBuyNote}
            onBuyChapter={handleBuyChapter}
            onViewGroup={(groupId) => navigateTo(`groups/${groupId}`)}
          />
        )}

        {route.view === 'note-detail' && (
          <NoteDetailPage
            note={NoteNestDB.getNoteById(route.noteId) || null}
            onBuyNow={handleBuyNote}
            onBack={() => navigateTo('notes')}
          />
        )}

        {/* CUSTOMER LOGIN PAGE */}
        {route.view === 'login' && (
          isAuthInProgress ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Checking authentication...</span>
              </div>
            </div>
          ) : isAdmin ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Redirecting to administrator dashboard...</span>
              </div>
            </div>
          ) : user ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Redirecting to your account...</span>
              </div>
            </div>
          ) : (
            <CustomerLoginPage
              onLoginSuccess={(role) => {
                if (role === 'admin') {
                  navigateTo('admin/dashboard');
                } else {
                  navigateTo('account');
                }
              }}
              onNavigateRegister={() => navigateTo('register')}
              onBackToHome={() => navigateTo('/')}
              onNavigateAdminLogin={() => navigateTo('admin/login')}
              onNavigateForgotPassword={() => navigateTo('forgot-password')}
            />
          )
        )}

        {/* FORGOT PASSWORD PAGE */}
        {route.view === 'forgot-password' && (
          <ForgotPasswordPage
            onNavigateLogin={() => navigateTo('login')}
            onBackToHome={() => navigateTo('/')}
          />
        )}

        {/* RESET PASSWORD PAGE (oobCode Action Verification) */}
        {route.view === 'reset-password' && (
          <ResetPasswordPage
            onNavigateLogin={() => navigateTo('login')}
            onNavigateForgotPassword={() => navigateTo('forgot-password')}
          />
        )}

        {/* CUSTOMER REGISTER PAGE */}
        {route.view === 'register' && (
          isAuthInProgress ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Checking authentication...</span>
              </div>
            </div>
          ) : isAdmin ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Redirecting to administrator dashboard...</span>
              </div>
            </div>
          ) : user ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Redirecting to your account...</span>
              </div>
            </div>
          ) : (
            <CustomerRegisterPage
              onRegisterSuccess={() => navigateTo('account')}
              onNavigateLogin={() => navigateTo('login')}
              onBackToHome={() => navigateTo('/')}
            />
          )
        )}

        {/* CHECKOUT PAGE (Role Protected: Customers Only) */}
        {route.view === 'checkout' && (
          isAuthInProgress ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Checking authentication...</span>
              </div>
            </div>
          ) : isAdmin ? (
            <AccessDeniedPage
              reason="admin-restricted"
              onGoHome={() => navigateTo('/')}
              onGoToAdminDashboard={() => navigateTo('admin')}
            />
          ) : !user ? (
            <CustomerLoginPage
              onLoginSuccess={() => {
                if (route.chapterId) {
                  navigateTo(`checkout/chapter/${route.chapterId}`);
                } else if (route.noteId) {
                  navigateTo(`checkout/${route.noteId}`);
                } else {
                  navigateTo('notes');
                }
              }}
              onNavigateRegister={() => navigateTo('register')}
              onBackToHome={() => navigateTo('/')}
            />
          ) : (
            <CheckoutPage
              note={route.noteId ? (NoteNestDB.getNoteById(route.noteId) || null) : null}
              chapterId={route.chapterId}
              onSuccess={() => navigateTo('account')}
              onCancel={() => {
                if (route.chapterId) {
                  navigateTo('notes');
                } else if (route.noteId) {
                  navigateTo(`note/${route.noteId}`);
                } else {
                  navigateTo('notes');
                }
              }}
            />
          )
        )}

        {/* CUSTOMER ACCOUNT / DASHBOARD (Role Protected) */}
        {route.view === 'account' && (
          isAuthInProgress ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Loading your account...</span>
              </div>
            </div>
          ) : isAdmin ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Redirecting to administrator dashboard...</span>
              </div>
            </div>
          ) : !user ? (
            <CustomerLoginPage
              onLoginSuccess={(role) => {
                if (role === 'admin') {
                  navigateTo('admin/dashboard');
                } else {
                  navigateTo('account');
                }
              }}
              onNavigateRegister={() => navigateTo('register')}
              onBackToHome={() => navigateTo('/')}
              onNavigateAdminLogin={() => navigateTo('admin/login')}
              onNavigateForgotPassword={() => navigateTo('forgot-password')}
            />
          ) : (
            <CustomerDashboard
              onSelectNote={(note) => navigateTo(`note/${note.id}`)}
              onExploreNotes={() => navigateTo('notes')}
            />
          )
        )}

        {/* ACCESS DENIED GENERIC */}
        {route.view === 'access-denied' && (
          <AccessDeniedPage
            reason={route.reason}
            onGoHome={() => navigateTo('/')}
            onGoToCustomerAccount={() => navigateTo('account')}
            onGoToAdminDashboard={() => navigateTo('admin')}
          />
        )}

        {/* STATIC PAGES */}
        {route.view === 'static' && (
          <StaticPages
            page={route.page}
            onNavigate={(p) => navigateTo(p)}
          />
        )}
      </main>

      {/* Customer Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Auth Modal for inline flows (e.g., instant Buy Now on notes page) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => {
          setAuthModalOpen(false);
          setPostAuthAction(null);
        }}
        onSuccess={() => {
          if (postAuthAction) {
            postAuthAction();
          }
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CurriculumProvider>
          <MainContent />
        </CurriculumProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
