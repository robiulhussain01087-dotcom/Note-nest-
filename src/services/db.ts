import { Note, Order, Purchase, User, WebsiteSettings, PaymentSettings, Chapter, Topic, AcademicSettings, FlashcardItem, QuizItem, Group } from '../types';

export const INITIAL_GROUPS: Group[] = [];

export const INITIAL_ACADEMIC_SETTINGS: AcademicSettings = {
  educationLevels: ['School', 'College'],
  schoolClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
  collegeCourses: ['B.Com', 'B.A.', 'B.Sc.', 'BCA', 'Other Courses'],
  streams: ['Science', 'Commerce', 'Arts', 'General'],
  mediums: ['Assamese', 'English', 'Bangla', 'Hindi'],
  semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'],
  subjects: {
    'School': ['General Science', 'Mathematics', 'Social Science', 'English', 'Assamese', 'Hindi'],
    'Class 9': ['General Science', 'Mathematics', 'Social Science', 'English', 'Assamese', 'Hindi'],
    'Class 10': ['General Science', 'Mathematics', 'Social Science', 'English', 'Assamese', 'Hindi'],
    'Class 11': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'Political Science', 'History'],
    'Class 12': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'Political Science', 'History'],
    'College': ['Financial Accounting', 'Business Law', 'Corporate Accounting', 'Political Science', 'Economics', 'Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology'],
    'B.Com': ['Financial Accounting', 'Business Law', 'Principles of Management', 'Business Economics', 'Corporate Accounting', 'Income Tax'],
    'B.A.': ['Political Science', 'History', 'Education', 'Sociology', 'English Literature', 'Assamese Literature'],
    'B.Sc.': ['Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology', 'Computer Science']
  }
};

export const INITIAL_CHAPTERS: Chapter[] = [];

// Default initial note data for B.Com 1st Semester
const INITIAL_NOTES: Note[] = [
  {
    id: 'note-fa-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Financial Accounting',
    unit: 'Unit 1: Introduction to Accounting & Standards',
    title: 'Financial Accounting – Unit 1 Complete Handwritten Notes',
    description: 'Comprehensive exam-focused notes covering Accounting Principles, Conventions, AS-1, AS-9, Accounting Equation, and Journal Entries with solved university questions.',
    pages: 42,
    originalPrice: 50,
    offerPrice: 20,
    coverImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-20T12:00:00.000Z',
    downloadsCount: 148,
    pdfFileName: 'BCom_Sem1_Financial_Accounting_Unit1_NoteNest.pdf'
  },
  {
    id: 'note-fa-u2',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Financial Accounting',
    unit: 'Unit 2: Depreciation, Reserves & Provisions',
    title: 'Financial Accounting – Unit 2 Depreciation & Valuation Master Notes',
    description: 'Straight Line Method, Diminishing Balance Method, Change of Method provisions as per AS-6/AS-10 with practical step-by-step illustrations.',
    pages: 36,
    originalPrice: 60,
    offerPrice: 25,
    coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-18T10:00:00.000Z',
    updatedAt: '2026-08-22T12:00:00.000Z',
    downloadsCount: 92,
    pdfFileName: 'BCom_Sem1_Financial_Accounting_Unit2_NoteNest.pdf'
  },
  {
    id: 'note-bl-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Business Law',
    unit: 'Unit 1: Indian Contract Act 1872',
    title: 'Business Law – Unit 1 Indian Contract Act Simplified',
    description: 'Covers Offer & Acceptance, Consideration, Capacity of Parties, Free Consent, Legality of Object and Void Agreements with famous landmark cases.',
    pages: 58,
    originalPrice: 80,
    offerPrice: 35,
    coverImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    downloadsCount: 215,
    pdfFileName: 'BCom_Sem1_Business_Law_Unit1_NoteNest.pdf'
  },
  {
    id: 'note-pom-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Principles of Management',
    unit: 'Unit 1: Fundamentals of Management & Planning',
    title: 'Principles of Management – Unit 1 Concepts & Theories',
    description: 'Classical, Neo-Classical, Modern Management approaches, Fayols 14 Principles, Scientific Management by Taylor, MBO & Planning hierarchy.',
    pages: 45,
    originalPrice: 45,
    offerPrice: 19,
    coverImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z',
    downloadsCount: 160,
    pdfFileName: 'BCom_Sem1_Principles_Of_Management_Unit1_NoteNest.pdf'
  },
  {
    id: 'note-be-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Business Economics',
    unit: 'Unit 1: Demand & Consumer Behavior',
    title: 'Business Economics (Micro) – Unit 1 Demand Analysis & Elasticity',
    description: 'Law of Demand, Elasticity of Demand (Price, Income, Cross), Indifference Curve Analysis, Consumer Surplus, and practical managerial applications.',
    pages: 50,
    originalPrice: 65,
    offerPrice: 29,
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-28T12:00:00.000Z',
    downloadsCount: 180,
    pdfFileName: 'BCom_Sem1_Business_Economics_Unit1_NoteNest.pdf'
  }
];

