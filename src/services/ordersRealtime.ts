import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  FirestoreError
} from 'firebase/firestore';
import { getFirebaseDB, getFirebaseAuth, withTimeout } from './firebase';
import { Order, Purchase, Payment, PaymentStatus } from '../types';
import { NoteNestDB } from './db';

/**
 * Normalizes an unknown Firestore document data object into a valid Order.
 */
export function normalizeOrder(raw: any, docId: string): Order {
  return {
    id: raw?.id || docId,
    customerId: raw?.customerId || raw?.userId || '',
    userId: raw?.userId || raw?.customerId || '',
    customerName: raw?.customerName || raw?.userName || 'Customer',
    customerEmail: raw?.customerEmail || raw?.userEmail || '',
    chapterId: raw?.chapterId || undefined,
    chapterTitle: raw?.chapterTitle || undefined,
    accessType: raw?.accessType === 'premium' ? 'premium' : 'normal',
    noteId: raw?.noteId || raw?.chapterId || undefined,
    noteTitle: raw?.noteTitle || raw?.chapterTitle || 'Study Material',
    amount: typeof raw?.amount === 'number' && !isNaN(raw?.amount) ? raw.amount : 0,
    paymentMethod: raw?.paymentMethod || 'manual_upi',
    paymentStatus: (raw?.paymentStatus || raw?.status || 'pending') as PaymentStatus,
    utr: raw?.utr || undefined,
    screenshotUrl: raw?.screenshotUrl || undefined,
    createdAt: raw?.createdAt || new Date().toISOString(),
    verifiedAt: raw?.verifiedAt || undefined,
    verifiedBy: raw?.verifiedBy || undefined,
    adminNote: raw?.adminNote || undefined
  };
}

/**
 * Normalizes an unknown Firestore document data object into a valid Purchase.
 */
export function normalizePurchase(raw: any, docId: string): Purchase {
  return {
    id: raw?.id || docId,
    customerId: raw?.customerId || raw?.userId || '',
    chapterId: raw?.chapterId || undefined,
    chapterTitle: raw?.chapterTitle || undefined,
    accessType: raw?.accessType === 'premium' ? 'premium' : 'normal',
    noteId: raw?.noteId || raw?.chapterId || '',
    orderId: raw?.orderId || '',
    noteTitle: raw?.noteTitle || raw?.chapterTitle || 'Unlocked Material',
    purchasedPrice: typeof raw?.purchasedPrice === 'number' && !isNaN(raw?.purchasedPrice)
      ? raw.purchasedPrice
      : (typeof raw?.amount === 'number' ? raw.amount : 0),
    purchasedAt: raw?.purchasedAt || raw?.createdAt || new Date().toISOString(),
    accessStatus: raw?.accessStatus === 'revoked' ? 'revoked' : 'active',
    course: raw?.course || raw?.classOrCourse || 'Curriculum',
    semester: raw?.semester || 'Academic Session',
    subject: raw?.subject || 'All Subjects'
  };
}

/**
 * 1. CUSTOMER ORDER CREATION
 * Persists an order to Firestore `/orders/{orderId}` and `/payments/{orderId}`.
 * The write must succeed against Firestore security rules.
 */
