import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { NoteNestDB } from '../services/db';
import {
  getFirebaseAuth,
  getFirebaseDB,
  getFirebaseConfig,
  enableNetwork,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  mapFirebaseRegistrationError,
  mapFirebaseLoginError,
  mapFirebaseAuthError,
  withTimeout,
  sendFirebasePasswordReset,
  verifyFirebaseResetCode,
  confirmFirebasePasswordReset
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  currentUser: any;
  profile: User | null;
  loading: boolean;
  authLoading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  reloadProfile: () => Promise<void>;
  loginCustomer: (email: string, password?: string) => Promise<{ success: boolean; role?: 'customer' | 'admin'; error?: string }>;
  registerCustomer: (name: string, email: string, password?: string) => Promise<{ success: boolean; role?: 'customer'; error?: string }>;
  loginAdmin: (email: string, password?: string) => Promise<{ success: boolean; role?: 'admin'; error?: string }>;
  login: (email: string, password?: string, forceRole?: 'customer' | 'admin') => Promise<{ success: boolean; role?: 'customer' | 'admin'; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; role?: 'customer'; error?: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyResetCode: (oobCode: string) => Promise<{ success: boolean; email?: string; error?: string }>;
  confirmResetPassword: (oobCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
  isCustomer: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Profile read & write timeouts to guarantee UI never loads indefinitely
const FIRESTORE_READ_TIMEOUT_MS = 10000;
const FIRESTORE_WRITE_TIMEOUT_MS = 10000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const isConfigured = isFirebaseConfigured();

  // Ref to prevent stale closure in onAuthStateChanged
  const activeUserRef = useRef<User | null>(null);

  // Track ongoing authentication operations to prevent duplicate requests (Requirement 7 & 9)
  const authOpInProgress = useRef(false);

  // In-flight profile lookup cache to prevent race conditions (Requirement 8 & 10)
  const inFlightProfileLoads = useRef<Map<string, Promise<{ user: User | null; role?: 'customer' | 'admin'; error?: string; isOffline?: boolean; exists?: boolean }>>>(new Map());

  // Log loading state changes
  const updateLoading = (val: boolean) => {
    console.log(`[LOADING] profile loading state changed: ${val}`);
    setProfileLoading(val);
  };

  // Helper for Requirement 10: Strict Admin Console Diagnostics
  const logAdminDiagnostics = (params: {
    authUid: string;
    authEmail: string;
    firestorePath: string;
    documentExists: boolean;
    role: string;
    adminAccess: string;
    redirect: string;
  }) => {
    console.log(`[ADMIN] Auth UID: ${params.authUid}`);
    console.log(`[ADMIN] Auth Email: ${params.authEmail}`);
    console.log(`[ADMIN] Firestore Path: ${params.firestorePath}`);
    console.log(`[ADMIN] Document Exists: ${params.documentExists}`);
    console.log(`[ADMIN] Role: ${params.role}`);
    console.log(`[ADMIN] Admin Access: ${params.adminAccess}`);
    console.log(`[ADMIN] Redirect: ${params.redirect}`);
  };

  // Core authoritative profile loader from Firestore /users/{uid}
  // The document ID is always the authenticated user's UID (currentUser.uid)
  const loadUserProfile = async (
    firebaseUser: {
      uid: string;
      email: string | null;
      displayName: string | null;
    },
    callerContext?: string
  ): Promise<{ user: User | null; role?: 'customer' | 'admin'; error?: string; isOffline?: boolean; exists?: boolean }> => {
    const currentUid = firebaseUser.uid;
    const currentEmail = firebaseUser.email || '';
    const firestorePath = `users/${currentUid}`;

    // Deduplicate simultaneous reads for the same UID to prevent race conditions
    const existing = inFlightProfileLoads.current.get(currentUid);
    if (existing) {
      console.log('[FIRESTORE] profile read in progress, awaiting shared promise for UID:', currentUid);
      return existing;
    }

    const loadPromise = (async () => {
      console.log('[AUTH] UID:', currentUid);
      console.log('[FIRESTORE] Profile lookup started for UID:', currentUid, 'caller:', callerContext || 'general');

      try {
        const db = getFirebaseDB();
        const userDocRef = doc(db, 'users', currentUid);

        // Firestore profile read with strict timeout
        const snap = await withTimeout(
          getDoc(userDocRef),
          FIRESTORE_READ_TIMEOUT_MS,
          'Firestore profile read timed out'
        );

        const exists = snap ? snap.exists() : false;
        const userData = exists ? snap.data() : null;

        // If Firestore document does not exist
        if (!exists || !userData) {
          console.log('[FIRESTORE] Document missing at path:', firestorePath, 'caller:', callerContext || 'general');

          // If logging in as Admin: Admin accounts must already exist in Firestore with role: "admin".
          if (callerContext === 'loginAdmin') {
            logAdminDiagnostics({
              authUid: currentUid,
              authEmail: currentEmail,
              firestorePath,
              documentExists: false,
              role: 'none',
              adminAccess: 'denied',
              redirect: 'none'
            });

            setUser(null);
            const errorMsg = `No administrator profile found at Firestore path /users/${currentUid} for account ${currentEmail || 'unknown'}. If this is not the intended NoteNest Admin account, you must log in with the existing admin account instead of modifying data.`;
            setProfileError(errorMsg);
            return { user: null, role: undefined, error: errorMsg, exists: false };
          }

          // For customer sessions: do NOT automatically write/overwrite existing Firestore documents during load.
          const displayName = firebaseUser.displayName || (currentEmail ? currentEmail.split('@')[0] : 'Customer');
          const nowIso = new Date().toISOString();

          const customerUser: User = {
            uid: currentUid,
            name: displayName,
            email: currentEmail,
            role: 'customer',
            createdAt: nowIso
          };

          setUser(customerUser);
          activeUserRef.current = customerUser;
          setProfileError(null);
          NoteNestDB.syncUserProfile(customerUser);
          console.log('[AUTH] Customer session active in memory for UID:', currentUid);
          return { user: customerUser, role: 'customer' as const, error: undefined, exists: false };
        }

        console.log('[FIRESTORE] Profile document found for UID:', currentUid);

        // Read the role field dynamically (Req 2, 3, 4, 8)
        const rawRole = userData.role;
        const normalizedRole = typeof rawRole === 'string' ? rawRole.trim().toLowerCase() : '';

        if (normalizedRole === 'admin') {
          // Keep existing Admin routing. Never overwrite or normalize Firestore role field automatically.
          logAdminDiagnostics({
            authUid: currentUid,
            authEmail: currentEmail,
            firestorePath,
            documentExists: true,
            role: 'admin',
            adminAccess: 'granted',
            redirect: '/admin/dashboard'
          });

          const adminUser: User = {
            uid: currentUid,
            name: userData.name || firebaseUser.displayName || 'Administrator',
            email: currentEmail,
            role: 'admin',
            createdAt: userData.createdAt ? String(userData.createdAt) : new Date().toISOString()
          };
          setUser(adminUser);
          activeUserRef.current = adminUser;
          setProfileError(null);
          console.log('[AUTH] Admin verified successfully! UID:', currentUid);
          return { user: adminUser, role: 'admin' as const, error: undefined, exists: true };
        } else if (normalizedRole === 'customer') {
          // Requirement 3: If Firestore document exists and role == "customer": allow login, redirect to /account
          logAdminDiagnostics({
            authUid: currentUid,
            authEmail: currentEmail,
            firestorePath,
            documentExists: true,
            role: 'customer',
            adminAccess: 'denied',
            redirect: '/account'
          });

          const customerUser: User = {
            uid: currentUid,
            name: userData.name || firebaseUser.displayName || (currentEmail ? currentEmail.split('@')[0] : 'Customer'),
            email: currentEmail,
            role: 'customer',
            createdAt: userData.createdAt ? String(userData.createdAt) : new Date().toISOString()
          };
          setUser(customerUser);
          activeUserRef.current = customerUser;
          setProfileError(null);
          NoteNestDB.syncUserProfile(customerUser);
          console.log('[AUTH] Customer verified successfully! UID:', currentUid);
          return { user: customerUser, role: 'customer' as const, error: undefined, exists: true };
        } else {
          // Missing, undefined, or unknown role - NEVER default to customer or change existing role automatically!
          logAdminDiagnostics({
            authUid: currentUid,
            authEmail: currentEmail,
            firestorePath,
            documentExists: true,
            role: String(rawRole || 'undefined'),
            adminAccess: 'denied',
            redirect: 'none'
          });

          setUser(null);
          activeUserRef.current = null;
          const errorMsg = 'Profile role is undefined or invalid.';
          setProfileError(errorMsg);
          return { user: null, role: undefined, error: errorMsg, exists: true };
        }
      } catch (err: any) {
        console.log('[FIRESTORE] profile read failed');
        const errCode = err?.code || 'unknown';
        const rawMsg = err?.message || String(err);
        console.error('[FIRESTORE] Profile lookup error:', errCode, rawMsg);

        // Requirement 5: Firestore/network failure → "Unable to connect to the database. Please try again."
        const errorMsg = 'Unable to connect to the database. Please try again.';

        logAdminDiagnostics({
          authUid: currentUid,
          authEmail: currentEmail,
          firestorePath,
          documentExists: false,
          role: 'unknown (offline)',
          adminAccess: 'denied (database offline)',
          redirect: 'none (database offline)'
        });

        // Do not sign user out!
        setProfileError(errorMsg);
        return { user: null, role: undefined, error: errorMsg, isOffline: true };
      } finally {
        inFlightProfileLoads.current.delete(currentUid);
      }
    })();

    inFlightProfileLoads.current.set(currentUid, loadPromise);
    return loadPromise;
  };

  // onAuthStateChanged listener with proper loading and no race conditions
  useEffect(() => {
    if (!isConfigured) {
      setFirebaseUser(null);
      setUser(null);
      activeUserRef.current = null;
      setAuthLoading(false);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        console.log('[AUTH] onAuthStateChanged:', fbUser ? fbUser.uid : 'null');
        console.log('[AUTH] auth.currentUser:', auth.currentUser ? auth.currentUser.uid : 'null');

        // Single source of truth for Firebase Auth state:
        setFirebaseUser(fbUser);
        setAuthLoading(false);

        if (!fbUser) {
          console.log('[Auth Diagnostic onAuthStateChanged] auth.currentUser is null. Clearing user session.');
          setUser(null);
          activeUserRef.current = null;
          setProfileError(null);
          setProfileLoading(false);
          return;
        }

        // Avoid continuous loading if user is already verified with current UID
        if (activeUserRef.current && activeUserRef.current.uid === fbUser.uid) {
          console.log('[AUTH] onAuthStateChanged: user profile already active for UID:', fbUser.uid);
          setProfileLoading(false);
          return;
        }

        console.log('[AUTH] Firebase Auth success, UID:', fbUser.uid);
        setProfileLoading(true);

        try {
          await loadUserProfile(fbUser, 'onAuthStateChanged');
        } catch (err) {
          console.error('[FIRESTORE] onAuthStateChanged profile load error:', err);
        } finally {
          setProfileLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('[NoteNest Auth] Auth listener setup notice:', err);
      setAuthLoading(false);
      setProfileLoading(false);
    }
  }, [isConfigured]);

  const reloadProfile = async () => {
    if (!isConfigured) return;
    const auth = getFirebaseAuth();
    const current = auth.currentUser || firebaseUser;
    if (current) {
      setProfileLoading(true);
      try {
        await loadUserProfile(current);
      } catch (err) {
        console.error('[AuthContext] reloadProfile error:', err);
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // 1. CUSTOMER LOGIN - Strictly via Firebase Authentication Email/Password
  const loginCustomer = async (email: string, password?: string): Promise<{ success: boolean; role?: 'customer' | 'admin'; error?: string }> => {
    console.log('[AUTH] login started');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    if (!isConfigured) {
      return {
        success: false,
        error: 'Firebase Authentication is not configured. Please supply Firebase credentials in Settings.'
      };
    }

    // Requirement 7 & 9: Prevent duplicate requests
    if (authOpInProgress.current) {
      return { success: false, error: 'Authentication already in progress. Please wait.' };
    }
    authOpInProgress.current = true;

    console.log('[AUTH] signInWithEmailAndPassword started');
    console.log('[AUTH] signInWithEmailAndPassword started for:', cleanEmail);
    updateLoading(true);
    setProfileError(null);

    try {
      const auth = getFirebaseAuth();
      // Requirement 1: Customer login must use Firebase Authentication Email/Password
      const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      console.log('[AUTH] Firebase Auth success');
      console.log('[AUTH] UID:', credential.user.uid);
      console.log('[AUTH] auth.currentUser:', auth.currentUser?.uid);

      // Requirement 2: Read customer profile from /users/{currentUser.uid}
      const currentUser = auth.currentUser || credential.user;
      setFirebaseUser(currentUser);
      setAuthLoading(false);
      const res = await loadUserProfile(currentUser, 'loginCustomer');

      if (res.error) {
        return { success: false, error: res.error };
      }

      if (res.role === 'admin') {
        // Requirement 4: If profile.role === "admin", keep existing admin routing, do not convert to customer
        console.log('[ADMIN] Redirect: /admin/dashboard');
        return { success: true, role: 'admin' };
      }

      // Requirement 3: If role == "customer", allow login, redirect to /account
      console.log('[ROUTE] redirecting to: account');
      return { success: true, role: 'customer' };
    } catch (authErr: any) {
      console.error('[AUTH] Customer signInWithEmailAndPassword failed:', authErr?.code, authErr?.message);
      const code = authErr?.code || '';
      return { success: false, error: mapFirebaseLoginError(code) };
    } finally {
      authOpInProgress.current = false;
      setProfileLoading(false);
    }
  };

  // 2. CUSTOMER REGISTRATION - Strictly creates Firebase Auth account & customer role in Firestore
  const registerCustomer = async (name: string, email: string, password?: string): Promise<{ success: boolean; role?: 'customer'; error?: string }> => {
    console.log('[AUTH] login started');
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password is too weak.' };
    }

    if (!isConfigured) {
      return {
        success: false,
        error: 'Firebase Authentication is not configured. Please supply Firebase credentials in Settings.'
      };
    }

    // Requirement 9: Prevent duplicate requests
    if (authOpInProgress.current) {
      return { success: false, error: 'Registration already in progress. Please wait.' };
    }
    authOpInProgress.current = true;

    updateLoading(true);
    setProfileError(null);

    try {
      const auth = getFirebaseAuth();
      console.log('[AUTH] createUserWithEmailAndPassword started for:', cleanEmail);
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      console.log('[AUTH] Firebase Auth success');
      console.log('[AUTH] UID:', result.user.uid);
      console.log('[AUTH] auth.currentUser:', auth.currentUser?.uid);

      const firebaseUser = result.user;

      try {
        await updateProfile(firebaseUser, { displayName: cleanName });
      } catch (profileErr) {
        console.warn('[NoteNest Auth] Profile display name notice:', profileErr);
      }

      // Step 2: Create Firestore customer profile at /users/{firebaseUser.uid} with timeout (Requirement 3 & 4)
      console.log('[FIRESTORE] profile read started');
      console.log('[FIRESTORE] Profile write started for UID:', firebaseUser.uid);
      const db = getFirebaseDB();
      const userRef = doc(db, 'users', firebaseUser.uid);
      const profileData = {
        uid: firebaseUser.uid,
        name: cleanName,
        email: firebaseUser.email || cleanEmail,
        role: 'customer' as const,
        plan: 'free' as const,
        createdAt: serverTimestamp()
      };

      await withTimeout(
        setDoc(userRef, profileData),
        FIRESTORE_WRITE_TIMEOUT_MS,
        'Profile creation timed out'
      );

      console.log('[FIRESTORE] profile read success');
      console.log('[FIRESTORE] Profile write success');

      const registeredUser: User = {
        uid: firebaseUser.uid,
        name: cleanName,
        email: firebaseUser.email || cleanEmail,
        role: 'customer',
        createdAt: new Date().toISOString()
      };

      setFirebaseUser(firebaseUser);
      setAuthLoading(false);
      setUser(registeredUser);
      activeUserRef.current = registeredUser;
      setProfileError(null);
      NoteNestDB.syncUserProfile(registeredUser);
      return { success: true, role: 'customer' as const };
    } catch (err: any) {
      const code = err?.code || '';
      console.error('[AUTH] Registration error:', code, err?.message);
      if (code && code.startsWith('auth/')) {
        return { success: false, error: mapFirebaseRegistrationError(code) };
      }
      return { success: false, error: err?.message || 'Failed to create student account.' };
    } finally {
      authOpInProgress.current = false;
      setProfileLoading(false);
    }
  };

  // 3. ADMIN LOGIN - Strictly authenticates via Firebase Auth and verifies 'admin' role in Firestore
  const loginAdmin = async (email: string, password?: string): Promise<{ success: boolean; role?: 'admin'; error?: string }> => {
    console.log('[AUTH] Admin login started');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid admin email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter the admin security password.' };
    }

    if (!isConfigured) {
      return {
        success: false,
        error: 'Firebase Authentication is not configured. Please configure Firebase to enable admin sign in.'
      };
    }

    // Prevent duplicate requests
    if (authOpInProgress.current) {
      return { success: false, error: 'Authentication already in progress. Please wait.' };
    }
    authOpInProgress.current = true;

    console.log('[AUTH] Admin signInWithEmailAndPassword started for:', cleanEmail);
    updateLoading(true);
    setProfileError(null);

    try {
      const auth = getFirebaseAuth();
      // Requirement 1: After successful Firebase Email/Password authentication, get authenticated user
      const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      console.log('[AUTH] Firebase Auth success');
      console.log('[AUTH] UID:', credential.user.uid);

      const currentUser = auth.currentUser || credential.user;
      setFirebaseUser(currentUser);
      setAuthLoading(false);

      // Requirements 2, 3, 4, 8, 10, 13: Read /users/${currentUser.uid}, verify role === "admin"
      const res = await loadUserProfile(currentUser, 'loginAdmin');

      if (res.error) {
        return { success: false, error: res.error };
      }

      if (res.role === 'admin') {
        console.log('[ADMIN] Redirect: /admin/dashboard');
        return { success: true, role: 'admin' };
      }

      const roleFound = res.role || 'none';
      return {
        success: false,
        error: `Authenticated account (${cleanEmail}, UID: ${currentUser.uid}) has role "${roleFound}". If this is not the intended NoteNest Admin account, you must log in with the existing admin account instead of modifying data.`
      };
    } catch (authErr: any) {
      console.error('[AUTH] Admin signInWithEmailAndPassword failed:', authErr?.code, authErr?.message);
      const code = authErr?.code || '';
      return { success: false, error: mapFirebaseLoginError(code) };
    } finally {
      authOpInProgress.current = false;
      setProfileLoading(false);
    }
  };

  // General adapter methods
  const login = async (email: string, password?: string, forceRole?: 'customer' | 'admin') => {
    if (forceRole === 'admin') {
      return loginAdmin(email, password);
    }
    return loginCustomer(email, password);
  };

  const register = async (name: string, email: string, password?: string) => {
    return registerCustomer(name, email, password);
  };

  const logout = async () => {
    setProfileLoading(true);
    try {
      if (isConfigured) {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn('[NoteNest Auth] Logout notice:', err);
    } finally {
      setFirebaseUser(null);
      setUser(null);
      activeUserRef.current = null;
      setProfileError(null);
      setAuthLoading(false);
      setProfileLoading(false);
    }
  };

  // Firebase Built-in Password Reset Handlers
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[AUTH] sendPasswordReset started');
    try {
      return await sendFirebasePasswordReset(email);
    } catch (err: any) {
      console.error('[AUTH] sendPasswordReset caught exception:', err);
      return { success: false, error: err?.message || 'Failed to send password reset email.' };
    }
  };

  const verifyResetCode = async (oobCode: string): Promise<{ success: boolean; email?: string; error?: string }> => {
    console.log('[AUTH] verifyResetCode started');
    try {
      return await verifyFirebaseResetCode(oobCode);
    } catch (err: any) {
      console.error('[AUTH] verifyResetCode caught exception:', err);
      return {
        success: false,
        error: 'This password reset link is invalid or has expired. Please request a new password reset link.'
      };
    }
  };

  const confirmResetPassword = async (oobCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[AUTH] confirmResetPassword started');
    try {
      return await confirmFirebasePasswordReset(oobCode, newPassword);
    } catch (err: any) {
      console.error('[AUTH] confirmResetPassword caught exception:', err);
      return { success: false, error: err?.message || 'Failed to update password.' };
    }
  };

  const activeFirebaseUser = firebaseUser || (isConfigured ? getFirebaseAuth().currentUser : null);
  const isUidSynchronized = Boolean(activeFirebaseUser && user && activeFirebaseUser.uid === user.uid);
  const isAdmin = Boolean(isUidSynchronized && user?.role === 'admin');
  const isCustomer = Boolean(isUidSynchronized && user?.role === 'customer');

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: activeFirebaseUser,
        profile: user,
        loading: authLoading || profileLoading,
        authLoading,
        profileLoading,
        profileError,
        reloadProfile,
        loginCustomer,
        registerCustomer,
        loginAdmin,
        login,
        register,
        logout,
        sendPasswordReset,
        verifyResetCode,
        confirmResetPassword,
        isAdmin,
        isCustomer,
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
