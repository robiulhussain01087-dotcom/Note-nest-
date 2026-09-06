/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  ActionCodeSettings,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  enableNetwork,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  FirebaseStorage
} from 'firebase/storage';
import firebaseConfigJson from '@/firebase-applet-config.json';

// Connected Firebase Project Details (from official workspace configuration)
const PROVISIONED_PROJECT = {
  apiKey: 'AIzaSyBXkjrPUMhUXnA5NB_idsLsKPnDMvsIMFU',
  authDomain: 'note-nest-3b736.firebaseapp.com',
  projectId: 'note-nest-3b736',
  storageBucket: 'note-nest-3b736.firebasestorage.app',
  messagingSenderId: '549336310588',
  appId: '1:571970575824:web:7f38b2ed9540767f5dedd5',
  firestoreDatabaseId: '(default)'
};

// Helper to sanitize environment or config values that may contain accidental quotes or trailing commas
function cleanConfigValue(val: any): string {
  if (!val) return '';
  let s = String(val).trim();
  while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (s.endsWith(',')) s = s.slice(0, -1).trim();
  while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (s.endsWith(',')) s = s.slice(0, -1).trim();
  return s;
}

// 1. Resolve Firebase Configuration
// Uses officially provisioned firebase-applet-config.json and verified workspace configuration
export function getFirebaseConfig() {
  const rawJson = (firebaseConfigJson as any)?.default || (firebaseConfigJson as any) || {};

  const projectId =
    cleanConfigValue(rawJson.projectId) ||
    cleanConfigValue(import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID) ||
    PROVISIONED_PROJECT.projectId;

  const rawDbId =
    cleanConfigValue(rawJson.firestoreDatabaseId) ||
    cleanConfigValue(import.meta.env && import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID);

  // If the database is "(default)" or "default", normalize it to "(default)"
  const firestoreDatabaseId = (!rawDbId || rawDbId === 'default' || rawDbId === '(default)')
    ? '(default)'
    : rawDbId;

  const apiKey =
    cleanConfigValue(rawJson.apiKey) ||
    cleanConfigValue(import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) ||
    PROVISIONED_PROJECT.apiKey;

  const authDomain =
    cleanConfigValue(rawJson.authDomain) ||
    cleanConfigValue(import.meta.env && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) ||
    PROVISIONED_PROJECT.authDomain;

  let storageBucket =
    cleanConfigValue(rawJson.storageBucket) ||
    cleanConfigValue(import.meta.env && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) ||
    PROVISIONED_PROJECT.storageBucket ||
    `${projectId}.firebasestorage.app`;

  // Ensure storageBucket strictly matches the active Firebase project
  if (storageBucket.includes('top-limiter-dgbcx') || (!storageBucket.includes(projectId) && !storageBucket.includes('appspot.com'))) {
    storageBucket = `${projectId}.firebasestorage.app`;
  }

  const messagingSenderId =
    cleanConfigValue(rawJson.messagingSenderId) ||
    cleanConfigValue(import.meta.env && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    PROVISIONED_PROJECT.messagingSenderId;

  const appId =
    cleanConfigValue(rawJson.appId) ||
    cleanConfigValue(import.meta.env && import.meta.env.VITE_FIREBASE_APP_ID) ||
    PROVISIONED_PROJECT.appId;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    firestoreDatabaseId
  };
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
}

// 2. Initialize Firebase App and Services
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const config = getFirebaseConfig();
    console.log('[NoteNest Firebase] Initializing Firebase App with:', {
      projectId: config.projectId,
      appId: config.appId,
      authDomain: config.authDomain,
      firestoreDatabaseId: config.firestoreDatabaseId
    });
    app = getApps().length > 0 ? getApp() : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function getFirebaseDB(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    const config = getFirebaseConfig();
    const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
      ? config.firestoreDatabaseId
      : undefined;

    console.log('[NoteNest Firebase] Initializing Firestore connection:', {
      projectId: config.projectId,
      firestoreDatabaseId: dbId || '(default)',
      appId: config.appId
    });

    try {
      // Use initializeFirestore with experimentalAutoDetectLongPolling:
      // This prevents "Failed to get document because the client is offline" errors
      // caused by WebChannel streaming disconnects in iframes and mobile web browsers.
      db = initializeFirestore(
        firebaseApp,
        {
          experimentalAutoDetectLongPolling: true
        },
        dbId
      );
      console.log('[NoteNest Firebase] Firestore initialized via initializeFirestore with long-polling auto-detect.');
    } catch (initErr: any) {
      console.warn('[NoteNest Firebase] initializeFirestore already initialized or returned error, falling back to getFirestore:', initErr?.message);
      db = dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
    }

    // Proactively ensure network is enabled for normal online reads
    try {
      enableNetwork(db).catch((netErr) => {
        console.warn('[NoteNest Firebase] enableNetwork warning (non-fatal):', netErr?.message);
      });
    } catch {
      // Ignore sync exceptions in enableNetwork
    }
  }
  return db;
}

