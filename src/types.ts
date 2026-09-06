export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
}

export interface QuizItem {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export type ContentAccessTier = 'normal' | 'premium';

export interface Topic {
  id: string;
  chapterId: string;
  topicName: string;
  order: number;
  videoUrl?: string; // Topic Video Lesson (YouTube / Google Drive embed)
  videoAccess?: ContentAccessTier;
  slidesUrl?: string; // Topic Google Slides / Presentation embed
  slidesAccess?: ContentAccessTier;
  flashcards?: FlashcardItem[];
  flashcardsAccess?: ContentAccessTier;
  quiz?: QuizItem[];
  quizAccess?: ContentAccessTier;
  title?: string; // Backwards compatibility alias for topicName
  pdfUrl?: string; // Deprecated: Kept optional for legacy backwards compatibility
  pdfAccess?: ContentAccessTier;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  groupId: string; // duplicate/alias for Firestore document ID
  groupName: string;
  description?: string;
  educationLevel: 'School' | 'College' | string;
  classOrCourse: string; // e.g. Class 9, Class 10, Class 11, Class 12, B.Com, B.A., B.Sc.
  medium: 'Assamese' | 'English' | 'Bangla' | 'Hindi' | string;
  semester?: string; // Semester 1, 2, 3... (for college / if applicable)
  subject: string;
  chapterIds: string[]; // List of chapter IDs in this group playlist
  chapterOrder?: string[]; // Explicit ordered list of chapter IDs inside this group
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  chapterId?: string;
  groupId?: string; // Links this chapter to a specific Group
  title: string;
  chapterName?: string; // Alias for title
  chapterNumber?: number | string;
  order?: number; // Alias for chapterNumber ordering
  description?: string;
  educationLevel: 'school' | 'college' | string;
  classOrCourse: string; // e.g. Class 9, Class 10, Class 11, Class 12, B.Com, B.A., B.Sc.
  classLevel?: string;
  stream?: string; // Science, Arts, Commerce, General
  medium: 'Assamese' | 'English' | 'Bangla' | 'Hindi' | string;
  semester?: string; // Semester 1, 2, 3... (for college)
  subject: string;
  subjectId?: string;
  accessType: 'normal' | 'premium'; // SINGLE SOURCE OF TRUTH for 👑 badge and content rules
  originalPrice?: number; // Reference standard price (e.g. ₹20 for normal, ₹50 for premium)
  offerPrice?: number; // Actual payable price (e.g. ₹10 for normal, ₹30 for premium)
  price: number; // Kept for backwards compatibility, equal to offerPrice
  pdfUrl?: string; // SINGLE COMPLETE CHAPTER PDF (Google Drive preview URL)
  completeChapterPdfLink?: string; // Alias for pdfUrl
  videoUrl?: string;
  slidesUrl?: string;
  flashcardsUrl?: string;
  quizUrl?: string;
  topicsCount?: number;
  topics?: Topic[];
  published: boolean;
  active?: boolean; // Alias for published
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSettings {
  educationLevels: string[];
  schoolClasses: string[];
  collegeCourses: string[];
  streams: string[];
  mediums: string[];
  semesters: string[];
  subjects: { [levelOrCourse: string]: string[] };
}

export interface Note {
  id: string;
  course: string;
  semester: string;
  subject: string;
  unit: string;
  title: string;
  description: string;
  pages: number;
  price?: number; // alias for offerPrice / discountPrice
  originalPrice: number;
  offerPrice: number;
  discountPrice?: number;
  coverImageUrl: string;
  thumbnailUrl?: string; // alias for coverImageUrl
  pdfDataUrl?: string; // base64 fallback
  pdfFileName?: string;
  pdfUrl?: string; // external or Google Drive PDF URL
  source?: 'google_drive' | 'local' | 'external';
  uploadedBy?: string;
  previewImages: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  downloadsCount?: number;
}

export type PaymentMethod = 'manual_upi' | 'future_gateway';
export type PaymentStatus = 'pending' | 'paid' | 'successful' | 'rejected' | 'failed';

export interface Order {
  id: string;
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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  utr?: string;
  screenshotUrl?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  adminNote?: string;
}

export interface Payment {
  id: string;
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
  utr: string;
  paymentDate: string;
  screenshotUrl?: string;
  status: 'pending' | 'successful' | 'rejected';
  adminNote?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Purchase {
  id: string;
  customerId: string;
  chapterId?: string;
  chapterTitle?: string;
  accessType?: 'normal' | 'premium';
  noteId: string;
  orderId: string;
  noteTitle: string;
  purchasedPrice: number;
  purchasedAt: string;
  accessStatus: 'active' | 'revoked';
  course: string;
  semester: string;
  subject: string;
}

export interface WebsiteSettings {
  logoUrl: string;
  siteName: string;
  tagline: string;
  supportEmail: string;
  phone: string;
  primaryCourse: string;
  primarySemester: string;
}

export interface PaymentSettings {
  methodName?: string;
  upiId: string;
  qrCodeUrl: string;
  activeQrCode?: 'qr-1' | 'qr-2' | 'qr-3';
  accountName: string;
  instructions: string;
  enabled?: boolean;
  logoUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}
