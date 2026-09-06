import React, { useState, useMemo, useEffect } from 'react';
import { Note, Chapter, Group } from '../types';
import { NoteNestDB } from '../services/db';
import { AdminService } from '../services/adminService';
import { NoteCard } from '../components/NoteCard';
import { ChapterContentViewerModal } from '../components/ChapterContentViewerModal';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  BookOpen,
  Layers,
  X,
  Eye,
  CheckCircle2,
  FolderTree,
  ArrowRight,
  Sparkles,
  FileText,
  PlayCircle,
  HelpCircle,
  ShoppingCart
} from 'lucide-react';

interface NotesPageProps {
  onSelectNote: (note: Note) => void;
  onBuyNow?: (note: Note) => void;
  onBuyNote?: (note: Note) => void;
  onBuyChapter?: (chapter: Chapter) => void;
  onViewGroup?: (groupId: string) => void;
  initialSubject?: string;
  initialSearch?: string;
  initialBrowseMode?: 'chapters' | 'groups' | 'notes';
}

export const NotesPage: React.FC<NotesPageProps> = ({
  onSelectNote,
  onBuyNow,
  onBuyNote,
  onBuyChapter,
  onViewGroup,
  initialSubject,
  initialSearch = '',
  initialBrowseMode = 'chapters',
}) => {
  const { user } = useAuth();
  const handleBuy = onBuyNow || onBuyNote || onSelectNote;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<'chapters' | 'groups' | 'notes'>(initialBrowseMode);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<'all' | 'school' | 'college'>('all');
  const [selectedMedium, setSelectedMedium] = useState<string>('all');
  const [selectedCourseOrClass, setSelectedCourseOrClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'All');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [dbRefreshKey, setDbRefreshKey] = useState(0);

  // Modal viewer state for interactive chapter learning
  const [activeChapterForViewer, setActiveChapterForViewer] = useState<Chapter | null>(null);

  // Sync tab if initialBrowseMode changes
  useEffect(() => {
    if (initialBrowseMode) {
      setActiveTab(initialBrowseMode);
    }
  }, [initialBrowseMode]);

  // Background fetch to ensure Firestore data is up to date
  useEffect(() => {
    let isMounted = true;
    AdminService.fetchGroups().then(() => {
      if (isMounted) setDbRefreshKey(k => k + 1);
    }).catch(() => {});
    AdminService.fetchChapters().then(() => {
      if (isMounted) setDbRefreshKey(k => k + 1);
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch data from single source of truth
  const chapters = useMemo(() => {
    return NoteNestDB.getChapters().filter(c => c.published !== false);
  }, [dbRefreshKey]);

  const notes = useMemo(() => {
    return NoteNestDB.getNotes().filter(n => n.published !== false);
  }, [dbRefreshKey]);

  const academicSettings = useMemo(() => {
    return NoteNestDB.getAcademicSettings();
  }, [dbRefreshKey]);

  const allGroups = useMemo(() => {
    return NoteNestDB.getGroups();
  }, [dbRefreshKey]);

  // Filter ONLY active groups for students (Requirement 7)
  const activeGroups = useMemo(() => {
    return allGroups.filter(g => g.active !== false);
  }, [allGroups]);

  // Dynamic available classes/courses based on selected education level
  const availableClassesOrCourses = useMemo(() => {
    if (selectedEducationLevel === 'school') {
      return academicSettings.schoolClasses || ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
    }
    if (selectedEducationLevel === 'college') {
      return academicSettings.collegeCourses || ['B.Com', 'B.A.', 'B.Sc.'];
    }
    return [
      ...(academicSettings.schoolClasses || ['Class 9', 'Class 10', 'Class 11', 'Class 12']),
      ...(academicSettings.collegeCourses || ['B.Com', 'B.A.', 'B.Sc.'])
    ];
  }, [selectedEducationLevel, academicSettings]);

  // Dynamic available subjects
  const availableSubjects = useMemo(() => {
    const subjectsFromChapters = chapters.map(c => c.subject);
    const subjectsFromNotes = notes.map(n => n.subject);
    const subjectsFromGroups = activeGroups.map(g => g.subject);
    const combined = Array.from(new Set([...subjectsFromChapters, ...subjectsFromNotes, ...subjectsFromGroups])).filter(Boolean);
    return ['All', ...combined];
  }, [chapters, notes, activeGroups]);

  // Available groups matching current dropdown filters (for chapter filter dropdown)
  const availableGroupsForChapters = useMemo(() => {
    return activeGroups.filter(grp => {
      if (selectedEducationLevel !== 'all' && grp.educationLevel.toLowerCase() !== selectedEducationLevel.toLowerCase()) return false;
      if (selectedCourseOrClass !== 'all' && grp.classOrCourse !== selectedCourseOrClass) return false;
      if (selectedMedium !== 'all' && grp.medium.toLowerCase() !== selectedMedium.toLowerCase()) return false;
      if (selectedSubject !== 'All' && grp.subject !== selectedSubject) return false;
      return true;
    });
  }, [activeGroups, selectedEducationLevel, selectedCourseOrClass, selectedMedium, selectedSubject]);

  // Calculate chapter count dynamically for a group based on stored chapter references (Requirement 6)
  const getGroupChapterCount = (grp: Group): number => {
    const publishedMap = new Map(chapters.map(c => [c.id, c]));
    const ids = (grp.chapterOrder && grp.chapterOrder.length > 0)
      ? grp.chapterOrder
      : (grp.chapterIds || []);

    const seen = new Set<string>();
    let count = 0;
    for (const id of ids) {
      if (!seen.has(id) && publishedMap.has(id)) {
        seen.add(id);
        count++;
      }
    }
    // Fallback if chapterIds was not yet set on a legacy group
    if (count === 0 && (!grp.chapterIds || grp.chapterIds.length === 0)) {
      count = chapters.filter(c => c.groupId === grp.id || c.groupId === grp.groupId).length;
    }
    return count;
  };

  // Filtered ACTIVE Groups for the Groups Tab (Requirement 8)
  const filteredActiveGroups = useMemo(() => {
    return activeGroups.filter(grp => {
      // Level filter
      if (selectedEducationLevel !== 'all' && grp.educationLevel.toLowerCase() !== selectedEducationLevel.toLowerCase()) {
        return false;
      }
      // Class / Course filter
      if (selectedCourseOrClass !== 'all' && grp.classOrCourse !== selectedCourseOrClass) {
        return false;
      }
      // Medium filter
      if (selectedMedium !== 'all' && grp.medium.toLowerCase() !== selectedMedium.toLowerCase()) {
        return false;
      }
      // Subject filter
      if (selectedSubject !== 'All' && grp.subject !== selectedSubject) {
        return false;
      }
      // Search query filter (matches groupName, subject, class/course, medium, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = grp.groupName.toLowerCase().includes(q);
        const matchesSubj = grp.subject.toLowerCase().includes(q);
        const matchesClass = grp.classOrCourse.toLowerCase().includes(q);
        const matchesMed = grp.medium.toLowerCase().includes(q);
        const matchesDesc = (grp.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSubj && !matchesClass && !matchesMed && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [activeGroups, selectedEducationLevel, selectedCourseOrClass, selectedMedium, selectedSubject, searchQuery]);

  // Filtered Chapters for All Chapters Tab
  const filteredChapters = useMemo(() => {
    return chapters.filter(chap => {
      // Level filter
      if (selectedEducationLevel !== 'all' && chap.educationLevel !== selectedEducationLevel) {
        return false;
      }
      // Medium filter
      if (selectedMedium !== 'all' && chap.medium.toLowerCase() !== selectedMedium.toLowerCase()) {
        return false;
      }
      // Class/Course filter
      if (selectedCourseOrClass !== 'all' && chap.classOrCourse !== selectedCourseOrClass) {
        return false;
      }
      // Subject filter
      if (selectedSubject !== 'All' && chap.subject !== selectedSubject) {
        return false;
      }
      // Group filter
      if (selectedGroupId !== 'all') {
        if (selectedGroupId === '__none__') {
          const isAssigned = (chap.groupId && activeGroups.some(g => g.id === chap.groupId)) ||
            activeGroups.some(g => g.chapterIds?.includes(chap.id));
          if (isAssigned) return false;
        } else {
          const targetGrp = activeGroups.find(g => g.id === selectedGroupId);
          const inChapterIds = targetGrp?.chapterIds?.includes(chap.id);
          if (chap.groupId !== selectedGroupId && !inChapterIds) {
            return false;
          }
        }
      }
      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = chap.title.toLowerCase().includes(q);
        const matchesSubject = chap.subject.toLowerCase().includes(q);
        const matchesClass = chap.classOrCourse.toLowerCase().includes(q);
        const matchesDesc = (chap.description || '').toLowerCase().includes(q);
        const matchesMedium = chap.medium.toLowerCase().includes(q);
        const matchesTopic = (chap.topics || []).some(t => t.topicName.toLowerCase().includes(q));

        if (!matchesTitle && !matchesSubject && !matchesClass && !matchesDesc && !matchesMedium && !matchesTopic) {
          return false;
        }
      }
      return true;
    });
  }, [chapters, activeGroups, selectedEducationLevel, selectedMedium, selectedCourseOrClass, selectedSubject, selectedGroupId, searchQuery]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Course/Class match
      if (selectedCourseOrClass !== 'all' && note.course !== selectedCourseOrClass) {
        return false;
      }
      // Subject match
      if (selectedSubject !== 'All' && note.subject !== selectedSubject) {
        return false;
      }
      // Search Query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesSubject = note.subject.toLowerCase().includes(query);
        const matchesUnit = note.unit.toLowerCase().includes(query);
        const matchesCourse = note.course.toLowerCase().includes(query);
        const matchesDesc = note.description.toLowerCase().includes(query);

        if (!matchesTitle && !matchesSubject && !matchesUnit && !matchesCourse && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [notes, selectedCourseOrClass, selectedSubject, searchQuery]);

  const handleViewGroup = (groupId: string) => {
    if (onViewGroup) {
      onViewGroup(groupId);
    } else {
      window.location.hash = `groups/${groupId}`;
    }
  };

  // Helper to render an individual chapter card
  const renderChapterCard = (chapter: Chapter) => {
    const isPremium = chapter.accessType === 'premium';
    const offerPrice = typeof chapter.offerPrice === 'number' && !isNaN(chapter.offerPrice)
      ? chapter.offerPrice
      : (typeof chapter.price === 'number' && !isNaN(chapter.price) && chapter.price > 0
          ? chapter.price
          : (isPremium ? 30 : 10));
    const originalPrice = typeof chapter.originalPrice === 'number' && !isNaN(chapter.originalPrice)
      ? chapter.originalPrice
      : (isPremium ? 50 : 20);
    const hasDiscount = originalPrice > offerPrice;
    const isPurchased = user?.uid ? NoteNestDB.hasCustomerPurchasedChapter(user.uid, chapter.id) : false;
    const assignedGroup = chapter.groupId ? activeGroups.find(g => g.id === chapter.groupId) : undefined;

    return (
      <div
        key={chapter.id}
        className={`bg-white rounded-2xl border transition-all p-6 flex flex-col justify-between group ${
          isPremium
            ? 'border-amber-200/90 shadow-xs hover:shadow-md hover:border-amber-300'
            : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-900/30'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPremium ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  <span>👑</span> Premium
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  Normal
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-950 border border-blue-100 uppercase tracking-wider">
                {chapter.classOrCourse}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {chapter.medium}
              </span>
              {assignedGroup && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200" title={`Group ${assignedGroup.order}: ${assignedGroup.groupName}`}>
                  <Layers className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Grp {assignedGroup.order}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                {chapter.subject}
              </span>
              <div className="flex items-baseline gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {hasDiscount && (
                  <span className="text-[10px] text-slate-400 line-through">
                    ₹{originalPrice}
                  </span>
                )}
                <span className="text-xs font-black text-slate-900">
                  ₹{offerPrice}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
              {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : ''}{chapter.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {chapter.description || (isPremium
                ? 'Comprehensive premium unit coverage with interactive lecture videos, slides, flashcards, and quizzes.'
                : 'Standard academic curriculum unit notes with full PDF reading materials.')}
            </p>
          </div>

          {/* Topics preview list */}
          {chapter.topics && chapter.topics.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {chapter.topics.length} Unit Topics:
              </span>
              <div className="flex flex-wrap gap-1">
                {chapter.topics.slice(0, 3).map((t, idx) => (
                  <span
                    key={t.id || idx}
                    className="px-2 py-0.5 rounded bg-slate-50 text-[11px] text-slate-600 font-medium border border-slate-100"
                  >
                    {t.topicName}
                  </span>
                ))}
                {chapter.topics.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-bold">
                    +{chapter.topics.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resource Badges and Action Button */}
        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-semibold text-[11px] text-slate-600" title="PDF Notes">
              <FileText className="w-3.5 h-3.5 text-blue-800" />
              <span>PDF</span>
            </span>
            {isPremium && (
              <>
                <span className="flex items-center gap-1 font-semibold text-[11px] text-slate-600" title="Video Overview">
                  <PlayCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Video</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-[11px] text-slate-600" title="Topic Quizzes">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Quiz</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPurchased ? (
              <button
                onClick={() => setActiveChapterForViewer(chapter)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unlocked • Open</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveChapterForViewer(chapter)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Explore</span>
                </button>
                {onBuyChapter && (
                  <button
                    onClick={() => onBuyChapter(chapter)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isPremium
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                        : 'bg-blue-950 hover:bg-blue-900 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Buy (₹{offerPrice})</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper to render an individual group card (Requirement 2: Compact, clean, and contains ONLY required info)
  const renderGroupCard = (group: Group) => {
    const chapterCount = getGroupChapterCount(group);

    return (
      <div
        key={group.id}
        className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-900/40 p-6 flex flex-col justify-between transition-all shadow-xs hover:shadow-md group"
      >
        <div className="space-y-3">
          {/* Metadata chips */}
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-950 border border-blue-100 uppercase tracking-wider">
              {group.classOrCourse}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
              {group.subject}
            </span>
          </div>

          {/* Group Name & Subtitle */}
          <div>
            <h3
              onClick={() => handleViewGroup(group.id)}
              className="text-lg font-black text-slate-900 group-hover:text-blue-900 transition-colors cursor-pointer flex items-center gap-2"
            >
              <span className="text-blue-950 shrink-0">📂</span>
              <span className="line-clamp-2">{group.groupName}</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
              <span>{group.medium}</span>
              {group.semester && group.semester !== 'N/A' && (
                <>
                  <span>•</span>
                  <span>{group.semester}</span>
                </>
              )}
            </div>
          </div>

          {/* Chapter count badge */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}</span>
            </span>
          </div>
        </div>

        {/* View Group button */}
        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => handleViewGroup(group.id)}
            className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer group-hover:gap-2"
          >
            <span>View Group</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Academic Library & Syllabus Units</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Curriculum Notes & Chapter Learning
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Explore school (Classes 9–12) & college study materials, multi-lingual notes (Assamese, English, Bangla, Hindi), and interactive unit lectures.
            </p>
          </div>

          {/* Top-Level Navigation Switcher (Requirement 1: 📚 All Chapters vs 📂 Groups) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs self-start md:self-auto shadow-xs">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chapters'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <span className="text-base">📚</span>
              <span>All Chapters</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                {filteredChapters.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <span className="text-base">📂</span>
              <span>Groups</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-extrabold">
                {filteredActiveGroups.length}
              </span>
            </button>

            {filteredNotes.length > 0 && (
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>PDF Study Packs</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                  {filteredNotes.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Requirement 8: Search/Filter improvements for Chapters vs Groups) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        {/* Search Input Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'groups'
                ? "Search syllabus groups by name, subject, class, or medium (e.g. Science, B.Com, Assamese)..."
                : "Search by Chapter, Topic, or Subject (e.g. Acid Bases, Real Numbers, Economics)..."
            }
            className="w-full pl-10 pr-10 py-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10 text-sm font-medium outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeTab === 'chapters' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 pt-1`}>
          {/* Education Level */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Education Level
            </label>
            <select
              value={selectedEducationLevel}
              onChange={(e) => {
                setSelectedEducationLevel(e.target.value as any);
                setSelectedCourseOrClass('all');
              }}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-900"
            >
              <option value="all">All Levels (School & College)</option>
              <option value="school">School (Classes 9, 10, 11, 12)</option>
              <option value="college">College (B.Com, B.A., B.Sc.)</option>
            </select>
          </div>

          {/* Class / Course */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Class / Course
            </label>
            <select
              value={selectedCourseOrClass}
              onChange={(e) => setSelectedCourseOrClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-900"
            >
              <option value="all">All Classes / Courses</option>
              {availableClassesOrCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Medium */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Language Medium
            </label>
            <select
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-900"
            >
              <option value="all">All Mediums</option>
              <option value="Assamese">Assamese (অসমীয়া)</option>
              <option value="English">English</option>
              <option value="Bangla">Bangla (বাংলা)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedGroupId('all');
              }}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-900"
            >
              {availableSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Syllabus Group Filter — ONLY shown when browsing All Chapters (Requirement 8) */}
          {activeTab === 'chapters' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                <span>Syllabus Group</span>
                {selectedGroupId !== 'all' && (
                  <span className="text-[10px] text-emerald-700 font-bold">Filtered</span>
                )}
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-900"
              >
                <option value="all">All Groups ({availableGroupsForChapters.length})</option>
                {availableGroupsForChapters.map((g) => (
                  <option key={g.id} value={g.id}>
                    Group {g.order}: {g.groupName}
                  </option>
                ))}
                <option value="__none__">Unassigned (No Group)</option>
              </select>
            </div>
          )}
        </div>

        {/* Active Filter Chips & Clear Option */}
        {(selectedEducationLevel !== 'all' || selectedMedium !== 'all' || selectedCourseOrClass !== 'all' || selectedSubject !== 'All' || (activeTab === 'chapters' && selectedGroupId !== 'all') || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-bold">Active Filters:</span>
              {selectedEducationLevel !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-bold capitalize">
                  Level: {selectedEducationLevel}
                </span>
              )}
              {selectedCourseOrClass !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold">
                  Class: {selectedCourseOrClass}
                </span>
              )}
              {selectedMedium !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold">
                  Medium: {selectedMedium}
                </span>
              )}
              {selectedSubject !== 'All' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold">
                  Subject: {selectedSubject}
                </span>
              )}
              {activeTab === 'chapters' && selectedGroupId !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Group: {activeGroups.find(g => g.id === selectedGroupId)?.groupName || 'Unassigned'}</span>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedEducationLevel('all');
                setSelectedCourseOrClass('all');
                setSelectedMedium('all');
                setSelectedSubject('All');
                setSelectedGroupId('all');
                setSearchQuery('');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}

      {/* 1. GROUPS VIEW (Requirement 2: Clean list/grid of GROUPS only) */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/80">
            <div>
              <span>Showing <strong className="text-slate-900">{filteredActiveGroups.length}</strong> Active Syllabus Groups</span>
            </div>
            <span className="text-slate-400">Click any group to explore its chapters in structured syllabus sequence</span>
          </div>

          {filteredActiveGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActiveGroups.map(renderGroupCard)}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <FolderTree className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No syllabus groups found</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
                No active syllabus groups match your selected filters. Try switching filters or browsing all chapters.
              </p>
              <button
                onClick={() => {
                  setSelectedEducationLevel('all');
                  setSelectedCourseOrClass('all');
                  setSelectedMedium('all');
                  setSelectedSubject('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. ALL CHAPTERS VIEW (Requirement 1: Clean chapter browsing experience) */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/80">
            <div>
              <span>Showing <strong className="text-slate-900">{filteredChapters.length}</strong> Curriculum Chapters</span>
            </div>
            <span className="text-slate-400">Individual unit access • Normal & Premium editions</span>
          </div>

          {filteredChapters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChapters.map(renderChapterCard)}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No interactive chapters found</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
                Try selecting &ldquo;All Mediums&rdquo; or clearing search filters to see all available school and college subjects.
              </p>
              <button
                onClick={() => {
                  setSelectedEducationLevel('all');
                  setSelectedCourseOrClass('all');
                  setSelectedMedium('all');
                  setSelectedSubject('All');
                  setSelectedGroupId('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. PDF STUDY PACKS VIEW */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong className="text-slate-900">{filteredNotes.length}</strong> PDF Notes Packs</span>
            <span className="text-slate-400">Complete curriculum bundles with instant preview & download</span>
          </div>

          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onSelect={onSelectNote}
                  onBuyNow={handleBuy}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No PDF study packs found</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
                We couldn&apos;t find any note packs matching your active filters. Try checking the chapter library or reset filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCourseOrClass('all');
                  setSelectedSubject('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Chapter Content Viewer Modal */}
      {activeChapterForViewer && (
        <ChapterContentViewerModal
          chapter={activeChapterForViewer}
          user={user}
          onClose={() => setActiveChapterForViewer(null)}
          onBuyChapter={(ch) => {
            setActiveChapterForViewer(null);
            if (onBuyChapter) onBuyChapter(ch);
          }}
        />
      )}
    </div>
  );
};