const INITIAL_WEBSITE_SETTINGS: WebsiteSettings = {
  logoUrl: '/assets/notenest-logo.png', // official NoteNest permanent logo
  siteName: 'NoteNest',
  tagline: 'Learn • Prepare • Succeed',
  supportEmail: 'support@notenest.in',
  phone: '+91 98765 43210',
  primaryCourse: 'B.Com',
  primarySemester: '1st Semester'
};

const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: 'notenest01@ptyes',
  qrCodeUrl: '/assets/qr/qr-1.png',
  activeQrCode: 'qr-1',
  accountName: 'Nabiran Necha (NoteNest)',
  instructions: '1. Open any UPI App (PhonePe, Google Pay, Paytm, BHIM).\n2. Scan the active NoteNest QR code or send payment directly to the UPI ID.\n3. Enter the exact note amount.\n4. After successful payment, copy the 12-digit UPI Transaction ID / UTR.\n5. Paste the UTR below and submit for instant admin verification.'
};

const INITIAL_USERS: User[] = [];

const STORAGE_KEYS = {
  NOTES: 'notenest_notes_v1',
  USERS: 'notenest_users_v1',
  ORDERS: 'notenest_orders_v1',
  PURCHASES: 'notenest_purchases_v1',
  WEBSITE_SETTINGS: 'notenest_website_settings_v1',
  PAYMENT_SETTINGS: 'notenest_payment_settings_v1',
  FIREBASE_CONFIG: 'notenest_firebase_config_v1',
  CHAPTERS: 'notenest_chapters_v2',
  GROUPS: 'notenest_groups_v1',
  ACADEMIC_SETTINGS: 'notenest_academic_settings_v2'
};