let storage: FirebaseStorage | null = null;

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    const firebaseApp = getFirebaseApp();
    const config = getFirebaseConfig();
    const cleanBucket = config.storageBucket ? config.storageBucket.replace(/^gs:\/\//, '').trim() : `${config.projectId}.firebasestorage.app`;
    storage = cleanBucket
      ? getStorage(firebaseApp, `gs://${cleanBucket}`)
      : getStorage(firebaseApp);
  }
  return storage;
}

/**
 * Validates an image file prior to upload.
 * Enforces valid image MIME/extensions (PNG, JPG, JPEG, WebP) and maximum size.
 */
export function validateImageFile(file?: File | null, maxMb: number = 5): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No image file selected. Please select an image.' };
  }

  const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const ext = file.name ? (file.name.split('.').pop()?.toLowerCase() || '') : '';
  const validExts = ['png', 'jpg', 'jpeg', 'webp'];

  const mimeMatches = file.type ? validMimes.includes(file.type.toLowerCase()) : false;
  const extMatches = validExts.includes(ext);

  if (!mimeMatches && !extMatches) {
    return {
      valid: false,
      error: `Invalid file format (.${ext || 'unknown'}). Only PNG, JPG, JPEG, and WebP images are allowed.`
    };
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb} MB) exceeds the maximum allowed limit of ${maxMb} MB.`
    };
  }

  return { valid: true };
}

/**
 * Resilient upload using uploadBytesResumable with a strict timeout and
 * bucket fallback mechanism (.firebasestorage.app <-> .appspot.com).
 * Guarantees that upload will never hang or leave the UI permanently stuck.
 */
async function uploadToStorageWithTimeout(
  path: string,
  file: File | Blob,
  metadata?: any,
  timeoutMs: number = 20000
): Promise<string> {
  const firebaseApp = getFirebaseApp();
  const config = getFirebaseConfig();
  const primaryBucket = config.storageBucket.replace(/^gs:\/\//, '').trim();
  const fallbackBucket = primaryBucket.includes('firebasestorage.app')
    ? primaryBucket.replace('firebasestorage.app', 'appspot.com')
    : `${config.projectId}.appspot.com`;

  const doUpload = (storageInstance: FirebaseStorage, bucketName: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      let isSettled = false;
      const r = storageRef(storageInstance, path);
      const uploadTask = uploadBytesResumable(r, file, metadata);

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try {
            uploadTask.cancel();
          } catch {
            // Ignore cancellation error
          }
          const timeoutErr: any = new Error(`Network error: Storage upload timed out after ${Math.round(timeoutMs / 1000)}s on ${bucketName}.`);
          timeoutErr.code = 'storage/retry-limit-exceeded';
          reject(timeoutErr);
        }
      }, timeoutMs);

      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            reject(error);
          }
        },
        async () => {
          if (!isSettled) {
            clearTimeout(timer);
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              isSettled = true;
              resolve(url);
            } catch (urlErr) {
              isSettled = true;
              reject(urlErr);
            }
          }
        }
      );
    });
  };

  try {
    return await doUpload(getFirebaseStorage(), primaryBucket);
  } catch (primaryErr: any) {
    const code = (primaryErr && (primaryErr.code || primaryErr.name)) || '';
    const msg = (primaryErr && primaryErr.message) || String(primaryErr);

    // If the bucket was not found, attempt alternate standard bucket name
    if (
      (code.includes('bucket-not-found') ||
       code.includes('project-not-found') ||
       msg.toLowerCase().includes('bucket') ||
       msg.toLowerCase().includes('not exist')) &&
      primaryBucket !== fallbackBucket
    ) {
      console.warn(`[Firebase Storage] Primary bucket "${primaryBucket}" failed (${code}), trying fallback bucket "${fallbackBucket}"...`);
      try {
        const fallbackStorage = getStorage(firebaseApp, `gs://${fallbackBucket}`);
        return await doUpload(fallbackStorage, fallbackBucket);
      } catch (fallbackErr) {
        console.error('[Firebase Storage] Fallback bucket attempt also failed:', fallbackErr);
        throw primaryErr;
      }
    }

    throw primaryErr;
  }
}