export async function submitCustomerOrder(data: {
  orderId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  chapterId?: string;
  chapterTitle?: string;
  accessType?: 'normal' | 'premium';
  noteId?: string;
  noteTitle: string;
  amount: number;
  paymentMethod?: 'manual_upi';
  utr: string;
  screenshotUrl?: string;
}): Promise<Order> {
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Authentication required: Please sign in to submit your payment proof.');
  }

  // Enforce customer ownership matching request.auth.uid for Firestore security rules
  const canonicalCustomerId = currentUser.uid;
  const orderId = data.orderId && data.orderId.trim().length > 0
    ? data.orderId.trim()
    : `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    customerId: canonicalCustomerId,
    userId: canonicalCustomerId,
    customerName: data.customerName || currentUser.displayName || 'Student',
    customerEmail: data.customerEmail || currentUser.email || '',
    chapterId: data.chapterId || undefined,
    chapterTitle: data.chapterTitle || undefined,
    accessType: data.accessType || 'normal',
    noteId: data.noteId || data.chapterId || 'chapter-general',
    noteTitle: data.noteTitle || data.chapterTitle || 'Study Material',
    amount: Number(data.amount) || 0,
    paymentMethod: data.paymentMethod || 'manual_upi',
    paymentStatus: 'pending',
    utr: data.utr.trim(),
    screenshotUrl: data.screenshotUrl || '',
    createdAt: now
  };

  // Clean object to prevent undefined fields in Firestore
  const cleanOrderPayload = Object.fromEntries(
    Object.entries(newOrder).filter(([_, val]) => val !== undefined)
  );

  const db = getFirebaseDB();

  // Primary write: Firestore /orders/{orderId}
  const orderRef = doc(db, 'orders', orderId);
  await withTimeout(
    setDoc(orderRef, cleanOrderPayload),
    12000,
    'Timed out writing order to Firestore. Please check your network connection.'
  );

  // Secondary mirror write: Firestore /payments/{orderId} for legacy payment lookups
  try {
    const paymentRecord: Payment = {
      id: orderId,
      customerId: canonicalCustomerId,
      userId: canonicalCustomerId,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      chapterId: newOrder.chapterId,
      chapterTitle: newOrder.chapterTitle,
      accessType: newOrder.accessType,
      noteId: newOrder.noteId || 'chapter-general',
      noteTitle: newOrder.noteTitle,
      amount: newOrder.amount,
      utr: newOrder.utr || '',
      paymentDate: now,
      screenshotUrl: newOrder.screenshotUrl || '',
      status: 'pending',
      createdAt: now
    };

    const cleanPaymentPayload = Object.fromEntries(
      Object.entries(paymentRecord).filter(([_, val]) => val !== undefined)
    );

    const payRef = doc(db, 'payments', orderId);
    await withTimeout(setDoc(payRef, cleanPaymentPayload), 5000, 'Payment sync timeout');
  } catch (payErr) {
    console.warn('[OrdersRealtime] Secondary payments mirror write notice:', payErr);
  }

  // Update local DB cache for fast responsive fallbacks
  NoteNestDB.createOrder({
    customerId: canonicalCustomerId,
    customerName: newOrder.customerName,
    customerEmail: newOrder.customerEmail,
    chapterId: newOrder.chapterId,
    chapterTitle: newOrder.chapterTitle,
    accessType: newOrder.accessType,
    noteId: newOrder.noteId || 'chapter-general',
    noteTitle: newOrder.noteTitle,
    amount: newOrder.amount,
    paymentMethod: 'manual_upi'
  });
  NoteNestDB.submitPaymentProof(orderId, newOrder.utr || '', newOrder.screenshotUrl);

  return newOrder;
}

/**
 * 3. ADMIN VERIFICATION
 * Updates Firestore `/orders/{orderId}`, creates `/purchases/{purchaseId}` upon approval,
 * and preserves the existing verification workflow without creating duplicate records.
 */
export async function verifyOrderInFirestore(
  orderId: string,
  status: 'paid' | 'rejected',
  verifiedBy: string,
  adminNote?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const db = getFirebaseDB();
    const orderRef = doc(db, 'orders', orderId);
    const verifiedAt = new Date().toISOString();

    // 1. Fetch current order document to ensure we have the complete data
    let existingOrder: Order | null = null;
    try {
      const snap = await withTimeout(getDoc(orderRef), 5000, 'Timed out reading order');
      if (snap.exists()) {
        existingOrder = normalizeOrder(snap.data(), snap.id);
      }
    } catch (readErr) {
      console.warn('[OrdersRealtime] Direct order read error, checking local DB:', readErr);
      existingOrder = NoteNestDB.getOrders().find(o => o.id === orderId) || null;
    }

    // 2. Update Firestore /orders/{orderId}
    await withTimeout(
      updateDoc(orderRef, {
        paymentStatus: status,
        verifiedAt,
        verifiedBy,
        adminNote: adminNote || ''
      }),
      8000,
      'Timed out updating order in Firestore.'
    );

    // 3. Mirror status in Firestore /payments/{orderId} if present
    try {
      const payRef = doc(db, 'payments', orderId);
      await withTimeout(
        updateDoc(payRef, {
          status: status === 'paid' ? 'successful' : 'rejected',
          verifiedAt,
          verifiedBy,
          adminNote: adminNote || ''
        }),
        3000,
        'Payment mirror update timeout'
      );
    } catch {
      // Ignored if payment doc does not exist
    }

    // 4. If approved ('paid'), create unlocked purchase in /purchases/{purchaseId}
    if (status === 'paid' && existingOrder) {
      const targetId = existingOrder.chapterId || existingOrder.noteId || 'unlocked-item';
      const purchaseId = `pur-${existingOrder.customerId}-${targetId}`;
      const chapter = existingOrder.chapterId ? NoteNestDB.getChapterById(existingOrder.chapterId) : null;
      const note = existingOrder.noteId ? NoteNestDB.getNoteById(existingOrder.noteId) : null;

      const purchaseRecord: Purchase = {
        id: purchaseId,
        customerId: existingOrder.customerId,
        chapterId: existingOrder.chapterId || undefined,
        chapterTitle: existingOrder.chapterTitle || chapter?.title || existingOrder.noteTitle,
        accessType: existingOrder.accessType || chapter?.accessType || 'normal',
        noteId: existingOrder.noteId || existingOrder.chapterId || targetId,
        orderId: existingOrder.id,
        noteTitle: existingOrder.noteTitle,
        purchasedPrice: existingOrder.amount,
        purchasedAt: verifiedAt,
        accessStatus: 'active',
        course: chapter?.classOrCourse || note?.course || 'Curriculum',
        semester: chapter?.semester || note?.semester || 'Academic Session',
        subject: chapter?.subject || note?.subject || 'All Subjects'
      };

      const cleanPurchase = Object.fromEntries(
        Object.entries(purchaseRecord).filter(([_, val]) => val !== undefined)
      );

      const purchaseRef = doc(db, 'purchases', purchaseId);
      await withTimeout(
        setDoc(purchaseRef, cleanPurchase),
        8000,
        'Timed out writing purchase record to Firestore.'
      );
    }

    // 5. Update local NoteNestDB cache
    const updatedLocal = NoteNestDB.verifyPayment(orderId, status, verifiedBy, adminNote);

    return {
      success: true,
      order: existingOrder ? { ...existingOrder, paymentStatus: status, verifiedAt, verifiedBy } : (updatedLocal || undefined)
    };
  } catch (err: any) {
    console.error('[OrdersRealtime.verifyOrderInFirestore] Verification failed:', err);
    return {
      success: false,
      error: err?.message || 'Failed to update order verification in Firestore.'
    };
  }
}

/**
 * 2. ADMIN REAL-TIME ORDER LIST
 * Listens continuously to Firestore `/orders` collection via onSnapshot().
 * Automatically emits new and updated orders.
 */
export function subscribeToAdminOrders(
  onData: (orders: Order[]) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  try {
    const db = getFirebaseDB();
    const ordersCol = collection(db, 'orders');

    const unsubscribe = onSnapshot(
      ordersCol,
      (snapshot) => {
        const ordersList: Order[] = [];
        snapshot.forEach((d) => {
          ordersList.push(normalizeOrder(d.data(), d.id));
        });

        // Sort orders by createdAt descending (newest orders first)
        ordersList.sort((a, b) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        // Synchronize local database cache
        NoteNestDB.saveOrders(ordersList);

        onData(ordersList);
      },
      (error) => {
        console.error('[OrdersRealtime] Admin orders listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[OrdersRealtime] Failed to initialize admin orders subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Listens continuously to Firestore `/purchases` collection for Admin.
 */
export function subscribeToAdminPurchases(
  onData: (purchases: Purchase[]) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  try {
    const db = getFirebaseDB();
    const purchasesCol = collection(db, 'purchases');

    const unsubscribe = onSnapshot(
      purchasesCol,
      (snapshot) => {
        const purchasesList: Purchase[] = [];
        snapshot.forEach((d) => {
          purchasesList.push(normalizePurchase(d.data(), d.id));
        });

        // Sort purchases by purchasedAt descending
        purchasesList.sort((a, b) => {
          return new Date(b.purchasedAt || 0).getTime() - new Date(a.purchasedAt || 0).getTime();
        });

        // Synchronize local cache
        NoteNestDB.savePurchases(purchasesList);

        onData(purchasesList);
      },
      (error) => {
        console.error('[OrdersRealtime] Admin purchases listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[OrdersRealtime] Failed to initialize admin purchases subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * 4. & 5. CUSTOMER REAL-TIME PURCHASE UPDATE
 * Listens continuously to Firestore `/purchases` for the authenticated customer.
 * Uses `where('customerId', '==', customerId)` to ensure strict user isolation.
 */
export function subscribeToCustomerPurchases(
  customerId: string,
  onData: (purchases: Purchase[]) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  if (!customerId) {
    onData([]);
    return () => {};
  }

  try {
    const db = getFirebaseDB();
    const purchasesQuery = query(
      collection(db, 'purchases'),
      where('customerId', '==', customerId)
    );

    const unsubscribe = onSnapshot(
      purchasesQuery,
      (snapshot) => {
        const purchasesList: Purchase[] = [];
        snapshot.forEach((d) => {
          purchasesList.push(normalizePurchase(d.data(), d.id));
        });

        // Sort by purchasedAt descending
        purchasesList.sort((a, b) => {
          return new Date(b.purchasedAt || 0).getTime() - new Date(a.purchasedAt || 0).getTime();
        });

        // Update local cache for synchronous helper checks
        const existingAll = NoteNestDB.getPurchases().filter(p => p.customerId !== customerId);
        NoteNestDB.savePurchases([...purchasesList, ...existingAll]);

        // Dispatch window event for instantaneous cross-tab and cross-component updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('notenest_purchases_updated', { detail: purchasesList })
          );
        }

        onData(purchasesList);
      },
      (error) => {
        console.error('[OrdersRealtime] Customer purchases listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[OrdersRealtime] Failed to initialize customer purchases subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * CUSTOMER REAL-TIME ORDERS
 * Listens continuously to Firestore `/orders` for the authenticated customer.
 * Uses `where('customerId', '==', customerId)` to ensure strict user isolation.
 */
export function subscribeToCustomerOrders(
  customerId: string,
  onData: (orders: Order[]) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  if (!customerId) {
    onData([]);
    return () => {};
  }

  try {
    const db = getFirebaseDB();
    const ordersQuery = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersList: Order[] = [];
        snapshot.forEach((d) => {
          ordersList.push(normalizeOrder(d.data(), d.id));
        });

        // Sort by createdAt descending
        ordersList.sort((a, b) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        onData(ordersList);
      },
      (error) => {
        console.error('[OrdersRealtime] Customer orders listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[OrdersRealtime] Failed to initialize customer orders subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Hook for Admin Real-Time Orders
 */
export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>(() => NoteNestDB.getOrders());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToAdminOrders(
      (newOrders) => {
        if (isMounted) {
          setOrders(newOrders);
          setLoading(false);
          setError(null);
        }
      },
      (err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { orders, loading, error };
}

/**
 * Hook for Admin Real-Time Purchases
 */
export function useAdminPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>(() => NoteNestDB.getPurchases());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToAdminPurchases(
      (newPurchases) => {
        if (isMounted) {
          setPurchases(newPurchases);
          setLoading(false);
          setError(null);
        }
      },
      (err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { purchases, loading, error };
}

/**
 * Hook for Customer Real-Time Purchases
 */
export function useCustomerPurchases(customerId?: string) {
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    return customerId ? NoteNestDB.getCustomerPurchases(customerId) : [];
  });
  const [loading, setLoading] = useState(Boolean(customerId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!customerId) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const unsubscribe = subscribeToCustomerPurchases(
      customerId,
      (newPurchases) => {
        if (isMounted) {
          setPurchases(newPurchases);
          setLoading(false);
          setError(null);
        }
      },
      (err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [customerId]);

  return { purchases, loading, error };
}

/**
 * Hook for Customer Real-Time Orders
 */
export function useCustomerOrders(customerId?: string) {
  const [orders, setOrders] = useState<Order[]>(() => {
    return customerId ? NoteNestDB.getOrders().filter(o => o.customerId === customerId) : [];
  });
  const [loading, setLoading] = useState(Boolean(customerId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!customerId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const unsubscribe = subscribeToCustomerOrders(
      customerId,
      (newOrders) => {
        if (isMounted) {
          setOrders(newOrders);
          setLoading(false);
          setError(null);
        }
      },
      (err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [customerId]);

  return { orders, loading, error };
}