export class NoteNestDB {
  static getNotes(): Note[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
        return INITIAL_NOTES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTES;
    }
  }

  static saveNotes(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  static getNoteById(id: string): Note | undefined {
    return this.getNotes().find(n => n.id === id);
  }

  static addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const notes = this.getNotes();
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  static updateNote(id: string, updates: Partial<Note>): Note | null {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;
    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveNotes(notes);
    return notes[index];
  }

  static deleteNote(id: string): boolean {
    const notes = this.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === notes.length) return false;
    this.saveNotes(filtered);
    return true;
  }

  // Users
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Sync verified user profile from Firebase to local customer directory
  static syncUserProfile(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    this.saveUsers(users);
  }

  // Orders
  static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static createOrder(orderData: {
    customerId: string;
    userId?: string;
    customerName: string;
    customerEmail: string;
    chapterId?: string;
    chapterTitle?: string;
    accessType?: 'normal' | 'premium';
    noteId?: string;
    noteTitle: string;
    amount: number;
    paymentMethod?: 'manual_upi' | 'future_gateway';
  }): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerId: orderData.customerId,
      userId: orderData.userId || orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      chapterId: orderData.chapterId,
      chapterTitle: orderData.chapterTitle,
      accessType: orderData.accessType,
      noteId: orderData.noteId || orderData.chapterId,
      noteTitle: orderData.noteTitle,
      amount: orderData.amount,
      paymentMethod: orderData.paymentMethod || 'manual_upi',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  static submitPaymentProof(orderId: string, utr: string, screenshotUrl?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    order.utr = utr;
    if (screenshotUrl) order.screenshotUrl = screenshotUrl;
    order.paymentStatus = 'pending';
    this.saveOrders(orders);
    return order;
  }

  static verifyPayment(orderId: string, status: 'paid' | 'rejected', verifiedBy: string, adminNote?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = status;
    order.verifiedAt = new Date().toISOString();
    order.verifiedBy = verifiedBy;
    if (adminNote) order.adminNote = adminNote;
    this.saveOrders(orders);

    if (status === 'paid') {
      // If order includes chapterId, create or update chapter purchase record
      if (order.chapterId) {
        const purchases = this.getPurchases();
        const existing = purchases.find(p => p.customerId === order.customerId && (p.chapterId === order.chapterId || p.noteId === order.chapterId));
        const chapter = this.getChapterById(order.chapterId);
        if (!existing) {
          const newPurchase: Purchase = {
            id: `pur-${Date.now()}`,
            customerId: order.customerId,
            chapterId: order.chapterId,
            chapterTitle: order.chapterTitle || chapter?.title || order.noteTitle,
            accessType: order.accessType || chapter?.accessType || 'normal',
            noteId: order.chapterId,
            orderId: order.id,
            noteTitle: order.noteTitle,
            purchasedPrice: order.amount,
            purchasedAt: new Date().toISOString(),
            accessStatus: 'active',
            course: chapter?.classOrCourse || 'Curriculum',
            semester: chapter?.semester || 'Academic Session',
            subject: chapter?.subject || 'All Subjects'
          };
          purchases.unshift(newPurchase);
          this.savePurchases(purchases);
        }
      } else if (order.noteId) {
        // If order includes noteId, create or update purchase record
        const purchases = this.getPurchases();
        const existing = purchases.find(p => p.customerId === order.customerId && p.noteId === order.noteId);
        const note = this.getNoteById(order.noteId);
        if (!existing) {
          const newPurchase: Purchase = {
            id: `pur-${Date.now()}`,
            customerId: order.customerId,
            noteId: order.noteId,
            orderId: order.id,
            noteTitle: order.noteTitle,
            purchasedPrice: order.amount,
            purchasedAt: new Date().toISOString(),
            accessStatus: 'active',
            course: note?.course || 'Curriculum',
            semester: note?.semester || 'Academic Session',
            subject: note?.subject || 'All Subjects'
          };
          purchases.unshift(newPurchase);
          this.savePurchases(purchases);

          // Increment download/sale count
          if (note) {
            this.updateNote(note.id, { downloadsCount: (note.downloadsCount || 0) + 1 });
          }
        }
      }
    }
    return order;
  }

  // Purchases
  static getPurchases(): Purchase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static savePurchases(purchases: Purchase[]): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }

  static getCustomerPurchases(customerId: string): Purchase[] {
    return this.getPurchases().filter(p => p.customerId === customerId && p.accessStatus === 'active');
  }

  static hasCustomerPurchasedNote(customerId: string, noteId: string): boolean {
    return this.getPurchases().some(p => p.customerId === customerId && p.noteId === noteId && p.accessStatus === 'active');
  }

  static hasCustomerPurchasedChapter(customerId: string, chapterId: string): boolean {
    if (!customerId || !chapterId) return false;
    return this.getPurchases().some(
      p => p.customerId === customerId &&
      (p.chapterId === chapterId || p.noteId === chapterId) &&
      p.accessStatus === 'active'
    );
  }

  // Website Settings
  static getWebsiteSettings(): WebsiteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEBSITE_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(INITIAL_WEBSITE_SETTINGS));
        return INITIAL_WEBSITE_SETTINGS;
      }
      const parsed = JSON.parse(data);
      if (!parsed.logoUrl) {
        parsed.logoUrl = '/assets/notenest-logo.png';
      }
      return parsed;
    } catch {
      return INITIAL_WEBSITE_SETTINGS;
    }
  }

  static saveWebsiteSettings(settings: WebsiteSettings): void {
    localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(settings));
  }

  // Payment Settings
  static getPaymentSettings(): PaymentSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(INITIAL_PAYMENT_SETTINGS));
        return INITIAL_PAYMENT_SETTINGS;
      }
      const parsed = JSON.parse(data);
      const activeQr = (parsed.activeQrCode === 'qr-2' || parsed.activeQrCode === 'qr-3') ? parsed.activeQrCode : 'qr-1';
      parsed.activeQrCode = activeQr;
      if (!parsed.qrCodeUrl || parsed.qrCodeUrl.includes('api.qrserver.com') || parsed.qrCodeUrl.includes('firebasestorage')) {
        parsed.qrCodeUrl = `/assets/qr/${activeQr}.png`;
      }
      return parsed;
    } catch {
      return INITIAL_PAYMENT_SETTINGS;
    }
  }

  static savePaymentSettings(settings: PaymentSettings): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(settings));
  }

  // ==========================================
  // Chapters & Topics (Multi-Education)
  // ==========================================
  static getChapters(): Chapter[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
      if (!data) {
        return [];
      }
      const parsed: Chapter[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Remove any leftover demo chapters
      const cleanList = parsed.filter(c => 
        c && c.id &&
        !c.id.startsWith('chap-c10-') &&
        !c.id.startsWith('chap-c12-') &&
        !c.id.startsWith('chap-bcom-') &&
        !c.id.startsWith('chap-ba-')
      );

      // Ensure accessType, originalPrice, offerPrice, and price are normalized
      return cleanList.map(c => {
        const accessType: 'normal' | 'premium' = c.accessType === 'premium' ? 'premium' : 'normal';
        const defaultOffer = accessType === 'premium' ? 30 : 10;
        const defaultOriginal = accessType === 'premium' ? 50 : 20;

        let offerPrice = typeof c.offerPrice === 'number' && !isNaN(c.offerPrice) && c.offerPrice >= 0
          ? c.offerPrice
          : (typeof c.price === 'number' && !isNaN(c.price) && c.price >= 0 ? c.price : defaultOffer);

        let originalPrice = typeof c.originalPrice === 'number' && !isNaN(c.originalPrice) && c.originalPrice >= 0
          ? c.originalPrice
          : Math.max(offerPrice, defaultOriginal);

        // Validation: offerPrice cannot be greater than originalPrice
        if (offerPrice > originalPrice) {
          originalPrice = offerPrice;
        }

        const price = offerPrice;

        const defaultPdf = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview';
        const pdfUrl = c.pdfUrl || (c as any).pdfLink || (c.topics && (c.topics as any)[0]?.pdfUrl) || defaultPdf;

        return {
          ...c,
          accessType,
          originalPrice,
          offerPrice,
          price,
          pdfUrl
        };
      });
    } catch {
      return [];
    }
  }

  static saveChapters(chapters: Chapter[]): void {
    const normalized = chapters.map(c => {
      const accessType: 'normal' | 'premium' = c.accessType === 'premium' ? 'premium' : 'normal';
      const defaultOffer = accessType === 'premium' ? 30 : 10;
      const defaultOriginal = accessType === 'premium' ? 50 : 20;

      let offerPrice = typeof c.offerPrice === 'number' && !isNaN(c.offerPrice) && c.offerPrice >= 0
        ? c.offerPrice
        : (typeof c.price === 'number' && !isNaN(c.price) && c.price >= 0 ? c.price : defaultOffer);

      let originalPrice = typeof c.originalPrice === 'number' && !isNaN(c.originalPrice) && c.originalPrice >= 0
        ? c.originalPrice
        : Math.max(offerPrice, defaultOriginal);

      if (offerPrice > originalPrice) {
        originalPrice = offerPrice;
      }

      const price = offerPrice;

      return {
        ...c,
        accessType,
        originalPrice,
        offerPrice,
        price
      };
    });
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(normalized));
  }

  static getChapterById(id: string): Chapter | undefined {
    return this.getChapters().find(c => c.id === id);
  }

  static saveChapter(chapter: Chapter): Chapter {
    const chapters = this.getChapters();
    const idx = chapters.findIndex(c => c.id === chapter.id);
    const accessType: 'normal' | 'premium' = chapter.accessType === 'premium' ? 'premium' : 'normal';
    const defaultOffer = accessType === 'premium' ? 30 : 10;
    const defaultOriginal = accessType === 'premium' ? 50 : 20;

    let offerPrice = typeof chapter.offerPrice === 'number' && !isNaN(chapter.offerPrice) && chapter.offerPrice >= 0
      ? chapter.offerPrice
      : (typeof chapter.price === 'number' && !isNaN(chapter.price) && chapter.price >= 0 ? chapter.price : defaultOffer);

    let originalPrice = typeof chapter.originalPrice === 'number' && !isNaN(chapter.originalPrice) && chapter.originalPrice >= 0
      ? chapter.originalPrice
      : Math.max(offerPrice, defaultOriginal);

    if (offerPrice > originalPrice) {
      originalPrice = offerPrice;
    }

    const price = offerPrice;

    const updatedChapter: Chapter = {
      ...chapter,
      accessType,
      originalPrice,
      offerPrice,
      price,
      topicsCount: chapter.topics ? chapter.topics.length : (chapter.topicsCount || 0),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      chapters[idx] = updatedChapter;
    } else {
      chapters.unshift(updatedChapter);
    }
    this.saveChapters(chapters);
    return updatedChapter;
  }

  static deleteChapter(id: string): boolean {
    const chapters = this.getChapters();
    const filtered = chapters.filter(c => c.id !== id);
    if (filtered.length === chapters.length) return false;
    this.saveChapters(filtered);
    return true;
  }

  // ==========================================
  // Groups Management (Multi-Education Syllabus)
  // ==========================================
  static getGroups(): Group[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      let groups: Group[] = [];
      if (!data) {
        return [];
      } else {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];
        groups = parsed.filter(g => 
          g && (g.id || g.groupId) &&
          !g.id.startsWith('grp-c10-') &&
          !g.id.startsWith('grp-c12-') &&
          !g.id.startsWith('grp-bcom-') &&
          !g.id.startsWith('grp-ba-')
        );
      }

      // Ensure chapterIds & chapterOrder arrays exist for backwards-compatibility
      const chapters = this.getChapters();
      let changed = false;
      groups = groups.map(g => {
        const id = g.id || g.groupId;
        let cIds = Array.isArray(g.chapterIds) ? [...g.chapterIds] : [];
        if (cIds.length === 0) {
          const associatedChapters = chapters.filter(c => c.groupId === id);
          if (associatedChapters.length > 0) {
            cIds = associatedChapters.map(c => c.id);
            changed = true;
          }
        }
        const cOrder = Array.isArray(g.chapterOrder) && g.chapterOrder.length > 0 ? g.chapterOrder : cIds;
        return {
          ...g,
          id,
          groupId: id,
          chapterIds: cIds,
          chapterOrder: cOrder
        };
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
      }

      // Sort by order ascending
      return groups.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    } catch {
      return [];
    }
  }

  static saveGroups(groups: Group[]): void {
    const sorted = [...groups].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(sorted));
  }

  static getGroupById(id: string): Group | undefined {
    return this.getGroups().find(g => g.id === id || g.groupId === id);
  }

  static saveGroup(group: Group): Group {
    const groups = this.getGroups();
    const targetId = group.id || group.groupId || `grp-${Date.now()}`;
    const idx = groups.findIndex(g => g.id === targetId || g.groupId === targetId);
    
    const chapterIds = Array.isArray(group.chapterIds) ? [...group.chapterIds] : [];
    const chapterOrder = Array.isArray(group.chapterOrder) && group.chapterOrder.length > 0
      ? group.chapterOrder
      : chapterIds;

    const updatedGroup: Group = {
      ...group,
      id: targetId,
      groupId: targetId,
      chapterIds,
      chapterOrder,
      order: typeof group.order === 'number' ? group.order : (groups.length + 1),
      active: group.active !== false,
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      groups[idx] = updatedGroup;
    } else {
      groups.push(updatedGroup);
    }
    this.saveGroups(groups);

    // Sync chapter relationships safely:
    // Update existing chapter documents with groupId link without duplicating or deleting any chapter
    const chapters = this.getChapters();
    const updatedChapters = chapters.map(c => {
      if (chapterIds.includes(c.id)) {
        return { ...c, groupId: targetId };
      }
      // If chapter was previously assigned to this group but unassigned, remove the link
      if (c.groupId === targetId && !chapterIds.includes(c.id)) {
        return { ...c, groupId: undefined };
      }
      return c;
    });
    this.saveChapters(updatedChapters);

    return updatedGroup;
  }

  /**
   * Safety rule: Deleting a Group removes only the Group playlist relationship.
   * Chapters are safely unlinked and NEVER deleted.
   */
  static deleteGroup(id: string): { deletedChaptersCount: number } {
    const groups = this.getGroups();
    const remainingGroups = groups.filter(g => g.id !== id && g.groupId !== id);
    this.saveGroups(remainingGroups);

    // Unlink chapters safely so they remain intact in Firestore & general curriculum
    const chapters = this.getChapters();
    const updatedChapters = chapters.map(c => (c.groupId === id ? { ...c, groupId: undefined } : c));
    this.saveChapters(updatedChapters);

    return { deletedChaptersCount: 0 };
  }

  static reorderGroups(groupOrders: { id: string; order: number }[]): Group[] {
    const groups = this.getGroups();
    const orderMap = new Map<string, number>();
    groupOrders.forEach(item => orderMap.set(item.id, item.order));

    const updated = groups.map(g => {
      if (orderMap.has(g.id)) {
        return { ...g, order: orderMap.get(g.id)!, updatedAt: new Date().toISOString() };
      }
      return g;
    });

    this.saveGroups(updated);
    return this.getGroups();
  }

  /**
   * Returns chapters belonging to a group, strictly ordered by the group's chapterOrder
   */
  static getChaptersByGroupId(groupId: string): Chapter[] {
    const group = this.getGroupById(groupId);
    const allChapters = this.getChapters();
    if (!group) {
      return allChapters.filter(c => c.groupId === groupId);
    }

    const assignedIds = group.chapterIds || [];
    // Also include any chapters having c.groupId === groupId if not in chapterIds yet
    allChapters.forEach(c => {
      if (c.groupId === groupId && !assignedIds.includes(c.id)) {
        assignedIds.push(c.id);
      }
    });

    const chapterMap = new Map<string, Chapter>();
    allChapters.forEach(c => chapterMap.set(c.id, c));

    const orderList = group.chapterOrder && group.chapterOrder.length > 0
      ? group.chapterOrder
      : assignedIds;

    const ordered: Chapter[] = [];
    orderList.forEach(id => {
      const c = chapterMap.get(id);
      if (c && !ordered.some(existing => existing.id === c.id)) {
        ordered.push(c);
      }
    });

    // Append any assigned chapters not listed in orderList
    assignedIds.forEach(id => {
      const c = chapterMap.get(id);
      if (c && !ordered.some(existing => existing.id === c.id)) {
        ordered.push(c);
      }
    });

    return ordered;
  }

  static addChaptersToGroup(groupId: string, newChapterIds: string[]): Group | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;

    const currentIds = group.chapterIds || [];
    const combinedIds = Array.from(new Set([...currentIds, ...newChapterIds]));
    const combinedOrder = Array.from(new Set([...(group.chapterOrder || currentIds), ...newChapterIds]));

    return this.saveGroup({
      ...group,
      chapterIds: combinedIds,
      chapterOrder: combinedOrder
    });
  }

  static removeChapterFromGroup(groupId: string, chapterId: string): Group | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;

    const updatedIds = (group.chapterIds || []).filter(id => id !== chapterId);
    const updatedOrder = (group.chapterOrder || []).filter(id => id !== chapterId);

    return this.saveGroup({
      ...group,
      chapterIds: updatedIds,
      chapterOrder: updatedOrder
    });
  }

  static reorderGroupChapters(groupId: string, orderedChapterIds: string[]): Group | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;

    return this.saveGroup({
      ...group,
      chapterOrder: orderedChapterIds
    });
  }

  // ==========================================
  // Academic Hierarchy Settings
  // ==========================================
  static getAcademicSettings(): AcademicSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACADEMIC_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, JSON.stringify(INITIAL_ACADEMIC_SETTINGS));
        return INITIAL_ACADEMIC_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ACADEMIC_SETTINGS;
    }
  }

  static saveAcademicSettings(settings: AcademicSettings): void {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, JSON.stringify(settings));
  }

  // Secure PDF content retrieval (generates official formatted printable PDF doc)
  static generateSecureNotePDF(note: Note, customerName: string): string {
    return `
      %PDF-1.4
      % NoteNest Protected Document
      Title: ${note.title}
      Course: ${note.course} - ${note.semester}
      Subject: ${note.subject}
      Unit: ${note.unit}
      Authorized Licensee: ${customerName}
      Pages: ${note.pages}
      Copyright © NoteNest. All rights reserved.
    `.trim();
  }
}

