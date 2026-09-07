import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, FirestoreError } from 'firebase/firestore';
import { getFirebaseDB } from './firebase';
import { Chapter, Group } from '../types';
import { NoteNestDB } from './db';

/**
 * Normalizes a raw Firestore chapter document into a strongly-typed Chapter.
 */
export function normalizeChapter(raw: any): Chapter {
  const accessType: 'normal' | 'premium' = raw.accessType === 'premium' ? 'premium' : 'normal';
  const defaultOffer = accessType === 'premium' ? 30 : 10;
  const defaultOriginal = accessType === 'premium' ? 50 : 20;

  let offerPrice = typeof raw.offerPrice === 'number' && !isNaN(raw.offerPrice) && raw.offerPrice >= 0
    ? raw.offerPrice
    : (typeof raw.price === 'number' && !isNaN(raw.price) && raw.price >= 0 ? raw.price : defaultOffer);

  let originalPrice = typeof raw.originalPrice === 'number' && !isNaN(raw.originalPrice) && raw.originalPrice >= 0
    ? raw.originalPrice
    : Math.max(offerPrice, defaultOriginal);

  if (offerPrice > originalPrice) {
    originalPrice = offerPrice;
  }

  const price = offerPrice;
  const id = raw.id || raw.chapterId || `chap-${Date.now()}`;

  return {
    id,
    chapterId: raw.chapterId || id,
    title: raw.title || 'Untitled Chapter',
    chapterNumber: String(raw.chapterNumber || '1'),
    groupId: raw.groupId || '',
    description: raw.description || '',
    educationLevel: raw.educationLevel || 'School',
    classOrCourse: raw.classOrCourse || raw.classLevel || 'Class 10',
    classLevel: raw.classLevel || raw.classOrCourse || 'Class 10',
    stream: raw.stream || 'General',
    medium: raw.medium || 'Assamese',
    semester: raw.semester || 'N/A',
    subject: raw.subject || raw.subjectId || 'General Science',
    subjectId: raw.subjectId || raw.subject || 'General Science',
    accessType,
    originalPrice,
    offerPrice,
    price,
    pdfUrl: raw.pdfUrl || raw.pdfLink || raw.completeChapterPdfLink || (Array.isArray(raw.topics) && raw.topics[0]?.pdfUrl) || '',
    completeChapterPdfLink: raw.completeChapterPdfLink || raw.pdfUrl || raw.pdfLink || '',
    videoUrl: raw.videoUrl || '',
    slidesUrl: raw.slidesUrl || '',
    flashcardsUrl: raw.flashcardsUrl || '',
    quizUrl: raw.quizUrl || '',
    topicsCount: typeof raw.topicsCount === 'number' ? raw.topicsCount : (Array.isArray(raw.topics) ? raw.topics.length : 0),
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    published: raw.published !== false && raw.isActive !== false,
    isActive: raw.published !== false && raw.isActive !== false,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

/**
 * Normalizes a raw Firestore group document into a strongly-typed Group.
 */
export function normalizeGroup(raw: any, docId: string): Group {
  const id = docId || raw.id || raw.groupId || `grp-${Date.now()}`;
  const chapterIds = Array.isArray(raw.chapterIds) ? raw.chapterIds : [];
  const chapterOrder = Array.isArray(raw.chapterOrder) && raw.chapterOrder.length > 0
    ? raw.chapterOrder
    : chapterIds;

  return {
    id,
    groupId: id,
    groupName: raw.groupName || 'Untitled Group',
    description: raw.description || '',
    educationLevel: raw.educationLevel || 'School',
    classOrCourse: raw.classOrCourse || 'Class 10',
    medium: raw.medium || 'Assamese',
    semester: raw.semester || 'N/A',
    subject: raw.subject || 'General Science',
    chapterIds,
    chapterOrder,
    order: typeof raw.order === 'number' ? raw.order : 1,
    active: raw.active !== false,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

/**
 * Real-time listener for Firestore chapters collection.
 * Triggers callback immediately on initial load and whenever any chapter
 * is ADDED, EDITED, or DELETED in Firestore across any device.
 * Returns unsubscribe function.
 */
export function subscribeToChapters(
  onData: (chapters: Chapter[]) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  try {
    const db = getFirebaseDB();
    const chaptersQuery = query(collection(db, 'chapters'));

    const unsubscribe = onSnapshot(
      chaptersQuery,
      (snapshot) => {
        const chaptersList: Chapter[] = [];
        snapshot.forEach((docSnap) => {
          const rawData = docSnap.data();
          chaptersList.push(normalizeChapter({ ...rawData, id: docSnap.id }));
        });

        // Sort chapters logically by numeric chapter number or title
        chaptersList.sort((a, b) => {
          const numA = Number(a.chapterNumber);
          const numB = Number(b.chapterNumber);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return String(a.chapterNumber || '').localeCompare(String(b.chapterNumber || ''), undefined, { numeric: true });
        });

        // Keep local cache up-to-date for synchronous helper lookups
        NoteNestDB.saveChapters(chaptersList);

        onData(chaptersList);
      },
      (error) => {
        console.warn('[NoteNest Realtime] chapters listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('[NoteNest Realtime] Failed to initialize chapters listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for Firestore groups collection.
 * Triggers callback immediately on initial load and whenever any group
 * is ADDED, EDITED, or DELETED in Firestore across any device.
 * Returns unsubscribe function.
 */
export function subscribeToGroups(
  onData: (groups: Group[]) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  try {
    const db = getFirebaseDB();
    const groupsQuery = query(collection(db, 'groups'));

    const unsubscribe = onSnapshot(
      groupsQuery,
      (snapshot) => {
        const groupsList: Group[] = [];
        snapshot.forEach((docSnap) => {
          const rawData = docSnap.data();
          groupsList.push(normalizeGroup(rawData, docSnap.id));
        });

        // Sort groups by display order ascending
        groupsList.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

        // Keep local cache up-to-date for synchronous helper lookups
        NoteNestDB.saveGroups(groupsList);

        onData(groupsList);
      },
      (error) => {
        console.warn('[NoteNest Realtime] groups listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('[NoteNest Realtime] Failed to initialize groups listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Custom React hook for live real-time synchronization of Chapters.
 * Cleanly subscribes on mount and unsubscribes on unmount.
 */
export function useRealtimeChapters() {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    // Return empty array by default (no hardcoded demo chapters)
    return NoteNestDB.getChapters();
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToChapters(
      (updatedChapters) => {
        if (isMounted) {
          setChapters(updatedChapters);
          setLoading(false);
        }
      },
      (err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { chapters, loading, error };
}

/**
 * Custom React hook for live real-time synchronization of Groups.
 * Cleanly subscribes on mount and unsubscribes on unmount.
 */
export function useRealtimeGroups() {
  const [groups, setGroups] = useState<Group[]>(() => {
    return NoteNestDB.getGroups();
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToGroups(
      (updatedGroups) => {
        if (isMounted) {
          setGroups(updatedGroups);
          setLoading(false);
        }
      },
      (err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { groups, loading, error };
}

/**
 * Custom React hook for live real-time synchronization of both Chapters and Groups.
 */
export function useRealtimeCurriculum() {
  const { chapters, loading: chaptersLoading, error: chaptersError } = useRealtimeChapters();
  const { groups, loading: groupsLoading, error: groupsError } = useRealtimeGroups();

  return {
    chapters,
    groups,
    loading: chaptersLoading || groupsLoading,
    error: chaptersError || groupsError
  };
}
