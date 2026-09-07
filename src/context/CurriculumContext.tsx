import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Chapter, Group } from '../types';
import { subscribeToChapters, subscribeToGroups } from '../services/curriculumRealtime';

interface CurriculumContextType {
  chapters: Chapter[];
  groups: Group[];
  activeGroups: Group[];
  loading: boolean;
  chaptersLoading: boolean;
  groupsLoading: boolean;
  error: Error | null;
  isLive: boolean;
  getChapterById: (id: string) => Chapter | undefined;
  getGroupById: (id: string) => Group | undefined;
  getGroupChapters: (groupId: string) => Chapter[];
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Initialize and maintain exactly ONE realtime listener for chapters & groups across the entire application
  useEffect(() => {
    let isMounted = true;

    // 1. Chapters onSnapshot listener
    const unsubChapters = subscribeToChapters(
      (newChapters) => {
        if (isMounted) {
          setChapters(newChapters);
          setChaptersLoading(false);
          setIsLive(true);
        }
      },
      (err) => {
        if (isMounted) {
          console.error('[CurriculumContext] Chapters listener error:', err);
          setError(err);
          setChaptersLoading(false);
        }
      }
    );

    // 2. Groups onSnapshot listener
    const unsubGroups = subscribeToGroups(
      (newGroups) => {
        if (isMounted) {
          setGroups(newGroups);
          setGroupsLoading(false);
          setIsLive(true);
        }
      },
      (err) => {
        if (isMounted) {
          console.error('[CurriculumContext] Groups listener error:', err);
          setError(err);
          setGroupsLoading(false);
        }
      }
    );

    // Clean up both listeners when provider unmounts
    return () => {
      isMounted = false;
      unsubChapters();
      unsubGroups();
    };
  }, []);

  const activeGroups = useMemo(() => {
    return groups.filter(g => g.active !== false);
  }, [groups]);

  const getChapterById = useCallback((id: string): Chapter | undefined => {
    return chapters.find(c => c.id === id || c.chapterId === id);
  }, [chapters]);

  const getGroupById = useCallback((id: string): Group | undefined => {
    return groups.find(g => g.id === id || g.groupId === id);
  }, [groups]);

  const getGroupChapters = useCallback((groupId: string): Chapter[] => {
    const targetGroup = groups.find(g => g.id === groupId || g.groupId === groupId);
    if (!targetGroup) return [];

    const chapterMap = new Map<string, Chapter>(chapters.map(c => [c.id, c]));
    const orderedIds = (targetGroup.chapterOrder && targetGroup.chapterOrder.length > 0)
      ? targetGroup.chapterOrder
      : (targetGroup.chapterIds || []);

    const result: Chapter[] = [];
    const seen = new Set<string>();

    for (const cId of orderedIds) {
      if (!seen.has(cId)) {
        const chap = chapterMap.get(cId);
        if (chap) {
          result.push(chap);
          seen.add(cId);
        }
      }
    }

    // Fallback: search by chapter.groupId
    if (result.length === 0) {
      for (const chap of chapters) {
        if (chap.groupId === targetGroup.id || chap.groupId === targetGroup.groupId) {
          if (!seen.has(chap.id)) {
            result.push(chap);
            seen.add(chap.id);
          }
        }
      }
      result.sort((a, b) => (Number(a.chapterNumber) || 0) - (Number(b.chapterNumber) || 0));
    }

    return result;
  }, [chapters, groups]);

  const value = useMemo<CurriculumContextType>(() => ({
    chapters,
    groups,
    activeGroups,
    loading: chaptersLoading || groupsLoading,
    chaptersLoading,
    groupsLoading,
    error,
    isLive,
    getChapterById,
    getGroupById,
    getGroupChapters
  }), [
    chapters,
    groups,
    activeGroups,
    chaptersLoading,
    groupsLoading,
    error,
    isLive,
    getChapterById,
    getGroupById,
    getGroupChapters
  ]);

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = (): CurriculumContextType => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};