// Automatically clean up any legacy hardcoded demo chapters or demo groups in localStorage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const rawChapters = localStorage.getItem('notenest_chapters');
    if (rawChapters && (rawChapters.includes('chap-c10-') || rawChapters.includes('chap-bcom-') || rawChapters.includes('chap-c12-') || rawChapters.includes('chap-ba-'))) {
      const parsed = JSON.parse(rawChapters);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((c: any) =>
          c && c.id &&
          !c.id.startsWith('chap-c10-') &&
          !c.id.startsWith('chap-c12-') &&
          !c.id.startsWith('chap-bcom-') &&
          !c.id.startsWith('chap-ba-')
        );
        localStorage.setItem('notenest_chapters', JSON.stringify(cleaned));
      }
    }

    const rawGroups = localStorage.getItem('notenest_groups');
    if (rawGroups && (rawGroups.includes('grp-c10-') || rawGroups.includes('grp-bcom-') || rawGroups.includes('grp-c12-') || rawGroups.includes('grp-ba-'))) {
      const parsed = JSON.parse(rawGroups);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((g: any) =>
          g && (g.id || g.groupId) &&
          !g.id.startsWith('grp-c10-') &&
          !g.id.startsWith('grp-c12-') &&
          !g.id.startsWith('grp-bcom-') &&
          !g.id.startsWith('grp-ba-')
        );
        localStorage.setItem('notenest_groups', JSON.stringify(cleaned));
      }
    }
  }
} catch {
  // Ignore in non-browser environments
}