// Upload PDF to Firebase Storage /notes/{noteId}/pdf/{filename} with dataURL fallback
export async function uploadPdfToStorage(noteId: string, file: File | Blob, fileName?: string): Promise<string> {
  const safeName = (fileName || (file as File).name || 'note.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `notes/${noteId}/pdf/${Date.now()}_${safeName}`;
  try {
    const s = getFirebaseStorage();
    const r = storageRef(s, path);
    const snap = await uploadBytes(r, file);
    return await getDownloadURL(snap.ref);
  } catch (err) {
    console.warn('[Firebase Storage] PDF upload fallback to data URL:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Upload Thumbnail to Firebase Storage /notes/{noteId}/thumbnail/{filename} with dataURL fallback
export async function uploadThumbnailToStorage(noteId: string, file: File | Blob): Promise<string> {
  const safeName = ((file as File).name || 'thumbnail.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `notes/${noteId}/thumbnail/${Date.now()}_${safeName}`;
  try {
    const s = getFirebaseStorage();
    const r = storageRef(s, path);
    const snap = await uploadBytes(r, file);
    return await getDownloadURL(snap.ref);
  } catch (err) {
    console.warn('[Firebase Storage] Thumbnail upload fallback to data URL:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Upload Payment Screenshot to Firebase Storage /payments/{paymentId}/screenshot/{filename}
export async function uploadScreenshotToStorage(paymentId: string, file: File | Blob): Promise<string> {
  const safeName = ((file as File).name || 'screenshot.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `payments/${paymentId}/screenshot/${Date.now()}_${safeName}`;
  try {
    const s = getFirebaseStorage();
    const r = storageRef(s, path);
    const snap = await uploadBytes(r, file);
    return await getDownloadURL(snap.ref);
  } catch (err) {
    console.warn('[Firebase Storage] Screenshot upload fallback to data URL:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Upload Payment QR code to Firebase Storage settings/payment/qr/{filename}
// Uploads the EXACT selected image without alteration, cropping, or compression
export async function uploadQrCodeToStorage(file: File | Blob): Promise<string> {
  console.log('[ASSET] QR upload started');
  const originalName = (file as File).name || 'upi_qr.png';
  const extension = originalName.includes('.') ? (originalName.split('.').pop()?.toLowerCase() || 'png') : 'png';
  const cleanBaseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFileName = `${Date.now()}_${cleanBaseName}.${extension}`;
  const path = `settings/payment/qr/${safeFileName}`;

  const metadata = file.type ? { contentType: file.type } : undefined;
  const downloadUrl = await uploadToStorageWithTimeout(path, file, metadata, 20000);
  console.log('[ASSET] QR upload completed');
  console.log('[ASSET] QR download URL obtained');
  return downloadUrl;
}

// Upload Website/Branding Logo to Firebase Storage settings/branding/logo/{filename}
// Preserves the original uploaded logo image
export async function uploadLogoToStorage(file: File | Blob): Promise<string> {
  console.log('[ASSET] Logo upload started');
  const originalName = (file as File).name || 'notenest_logo.png';
  const extension = originalName.includes('.') ? (originalName.split('.').pop()?.toLowerCase() || 'png') : 'png';
  const cleanBaseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFileName = `${Date.now()}_${cleanBaseName}.${extension}`;
  const path = `settings/branding/logo/${safeFileName}`;

  const metadata = file.type ? { contentType: file.type } : undefined;
  const downloadUrl = await uploadToStorageWithTimeout(path, file, metadata, 20000);
  console.log('[ASSET] Logo upload completed');
  console.log('[ASSET] Logo download URL obtained');
  return downloadUrl;
}

export function diagnoseFirebaseStorageError(err: any, assetType: 'Logo' | 'QR'): { reason: string; message: string; code: string } {
  const code = (err && (err.code || err.name)) || 'storage/unknown';
  const rawMessage = (err && err.message) || String(err);
  const lowerMsg = rawMessage.toLowerCase();

  let reason = 'upload failed';
  let message = rawMessage;

  if (
    code.includes('unauthorized') ||
    code.includes('permission-denied') ||
    lowerMsg.includes('permission') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('access-control')
  ) {
    reason = 'Firebase Storage permission denied';
    message = 'Firebase Storage permission denied. Please verify storage security rules and ensure you are logged in as an administrator.';
  } else if (
    code.includes('bucket-not-found') ||
    lowerMsg.includes('bucket') ||
    lowerMsg.includes('does not exist')
  ) {
    reason = 'Storage bucket not found';
    message = `Storage bucket not found. The configured storage bucket does not exist in project ${getFirebaseConfig().projectId}.`;
  } else if (
    code.includes('project-not-found') ||
    lowerMsg.includes('project not found') ||
    lowerMsg.includes('not enabled')
  ) {
    reason = 'Firebase Storage not initialized';
    message = 'Firebase Storage is not enabled or not initialized in the Firebase project console.';
  } else if (
    code.includes('retry-limit-exceeded') ||
    code.includes('network') ||
    lowerMsg.includes('timed out') ||
    lowerMsg.includes('network') ||
    lowerMsg.includes('timeout')
  ) {
    reason = 'Network error';
    message = 'Network error: Connection to Firebase Storage timed out or failed. Please check your network connection.';
  } else if (
    code.includes('quota') ||
    lowerMsg.includes('quota') ||
    lowerMsg.includes('billing')
  ) {
    reason = 'Firebase Storage quota exceeded';
    message = 'Firebase Storage quota exceeded for this Firebase project.';
  } else if (lowerMsg.includes('not initialized')) {
    reason = 'Firebase Storage not initialized';
    message = 'Firebase Storage instance is not properly initialized.';
  }

  return { reason, message, code };
}

// Pre-initialize on module load in client
try {
  if (typeof window !== 'undefined') {
    getFirebaseApp();
    getFirebaseAuth();
    getFirebaseDB();
  }
} catch (err) {
  console.warn('[NoteNest Firebase] Lazy-init notice:', err);
}

// User-friendly mapping of Firebase Authentication error codes for Registration
export function mapFirebaseRegistrationError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is disabled in Firebase Console.';
    case 'auth/network-request-failed':
      return 'Network communication failed. Please verify your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily locked due to multiple attempts. Please try again later.';
    case 'FIREBASE_NOT_CONFIGURED':
      return 'Firebase Authentication is not configured. Please supply Firebase credentials in Settings.';
    default:
      return 'Registration failed. Please verify your details and try again.';
  }
}

// User-friendly mapping of Firebase Authentication error codes for Login
export function mapFirebaseLoginError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Unable to connect to the database. Please try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is disabled in Firebase Console.';
    case 'FIREBASE_NOT_CONFIGURED':
      return 'Firebase Authentication is not configured. Please supply Firebase credentials in Settings.';
    default:
      return 'Incorrect email or password.';
  }
}

// Timeout helper for Promise-based operations to prevent indefinite loading
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMsg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMsg));
    }, timeoutMs);

    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// General fallback error mapping
export function mapFirebaseAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/network-request-failed':
      return 'Unable to connect to the database. Please try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is disabled in Firebase Console.';
    case 'FIREBASE_NOT_CONFIGURED':
      return 'Firebase Authentication is not configured. Please supply your Firebase API credentials in Settings or environment variables.';
    default:
      return 'Incorrect email or password.';
  }
}

// Requirement 13 & 14: Dedicated Firestore connectivity test
export async function testFirestoreConnectivity(targetUid?: string) {
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();
  const currentUid = targetUid || auth.currentUser?.uid;

  console.log('[Firestore Connectivity Test] Initiating test with config:', {
    firebaseProjectId: config.projectId,
    firebaseAppId: config.appId,
    firestoreDatabaseId: config.firestoreDatabaseId,
    currentFirebaseUid: currentUid || 'none'
  });

  if (!currentUid) {
    console.warn('[Firestore Connectivity Test] No user UID provided or authenticated.');
    return { success: false, reason: 'no-uid' };
  }

  try {
    const db = getFirebaseDB();
    const snap = await getDoc(doc(db, 'users', currentUid));
    console.log('[Firestore Connectivity Test] SUCCESS:', {
      firebaseProjectId: config.projectId,
      firebaseAppId: config.appId,
      firestoreDatabaseId: config.firestoreDatabaseId,
      currentFirebaseUid: currentUid,
      firestoreReadResult: snap.exists() ? 'found' : 'not-found',
      firestoreErrorCode: null,
      data: snap.data()
    });
    return { success: true, exists: snap.exists(), data: snap.data() };
  } catch (err: any) {
    console.error('[Firestore Connectivity Test] FAILED:', {
      firebaseProjectId: config.projectId,
      firebaseAppId: config.appId,
      firestoreDatabaseId: config.firestoreDatabaseId,
      currentFirebaseUid: currentUid,
      firestoreReadResult: 'error',
      firestoreErrorCode: err?.code || 'unknown',
      errorMessage: err?.message || String(err)
    });
    return { success: false, error: err?.message, code: err?.code };
  }
}

// Dedicated Password Reset Error Mapper
export function mapFirebasePasswordResetError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/user-not-found':
      return 'If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a few minutes before trying again.';
    case 'auth/network-request-failed':
      return 'Network communication failed. Please verify your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is disabled in Firebase Console.';
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return 'This password reset link is invalid or has expired. Please request a new password reset link.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'FIREBASE_NOT_CONFIGURED':
      return 'Firebase Authentication is not configured. Please check your settings.';
    default:
      return 'An error occurred while processing your password reset request. Please try again.';
  }
}

