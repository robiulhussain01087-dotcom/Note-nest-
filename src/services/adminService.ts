import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { getFirebaseDB } from './firebase';
import { NoteNestDB } from './db';
import { User, Note, Order, Purchase, Payment, PaymentSettings, WebsiteSettings, Chapter, Topic, AcademicSettings, Group } from '../types';
import { getActiveQrCodePath } from '../utils/assetService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function logFirestoreError(error: unknown, op: OperationType, path: string | null) {
  console.warn(`[Firestore Error - ${op} on ${path}]:`, error);
}

// Utility to run firestore operations with timeout
async function withTimeout<T>(promise: Promise<T>, ms = 5000, fallbackVal?: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => {
      if (fallbackVal !== undefined) {
        resolve(fallbackVal);
      } else {
        reject(new Error(`Firestore operation timed out after ${ms}ms`));
      }
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export class AdminService {
  /**
   * 1. USERS: Fetch all users from Firestore /users with fallback to NoteNestDB
   */
  static async fetchUsers(): Promise<User[]> {
    try {
      const db = getFirebaseDB();
      const usersCol = collection(db, 'users');
      const snap = await withTimeout(getDocs(usersCol), 4000);
      
      if (!snap.empty) {
        const firestoreUsers: User[] = [];
        snap.forEach((d) => {
          const data = d.data();
          let createdAtStr = new Date().toISOString();
          if (data.createdAt) {
            if (typeof data.createdAt === 'string') {
              createdAtStr = data.createdAt;
            } else if (data.createdAt.toDate) {
              createdAtStr = data.createdAt.toDate().toISOString();
            }
          }
          firestoreUsers.push({
            uid: d.id,
            name: data.name || 'Student',
            email: data.email || '',
            role: (data.role === 'admin' ? 'admin' : 'customer') as 'customer' | 'admin',
            createdAt: createdAtStr
          });
        });

        // Merge with locally stored users so none are lost
        const localUsers = NoteNestDB.getUsers();
        const mergedMap = new Map<string, User>();
        localUsers.forEach(u => mergedMap.set(u.uid, u));
        firestoreUsers.forEach(u => mergedMap.set(u.uid, u));

        const result = Array.from(mergedMap.values());
        NoteNestDB.saveUsers(result);
        return result;
      }
    } catch (err) {
      logFirestoreError(err, OperationType.LIST, 'users');
    }

    return NoteNestDB.getUsers();
  }

  /**
   * Update a user's role in Firestore /users/{uid}
   */
  static async updateUserRole(uid: string, newRole: 'customer' | 'admin'): Promise<{ success: boolean; error?: string }> {
    try {
      const db = getFirebaseDB();
      const userRef = doc(db, 'users', uid);
      await withTimeout(updateDoc(userRef, { role: newRole }), 5000);

      // Also update local store
      const localUsers = NoteNestDB.getUsers();
      const idx = localUsers.findIndex(u => u.uid === uid);
      if (idx >= 0) {
        localUsers[idx].role = newRole;
        NoteNestDB.saveUsers(localUsers);
      }
      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      return {
        success: false,
        error: err?.message || 'Failed to update user role in Firestore.'
      };
    }
  }

  /**
   * 2. NOTES: Fetch all notes from Firestore /notes or fallback to NoteNestDB
   */
  static async fetchNotes(): Promise<Note[]> {
    try {
      const db = getFirebaseDB();
      const notesCol = collection(db, 'notes');
      const snap = await withTimeout(getDocs(notesCol), 4000);

      if (!snap.empty) {
        const firestoreNotes: Note[] = [];
        snap.forEach((d) => {
          const data = d.data() as Note;
          firestoreNotes.push({
            ...data,
            id: d.id,
            coverImageUrl: data.coverImageUrl || data.thumbnailUrl || '',
            thumbnailUrl: data.thumbnailUrl || data.coverImageUrl || ''
          });
        });
        NoteNestDB.saveNotes(firestoreNotes);
        return firestoreNotes;
      }
    } catch (err) {
      logFirestoreError(err, OperationType.LIST, 'notes');
    }

    return NoteNestDB.getNotes();
  }

  /**
   * Save or update a note in Firestore and NoteNestDB
   */
  static async saveNote(note: Note): Promise<{ success: boolean; error?: string }> {
    try {
      // Local first for immediate responsive UI
      const existing = NoteNestDB.getNoteById(note.id);
      if (existing) {
        NoteNestDB.updateNote(note.id, note);
      } else {
        const allNotes = NoteNestDB.getNotes();
        allNotes.unshift(note);
        NoteNestDB.saveNotes(allNotes);
      }

      // Sync with Firestore /notes/{note.id}
      const db = getFirebaseDB();
      const noteRef = doc(db, 'notes', note.id);
      await withTimeout(
        setDoc(noteRef, {
          ...note,
          updatedAt: new Date().toISOString()
        }),
        5000
      );
      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, `notes/${note.id}`);
      // Note is already saved in NoteNestDB, so operation succeeded locally
      return { success: true };
    }
  }

  static async createNote(noteData: Partial<Note>): Promise<{ success: boolean; note?: Note; error?: string }> {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      course: noteData.course || 'B.Com',
      semester: noteData.semester || '1st Semester',
      subject: noteData.subject || 'General',
      unit: noteData.unit || 'Unit 1',
      title: noteData.title || 'Untitled Note',
      description: noteData.description || '',
      pages: noteData.pages || 10,
      originalPrice: noteData.originalPrice || 99,
      offerPrice: noteData.offerPrice || 49,
      price: noteData.offerPrice || 49,
      coverImageUrl: noteData.coverImageUrl || '',
      pdfUrl: noteData.pdfUrl || '',
      previewImages: noteData.previewImages || [],
      published: noteData.published !== undefined ? noteData.published : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await this.saveNote(newNote);
    return { ...res, note: newNote };
  }

  static async updateNote(id: string, noteData: Partial<Note>): Promise<{ success: boolean; error?: string }> {
    const existing = NoteNestDB.getNoteById(id);
    if (!existing) return { success: false, error: 'Note not found' };
    const updated: Note = {
      ...existing,
      ...noteData,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.saveNote(updated);
  }

  /**
   * Delete a note from Firestore and NoteNestDB
   */
  static async deleteNote(id: string): Promise<boolean> {
    try {
      NoteNestDB.deleteNote(id);
      const db = getFirebaseDB();
      const noteRef = doc(db, 'notes', id);
      await withTimeout(deleteDoc(noteRef), 4000);
      return true;
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `notes/${id}`);
      return true; // local deletion succeeded
    }
  }

  /**
   * Toggle publish status of note
   */
  static async togglePublish(id: string, published: boolean): Promise<boolean> {
    try {
      NoteNestDB.updateNote(id, { published });
      const db = getFirebaseDB();
      const noteRef = doc(db, 'notes', id);
      await withTimeout(updateDoc(noteRef, { published, updatedAt: new Date().toISOString() }), 4000);
      return true;
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `notes/${id}`);
      return true;
    }
  }

  /**
   * 3. ORDERS: Fetch orders from Firestore /orders or fallback to NoteNestDB
   */
  static async fetchOrders(): Promise<Order[]> {
    try {
      const db = getFirebaseDB();
      const ordersCol = collection(db, 'orders');
      const snap = await withTimeout(getDocs(ordersCol), 4000);

      if (!snap.empty) {
        const firestoreOrders: Order[] = [];
        snap.forEach((d) => {
          firestoreOrders.push({
            id: d.id,
            ...(d.data() as Omit<Order, 'id'>)
          });
        });
        // Merge with local orders
        const localOrders = NoteNestDB.getOrders();
        const mergedMap = new Map<string, Order>();
        localOrders.forEach(o => mergedMap.set(o.id, o));
        firestoreOrders.forEach(o => mergedMap.set(o.id, o));
        const result = Array.from(mergedMap.values());
        NoteNestDB.saveOrders(result);
        return result;
      }
    } catch (err) {
      logFirestoreError(err, OperationType.LIST, 'orders');
    }

    return NoteNestDB.getOrders();
  }

  /**
   * Verify order (approve or reject) and record purchase
   */
  static async verifyOrder(
    orderId: string,
    status: 'paid' | 'rejected',
    verifiedBy: string,
    adminNote?: string
  ): Promise<Order | null> {
    // 1. Update in local DB
    const updatedOrder = NoteNestDB.verifyPayment(orderId, status, verifiedBy, adminNote);

    // 2. Sync order update to Firestore /orders/{orderId}
    try {
      const db = getFirebaseDB();
      const orderRef = doc(db, 'orders', orderId);
      await withTimeout(
        updateDoc(orderRef, {
          paymentStatus: status,
          verifiedAt: new Date().toISOString(),
          verifiedBy,
          adminNote: adminNote || ''
        }),
        4000
      );

      // 3. If approved / paid, create purchase record in Firestore
      if (status === 'paid' && updatedOrder) {
        if (updatedOrder.chapterId) {
          const purchaseId = `pur-${updatedOrder.customerId}-${updatedOrder.chapterId}`;
          const chapter = NoteNestDB.getChapterById(updatedOrder.chapterId);
          const purchaseRef = doc(db, 'purchases', purchaseId);
          await withTimeout(
            setDoc(purchaseRef, {
              id: purchaseId,
              customerId: updatedOrder.customerId,
              chapterId: updatedOrder.chapterId,
              chapterTitle: updatedOrder.chapterTitle || chapter?.title || updatedOrder.noteTitle,
              accessType: updatedOrder.accessType || chapter?.accessType || 'normal',
              noteId: updatedOrder.chapterId,
              orderId: updatedOrder.id,
              noteTitle: updatedOrder.noteTitle,
              purchasedPrice: updatedOrder.amount,
              purchasedAt: new Date().toISOString(),
              accessStatus: 'active',
              course: chapter?.classOrCourse || 'Curriculum',
              semester: chapter?.semester || 'Academic Session',
              subject: chapter?.subject || 'All Subjects'
            }),
            4000
          );
        } else if (updatedOrder.noteId) {
          const purchaseId = `pur-${updatedOrder.customerId}-${updatedOrder.noteId}`;
          const note = NoteNestDB.getNoteById(updatedOrder.noteId);
          const purchaseRef = doc(db, 'purchases', purchaseId);
          await withTimeout(
            setDoc(purchaseRef, {
              id: purchaseId,
              customerId: updatedOrder.customerId,
              noteId: updatedOrder.noteId,
              orderId: updatedOrder.id,
              noteTitle: updatedOrder.noteTitle,
              purchasedPrice: updatedOrder.amount,
              purchasedAt: new Date().toISOString(),
              accessStatus: 'active',
              course: note?.course || 'Curriculum',
              semester: note?.semester || 'Academic Session',
              subject: note?.subject || 'All Subjects'
            }),
            4000
          );
        }
      }
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }

    return updatedOrder;
  }

  /**
   * 4. PURCHASES: Fetch all purchases from Firestore /purchases or fallback to NoteNestDB
   */
  static async fetchPurchases(): Promise<Purchase[]> {
    try {
      const db = getFirebaseDB();
      const purchasesCol = collection(db, 'purchases');
      const snap = await withTimeout(getDocs(purchasesCol), 4000);

      if (!snap.empty) {
        const firestorePurchases: Purchase[] = [];
        snap.forEach((d) => {
          firestorePurchases.push({
            id: d.id,
            ...(d.data() as Omit<Purchase, 'id'>)
          });
        });
        // Merge with local purchases
        const local = NoteNestDB.getPurchases();
        const map = new Map<string, Purchase>();
        local.forEach(p => map.set(p.id, p));
        firestorePurchases.forEach(p => map.set(p.id, p));
        const res = Array.from(map.values());
        NoteNestDB.savePurchases(res);
        return res;
      }
    } catch (err) {
      logFirestoreError(err, OperationType.LIST, 'purchases');
    }

    return NoteNestDB.getPurchases();
  }

  /**
   * 5. PAYMENTS: Fetch all payment verification requests from Firestore /payments
   */
  static async fetchPayments(): Promise<Payment[]> {
    try {
      const db = getFirebaseDB();
      const paymentsCol = collection(db, 'payments');
      const snap = await withTimeout(getDocs(paymentsCol), 4000);

      const firestorePayments: Payment[] = [];
      if (!snap.empty) {
        snap.forEach((d) => {
          const data = d.data();
          firestorePayments.push({
            id: d.id,
            customerId: data.customerId || '',
            customerName: data.customerName || 'Student',
            customerEmail: data.customerEmail || '',
            noteId: data.noteId || '',
            noteTitle: data.noteTitle || 'Study Note',
            amount: Number(data.amount) || 0,
            utr: data.utr || '',
            paymentDate: data.paymentDate || data.createdAt || new Date().toISOString(),
            screenshotUrl: data.screenshotUrl || '',
            status: (data.status === 'successful' || data.status === 'paid' ? 'successful' : data.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'successful' | 'rejected',
            adminNote: data.adminNote || '',
            createdAt: data.createdAt || new Date().toISOString(),
            verifiedAt: data.verifiedAt,
            verifiedBy: data.verifiedBy
          });
        });
      }

      // Merge with local orders so any offline or previously submitted orders are also present as payments
      const localOrders = NoteNestDB.getOrders();
      const paymentMap = new Map<string, Payment>();

      localOrders.forEach(o => {
        paymentMap.set(o.id, {
          id: o.id,
          customerId: o.customerId,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          noteId: o.noteId,
          noteTitle: o.noteTitle,
          amount: o.amount,
          utr: o.utr || '',
          paymentDate: o.createdAt,
          screenshotUrl: o.screenshotUrl,
          status: (o.paymentStatus === 'paid' || o.paymentStatus === 'successful' ? 'successful' : o.paymentStatus === 'rejected' ? 'rejected' : 'pending'),
          adminNote: o.adminNote,
          createdAt: o.createdAt,
          verifiedAt: o.verifiedAt,
          verifiedBy: o.verifiedBy
        });
      });

      firestorePayments.forEach(p => paymentMap.set(p.id, p));

      return Array.from(paymentMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      logFirestoreError(err, OperationType.LIST, 'payments');
      // Fallback from local orders
      return NoteNestDB.getOrders().map(o => ({
        id: o.id,
        customerId: o.customerId,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        noteId: o.noteId,
        noteTitle: o.noteTitle,
        amount: o.amount,
        utr: o.utr || '',
        paymentDate: o.createdAt,
        screenshotUrl: o.screenshotUrl,
        status: (o.paymentStatus === 'paid' || o.paymentStatus === 'successful' ? 'successful' : o.paymentStatus === 'rejected' ? 'rejected' : 'pending') as any,
        adminNote: o.adminNote,
        createdAt: o.createdAt,
        verifiedAt: o.verifiedAt,
        verifiedBy: o.verifiedBy
      }));
    }
  }

  /**
   * Submit a payment verification request to Firestore /payments/{paymentId}
   */
  static async submitPaymentRequest(paymentData: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    chapterId?: string;
    chapterTitle?: string;
    accessType?: 'normal' | 'premium';
    noteId?: string;
    noteTitle: string;
    amount: number;
    utr: string;
    paymentDate?: string;
    screenshotUrl?: string;
  }): Promise<{ success: boolean; paymentId: string; error?: string }> {
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const paymentRecord: Payment = {
      id: paymentId,
      customerId: paymentData.customerId,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      chapterId: paymentData.chapterId,
      chapterTitle: paymentData.chapterTitle,
      accessType: paymentData.accessType,
      noteId: paymentData.noteId || paymentData.chapterId || 'chapter-general',
      noteTitle: paymentData.noteTitle,
      amount: paymentData.amount,
      utr: paymentData.utr,
      paymentDate: paymentData.paymentDate || now,
      screenshotUrl: paymentData.screenshotUrl || '',
      status: 'pending',
      createdAt: now
    };

    // Save in NoteNestDB locally for instant responsive access
    NoteNestDB.createOrder({
      customerId: paymentData.customerId,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      chapterId: paymentData.chapterId,
      chapterTitle: paymentData.chapterTitle,
      accessType: paymentData.accessType,
      noteId: paymentRecord.noteId || 'chapter-general',
      noteTitle: paymentData.noteTitle,
      amount: paymentData.amount,
      paymentMethod: 'manual_upi'
    });
    NoteNestDB.submitPaymentProof(paymentId, paymentData.utr, paymentData.screenshotUrl);

    // Save to Firestore /payments/{paymentId} and /orders/{paymentId}
    try {
      const db = getFirebaseDB();
      const payRef = doc(db, 'payments', paymentId);
      await withTimeout(setDoc(payRef, paymentRecord), 5000);

      const orderRef = doc(db, 'orders', paymentId);
      await withTimeout(setDoc(orderRef, {
        id: paymentId,
        customerId: paymentData.customerId,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        chapterId: paymentData.chapterId || null,
        chapterTitle: paymentData.chapterTitle || null,
        accessType: paymentData.accessType || null,
        noteId: paymentRecord.noteId,
        noteTitle: paymentData.noteTitle,
        amount: paymentData.amount,
        paymentMethod: 'manual_upi',
        paymentStatus: 'pending',
        utr: paymentData.utr,
        screenshotUrl: paymentData.screenshotUrl || '',
        createdAt: now
      }), 5000);

      return { success: true, paymentId };
    } catch (err: any) {
      logFirestoreError(err, OperationType.CREATE, `payments/${paymentId}`);
      // Return success because local record was successfully saved
      return { success: true, paymentId };
    }
  }

  /**
   * Verify a payment verification request (Approve / Reject)
   */
  static async verifyPaymentRequest(
    paymentId: string,
    status: 'successful' | 'rejected',
    verifiedBy: string,
    adminNote?: string
  ): Promise<{ success: boolean; error?: string }> {
    const verifiedAt = new Date().toISOString();
    const orderStatus = status === 'successful' ? 'paid' : 'rejected';

    // 1. Update local DB
    NoteNestDB.verifyPayment(paymentId, orderStatus, verifiedBy, adminNote);

    // 2. Update Firestore /payments/{paymentId} and /orders/{paymentId}
    try {
      const db = getFirebaseDB();
      const payRef = doc(db, 'payments', paymentId);
      await withTimeout(
        updateDoc(payRef, {
          status,
          verifiedAt,
          verifiedBy,
          adminNote: adminNote || ''
        }),
        4000
      );

      const orderRef = doc(db, 'orders', paymentId);
      await withTimeout(
        updateDoc(orderRef, {
          paymentStatus: orderStatus,
          verifiedAt,
          verifiedBy,
          adminNote: adminNote || ''
        }),
        4000
      );

      // 3. If approved / successful, ensure customer purchase is created in Firestore /purchases/{purchaseId}
      if (status === 'successful') {
        const payments = await this.fetchPayments();
        const pay = payments.find(p => p.id === paymentId);
        if (pay) {
          const targetChapterId = pay.chapterId || (NoteNestDB.getChapterById(pay.noteId || '') ? pay.noteId : undefined);
          if (targetChapterId) {
            const purchaseId = `pur-${pay.customerId}-${targetChapterId}`;
            const chapter = NoteNestDB.getChapterById(targetChapterId);
            const purchaseRef = doc(db, 'purchases', purchaseId);
            await withTimeout(
              setDoc(purchaseRef, {
                id: purchaseId,
                customerId: pay.customerId,
                chapterId: targetChapterId,
                chapterTitle: pay.chapterTitle || chapter?.title || pay.noteTitle,
                accessType: pay.accessType || chapter?.accessType || 'normal',
                noteId: targetChapterId,
                orderId: pay.id,
                noteTitle: pay.noteTitle,
                purchasedPrice: pay.amount,
                purchasedAt: verifiedAt,
                accessStatus: 'active',
                course: chapter?.classOrCourse || 'Curriculum',
                semester: chapter?.semester || 'Academic Session',
                subject: chapter?.subject || 'All Subjects'
              }),
              4000
            );
          } else {
            const purchaseId = `pur-${pay.customerId}-${pay.noteId}`;
            const note = NoteNestDB.getNoteById(pay.noteId || '');
            const purchaseRef = doc(db, 'purchases', purchaseId);
            await withTimeout(
              setDoc(purchaseRef, {
                id: purchaseId,
                customerId: pay.customerId,
                noteId: pay.noteId,
                orderId: pay.id,
                noteTitle: pay.noteTitle,
                purchasedPrice: pay.amount,
                purchasedAt: verifiedAt,
                accessStatus: 'active',
                course: note?.course || 'Multi-Education',
                semester: note?.semester || 'All',
                subject: note?.subject || 'All Subjects'
              }),
              4000
            );
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
      return { success: true };
    }
  }

  /**
   * 6. PAYMENT & APPLICATION SETTINGS: Fetch and Save in Firestore /settings/payment
   * Single source of truth for both payment and application branding (logoUrl, qrCodeUrl)
   */
  static async fetchSettings(): Promise<{
    logoUrl?: string;
    qrCodeUrl?: string;
    activeQrCode?: 'qr-1' | 'qr-2' | 'qr-3';
    upiId?: string;
    accountName?: string;
    instructions?: string;
    methodName?: string;
    enabled?: boolean;
    siteName?: string;
    tagline?: string;
    supportEmail?: string;
    phone?: string;
    primaryCourse?: string;
    primarySemester?: string;
  }> {
    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'payment');
      const snap = await withTimeout(getDoc(ref), 4000);
      if (snap.exists()) {
        const data = snap.data();
        if (data.logoUrl !== undefined) {
          const currentWeb = NoteNestDB.getWebsiteSettings();
          NoteNestDB.saveWebsiteSettings({
            ...currentWeb,
            logoUrl: data.logoUrl || '/assets/notenest-logo.png',
            siteName: data.siteName || currentWeb.siteName,
            tagline: data.tagline || currentWeb.tagline,
            supportEmail: data.supportEmail || currentWeb.supportEmail,
            phone: data.phone || currentWeb.phone,
            primaryCourse: data.primaryCourse || currentWeb.primaryCourse,
            primarySemester: data.primarySemester || currentWeb.primarySemester
          });
        }

        const validActiveQr = (data.activeQrCode === 'qr-2' || data.activeQrCode === 'qr-3')
          ? data.activeQrCode
          : 'qr-1';

        const currentPay = NoteNestDB.getPaymentSettings();
        NoteNestDB.savePaymentSettings({
          ...currentPay,
          activeQrCode: validActiveQr,
          qrCodeUrl: getActiveQrCodePath(validActiveQr),
          upiId: data.upiId || currentPay.upiId,
          accountName: data.accountName || currentPay.accountName,
          instructions: data.instructions || currentPay.instructions,
          enabled: data.enabled !== undefined ? data.enabled : currentPay.enabled,
          logoUrl: data.logoUrl || currentPay.logoUrl
        });

        return {
          ...data,
          activeQrCode: validActiveQr,
          qrCodeUrl: getActiveQrCodePath(validActiveQr)
        } as any;
      }
    } catch (err) {
      logFirestoreError(err, OperationType.GET, 'settings/payment');
    }

    const currentWeb = NoteNestDB.getWebsiteSettings();
    const currentPay = NoteNestDB.getPaymentSettings();
    const activeQr = currentPay.activeQrCode || 'qr-1';
    return {
      logoUrl: currentWeb.logoUrl || '/assets/notenest-logo.png',
      qrCodeUrl: getActiveQrCodePath(activeQr),
      activeQrCode: activeQr,
      upiId: currentPay.upiId,
      accountName: currentPay.accountName,
      instructions: currentPay.instructions,
      methodName: currentPay.methodName,
      enabled: currentPay.enabled,
      siteName: currentWeb.siteName,
      tagline: currentWeb.tagline,
      supportEmail: currentWeb.supportEmail,
      phone: currentWeb.phone,
      primaryCourse: currentWeb.primaryCourse,
      primarySemester: currentWeb.primarySemester
    };
  }

  static async saveActiveQrCode(
    activeQrCode: 'qr-1' | 'qr-2' | 'qr-3',
    userEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const validQr = (activeQrCode === 'qr-2' || activeQrCode === 'qr-3') ? activeQrCode : 'qr-1';
      const qrPath = getActiveQrCodePath(validQr);

      // 1. Immediately update NoteNestDB local storage
      const currentPay = NoteNestDB.getPaymentSettings();
      NoteNestDB.savePaymentSettings({
        ...currentPay,
        activeQrCode: validQr,
        qrCodeUrl: qrPath
      });

      // 2. Persist ONLY activeQrCode and qrCodeUrl in Firestore /settings/payment preserving other fields
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'payment');
      await withTimeout(
        setDoc(
          ref,
          {
            activeQrCode: validQr,
            qrCodeUrl: qrPath,
            updatedAt: new Date().toISOString(),
            updatedBy: userEmail || 'admin'
          },
          { merge: true }
        ),
        5000
      );

      console.log(`[AdminService] Active QR successfully saved to Firestore: ${validQr}`);
      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, 'settings/payment');
      return { success: false, error: err?.message || 'Failed to save active QR selection.' };
    }
  }

  static async fetchPaymentSettings(): Promise<PaymentSettings> {
    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'payment');
      const snap = await withTimeout(getDoc(ref), 3000);
      if (snap.exists()) {
        const data = snap.data() as PaymentSettings;
        NoteNestDB.savePaymentSettings(data);
        return data;
      }
    } catch (err) {
      logFirestoreError(err, OperationType.GET, 'settings/payment');
    }
    return NoteNestDB.getPaymentSettings();
  }

  static async saveSettingField(
    field: string,
    value: any,
    userEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'payment');
      const payload: Record<string, any> = {
        [field]: value,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'admin'
      };

      await withTimeout(setDoc(ref, payload, { merge: true }), 5000);

      // Local storage sync
      if (field === 'logoUrl') {
        const web = NoteNestDB.getWebsiteSettings();
        web.logoUrl = value;
        NoteNestDB.saveWebsiteSettings(web);
        console.log('[ASSET] Logo Firestore save completed');
      } else if (field === 'qrCodeUrl') {
        const pay = NoteNestDB.getPaymentSettings();
        pay.qrCodeUrl = value;
        NoteNestDB.savePaymentSettings(pay);
        console.log('[ASSET] QR Firestore save completed');
      }

      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, 'settings/payment');
      throw err;
    }
  }

  static async saveBrandingSettings(
    settings: Partial<WebsiteSettings>,
    userEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    const currentWeb = NoteNestDB.getWebsiteSettings();
    const updated = { ...currentWeb, ...settings };
    NoteNestDB.saveWebsiteSettings(updated);

    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'payment');
      const payload = {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'admin'
      };
      await withTimeout(setDoc(ref, payload, { merge: true }), 5000);
      if (settings.logoUrl !== undefined) {
        console.log('[ASSET] Logo Firestore save completed');
      }
      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, 'settings/payment');
      return { success: true };
    }
  }

  static async savePaymentSettings(
    settings: PaymentSettings,
    userEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    const payload: PaymentSettings = {
      ...settings,
      methodName: settings.methodName || 'UPI Payment',
      enabled: settings.enabled !== false,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    };

    NoteNestDB.savePaymentSettings(payload);

    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'payment');
      await withTimeout(setDoc(ref, payload, { merge: true }), 4000);
      if (settings.qrCodeUrl) {
        console.log('[ASSET] QR Firestore save completed');
      }
      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, 'settings/payment');
      return { success: true };
    }
  }

  // =========================================================================
  // 6B. GROUPS MANAGEMENT: Customizable Syllabus Hierarchy (Group -> Chapters)
  // =========================================================================
  static async fetchGroups(): Promise<Group[]> {
    const local = NoteNestDB.getGroups();
    try {
      const db = getFirebaseDB();
      const q = query(collection(db, 'groups'));
      const snapshot = await withTimeout(getDocs(q), 5000);
      if (!snapshot.empty) {
        const firestoreGroups: Group[] = [];
        snapshot.forEach(docSnap => {
          firestoreGroups.push(docSnap.data() as Group);
        });
        firestoreGroups.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        NoteNestDB.saveGroups(firestoreGroups);
        return NoteNestDB.getGroups();
      }
      return local;
    } catch (err: any) {
      logFirestoreError(err, OperationType.LIST, 'groups');
      return local;
    }
  }

  static async saveGroup(group: Group): Promise<{ success: boolean; group: Group; error?: string }> {
    const saved = NoteNestDB.saveGroup(group);
    try {
      const db = getFirebaseDB();
      const docId = saved.id || saved.groupId;
      const ref = doc(db, 'groups', docId);
      await withTimeout(setDoc(ref, saved, { merge: true }), 5000);

      // Synchronize chapter associations in Firestore
      // Update assigned chapters with groupId, and unlink removed chapters without duplicating/deleting content
      try {
        const allChapters = await this.fetchChapters();
        const chapterIds = saved.chapterIds || [];
        const syncPromises: Promise<any>[] = [];

        // 1. Link assigned chapters
        chapterIds.forEach(cId => {
          const chapRef = doc(db, 'chapters', cId);
          syncPromises.push(setDoc(chapRef, { groupId: docId }, { merge: true }));
        });

        // 2. Unlink any chapters previously in this group that were removed
        allChapters.forEach(c => {
          if (c.groupId === docId && !chapterIds.includes(c.id)) {
            const chapRef = doc(db, 'chapters', c.id);
            syncPromises.push(setDoc(chapRef, { groupId: '' }, { merge: true }));
          }
        });

        await Promise.allSettled(syncPromises);
      } catch (syncErr) {
        console.warn('[AdminService] Chapter association sync warning:', syncErr);
      }

      return { success: true, group: saved };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, `groups/${saved.id}`);
      return { success: true, group: saved };
    }
  }

  /**
   * Safety rule: Deleting a Group removes only the Group playlist relationship.
   * Chapters are safely unlinked and remain in Firestore. Chapters are NEVER deleted.
   */
  static async deleteGroup(
    groupId: string
  ): Promise<{ success: boolean; deletedChaptersCount: number; error?: string }> {
    NoteNestDB.deleteGroup(groupId);

    try {
      const db = getFirebaseDB();
      // 1. Delete group document from Firestore
      const ref = doc(db, 'groups', groupId);
      await withTimeout(deleteDoc(ref), 5000);

      // 2. Safely unlink associated chapters in Firestore (keep chapter content intact)
      const allChapters = await this.fetchChapters();
      const related = allChapters.filter(c => c.groupId === groupId);
      await Promise.allSettled(
        related.map(c => setDoc(doc(db, 'chapters', c.id), { groupId: '' }, { merge: true }))
      );

      return { success: true, deletedChaptersCount: 0 };
    } catch (err: any) {
      logFirestoreError(err, OperationType.DELETE, `groups/${groupId}`);
      return { success: true, deletedChaptersCount: 0 };
    }
  }

  static async addChaptersToGroup(
    groupId: string,
    newChapterIds: string[]
  ): Promise<{ success: boolean; group?: Group; error?: string }> {
    const updated = NoteNestDB.addChaptersToGroup(groupId, newChapterIds);
    if (!updated) return { success: false, error: 'Group not found' };
    return this.saveGroup(updated);
  }

  static async removeChapterFromGroup(
    groupId: string,
    chapterId: string
  ): Promise<{ success: boolean; group?: Group; error?: string }> {
    const updated = NoteNestDB.removeChapterFromGroup(groupId, chapterId);
    if (!updated) return { success: false, error: 'Group not found' };
    return this.saveGroup(updated);
  }

  static async reorderGroupChapters(
    groupId: string,
    orderedChapterIds: string[]
  ): Promise<{ success: boolean; group?: Group; error?: string }> {
    const updated = NoteNestDB.reorderGroupChapters(groupId, orderedChapterIds);
    if (!updated) return { success: false, error: 'Group not found' };
    return this.saveGroup(updated);
  }

  static async reorderGroups(
    groupOrders: { id: string; order: number }[]
  ): Promise<{ success: boolean; groups: Group[]; error?: string }> {
    const updated = NoteNestDB.reorderGroups(groupOrders);
    try {
      const db = getFirebaseDB();
      await Promise.allSettled(
        groupOrders.map(item => {
          const ref = doc(db, 'groups', item.id);
          return withTimeout(
            setDoc(ref, { order: item.order, updatedAt: new Date().toISOString() }, { merge: true }),
            4000
          );
        })
      );
      return { success: true, groups: updated };
    } catch (err: any) {
      logFirestoreError(err, OperationType.UPDATE, 'groups/reorder');
      return { success: true, groups: updated };
    }
  }

  // =========================================================================
  // 7. CHAPTERS & CURRICULUM MANAGEMENT: Multi-Education Hierarchy
  // =========================================================================
  static async fetchChapters(): Promise<Chapter[]> {
    const local = NoteNestDB.getChapters();
    try {
      const db = getFirebaseDB();
      const q = query(collection(db, 'chapters'));
      const snapshot = await withTimeout(getDocs(q), 5000);
      if (!snapshot.empty) {
        const firestoreChapters: Chapter[] = [];
        snapshot.forEach(docSnap => {
          firestoreChapters.push(docSnap.data() as Chapter);
        });
        // Sort by chapterNumber / createdAt
        firestoreChapters.sort((a, b) => (a.chapterNumber || 0).toString().localeCompare((b.chapterNumber || 0).toString(), undefined, { numeric: true }));
        NoteNestDB.saveChapters(firestoreChapters);
        return firestoreChapters;
      }
      return local;
    } catch (err: any) {
      logFirestoreError(err, OperationType.LIST, 'chapters');
      return local;
    }
  }

  static async saveChapter(chapter: Chapter): Promise<{ success: boolean; chapter: Chapter; error?: string }> {
    const saved = NoteNestDB.saveChapter(chapter);
    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'chapters', chapter.id);
      await withTimeout(setDoc(ref, saved, { merge: true }), 5000);
      return { success: true, chapter: saved };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, `chapters/${chapter.id}`);
      return { success: true, chapter: saved };
    }
  }

  static async deleteChapter(id: string): Promise<{ success: boolean; error?: string }> {
    NoteNestDB.deleteChapter(id);
    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'chapters', id);
      await withTimeout(deleteDoc(ref), 5000);
      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.DELETE, `chapters/${id}`);
      return { success: true };
    }
  }

  // =========================================================================
  // 8. ACADEMIC HIERARCHY SETTINGS (School classes, College courses, Streams, Mediums)
  // =========================================================================
  static async fetchAcademicSettings(): Promise<AcademicSettings> {
    const local = NoteNestDB.getAcademicSettings();
    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'academic');
      const docSnap = await withTimeout(getDoc(ref), 5000);
      if (docSnap.exists()) {
        const data = docSnap.data() as AcademicSettings;
        NoteNestDB.saveAcademicSettings(data);
        return data;
      }
      return local;
    } catch (err: any) {
      logFirestoreError(err, OperationType.GET, 'settings/academic');
      return local;
    }
  }

  static async saveAcademicSettings(settings: AcademicSettings): Promise<{ success: boolean; error?: string }> {
    NoteNestDB.saveAcademicSettings(settings);
    try {
      const db = getFirebaseDB();
      const ref = doc(db, 'settings', 'academic');
      await withTimeout(setDoc(ref, settings, { merge: true }), 5000);
      return { success: true };
    } catch (err: any) {
      logFirestoreError(err, OperationType.WRITE, 'settings/academic');
      return { success: true };
    }
  }
}