// Send Firebase Password Reset Email using built-in Firebase Auth
export async function sendFirebasePasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      error: 'Firebase Authentication is not configured.'
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const auth = getFirebaseAuth();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const actionCodeSettings: ActionCodeSettings = {
    url: `${currentOrigin}/reset-password`,
    handleCodeInApp: true
  };

  console.log('[AUTH] sendPasswordResetEmail initiated for email format:', cleanEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'));

  try {
    try {
      // First attempt with NoteNest action return URL
      await withTimeout(
        sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings),
        10000,
        'Password reset request timed out. Please check your connection and try again.'
      );
    } catch (actErr: any) {
      // If the domain is not yet in Firebase Console Authorized Domains for continueUrl,
      // fallback cleanly to standard sendPasswordResetEmail without actionCodeSettings
      if (actErr?.code === 'auth/unauthorized-continue-uri') {
        console.warn('[NoteNest Auth] Authorized continue URI notice, falling back to standard reset email:', actErr?.message);
        await withTimeout(
          sendPasswordResetEmail(auth, cleanEmail),
          10000,
          'Password reset request timed out. Please check your connection and try again.'
        );
      } else {
        throw actErr;
      }
    }
    console.log('[AUTH] sendPasswordResetEmail completed successfully');
    return { success: true };
  } catch (err: any) {
    const code = err?.code || '';
    console.error('[AUTH] sendPasswordResetEmail failed:', code, err?.message);
    if (code === 'auth/user-not-found') {
      // Protect user privacy & prevent account enumeration per security guidelines
      return { success: true };
    }
    return { success: false, error: mapFirebasePasswordResetError(code) };
  }
}

// Verify Firebase Password Reset Code (oobCode)
export async function verifyFirebaseResetCode(oobCode: string): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      error: 'Firebase Authentication is not configured.'
    };
  }

  const cleanCode = oobCode ? oobCode.trim() : '';
  if (!cleanCode) {
    return {
      success: false,
      error: 'This password reset link is invalid or has expired. Please request a new password reset link.'
    };
  }

  const auth = getFirebaseAuth();
  console.log('[AUTH] verifyPasswordResetCode checking reset code');

  try {
    const email = await withTimeout(
      verifyPasswordResetCode(auth, cleanCode),
      8000,
      'Verification request timed out. Please check your connection.'
    );
    console.log('[AUTH] verifyPasswordResetCode verified successfully for email format:', email.replace(/(.{2})(.*)(@.*)/, '$1***$3'));
    return { success: true, email };
  } catch (err: any) {
    const code = err?.code || '';
    console.error('[AUTH] verifyPasswordResetCode failed:', code, err?.message);
    return {
      success: false,
      error: 'This password reset link is invalid or has expired. Please request a new password reset link.'
    };
  }
}

// Confirm Firebase Password Reset (oobCode, newPassword)
export async function confirmFirebasePasswordReset(oobCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      error: 'Firebase Authentication is not configured.'
    };
  }

  const cleanCode = oobCode ? oobCode.trim() : '';
  if (!cleanCode) {
    return {
      success: false,
      error: 'This password reset link is invalid or has expired. Please request a new password reset link.'
    };
  }

  if (!newPassword) {
    return { success: false, error: 'Please enter a new password.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'Password is too weak.' };
  }

  const auth = getFirebaseAuth();
  console.log('[AUTH] confirmPasswordReset executing');

  try {
    await withTimeout(
      confirmPasswordReset(auth, cleanCode, newPassword),
      10000,
      'Password reset request timed out. Please try again.'
    );
    console.log('[AUTH] confirmPasswordReset completed successfully');
    return { success: true };
  } catch (err: any) {
    const code = err?.code || '';
    console.error('[AUTH] confirmPasswordReset failed:', code, err?.message);
    if (code === 'auth/weak-password') {
      return { success: false, error: 'Password is too weak.' };
    }
    if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
      return {
        success: false,
        error: 'This password reset link is invalid or has expired. Please request a new password reset link.'
      };
    }
    return { success: false, error: mapFirebasePasswordResetError(code) };
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  initializeFirestore,
  enableNetwork
};
export type { FirebaseUser, Auth, Firestore, ActionCodeSettings };
