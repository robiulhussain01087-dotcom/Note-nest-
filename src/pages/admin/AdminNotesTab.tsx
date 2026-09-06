import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminService } from '../../services/adminService';
import { Note, Chapter, AcademicSettings, Group } from '../../types';
import { GoogleDriveViewerModal } from '../../components/GoogleDriveViewerModal';
import { AdminChapterModal } from './AdminChapterModal';
import { ChapterContentViewerModal } from '../../components/ChapterContentViewerModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Check,
  X,
  IndianRupee,
  Layers,
  AlertCircle,
  Link,
  BookOpen,
  RefreshCw,
  Video,
  Presentation,
  Sparkles,
  HelpCircle,
  GraduationCap,
  School,
  Building2,
  CheckCircle2,
  Crown
} from 'lucide-react';

interface AdminNotesTabProps {
  initialOpenUpload?: boolean;
  initialGroupId?: string;
  onNavigateToGroups?: () => void;
}

export const AdminNotesTab: React.FC<AdminNotesTabProps> = ({
  initialOpenUpload = false,
  initialGroupId,
  onNavigateToGroups
}) => {
  const { user } = useAuth();

  // Tab mode: 'chapters' (Multi-Education curriculum) | 'legacy_notes' (Individual Unit Notes)
  const [activeSubTab, setActiveSubTab] = useState<'chapters' | 'legacy_notes'>('chapters');

  // Chapters State
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [academicSettings, setAcademicSettings] = useState<AcademicSettings>({
    educationLevels: ['School', 'College'],
    schoolClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    collegeCourses: ['B.Com', 'B.A.', 'B.Sc.'],
    streams: ['General', 'Science', 'Commerce', 'Arts'],
    mediums: ['Assamese', 'English', 'Bangla', 'Hindi'],
    semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'],
    subjects: {}
  });

  // Legacy Notes State
  const [notes, setNotes] = useState<Note[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters for Chapters
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [mediumFilter, setMediumFilter] = useState<string>('all');
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupFilter, setGroupFilter] = useState<string>(initialGroupId || 'all');

  // Modals
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [previewingChapter, setPreviewingChapter] = useState<Chapter | null>(null);

  // Legacy note modal
  const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(initialOpenUpload);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [previewingLegacyNote, setPreviewingLegacyNote] = useState<Note | null>(null);

  // Legacy note form fields
  const [legacyTitle, setLegacyTitle] = useState('');
  const [legacyCourse, setLegacyCourse] = useState('B.Com');
  const [legacySemester, setLegacySemester] = useState('1st Semester');
  const [legacySubject, setLegacySubject] = useState('');
  const [legacyUnit, setLegacyUnit] = useState('Unit 1');
  const [legacyOfferPrice, setLegacyOfferPrice] = useState(25);
  const [legacyOriginalPrice, setLegacyOriginalPrice] = useState(60);
  const [legacyPages, setLegacyPages] = useState(35);
  const [legacyDescription, setLegacyDescription] = useState('');
  const [legacyPdfUrl, setLegacyPdfUrl] = useState('');
  const [legacyPublished, setLegacyPublished] = useState(true);
  const [legacyFormError, setLegacyFormError] = useState<string | null>(null);
  const [legacySaving, setLegacySaving] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedChapters, fetchedNotes, fetchedSettings, fetchedGroups] = await Promise.all([
        AdminService.fetchChapters(),
        AdminService.fetchNotes(),
        AdminService.fetchAcademicSettings(),
        AdminService.fetchGroups()
      ]);
      setChapters(fetchedChapters);
      setNotes(fetchedNotes);
      setAcademicSettings(fetchedSettings);
      setGroups(fetchedGroups);
    } catch (err) {
      console.error('[AdminNotesTab] Load failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Chapter Handlers
  const handleSaveChapter = async (savedChapter: Chapter) => {
    await AdminService.saveChapter(savedChapter);
    setChapters(prev => {
      const exists = prev.some(c => c.id === savedChapter.id);
      if (exists) {
        return prev.map(c => c.id === savedChapter.id ? savedChapter : c);
      }
      return [savedChapter, ...prev];
    });
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm('Are you sure you want to delete this chapter and all its topics?')) return;
    try {
      await AdminService.deleteChapter(chapterId);
      setChapters(prev => prev.filter(c => c.id !== chapterId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete chapter');
    }
  };

  // Legacy Note Handlers
  const handleSaveLegacyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLegacyFormError(null);
    if (!legacyTitle.trim()) {
      setLegacyFormError('Title is required');
      return;
    }
    if (!legacyPdfUrl.trim()) {
      setLegacyFormError('Google Drive PDF URL is required');
      return;
    }

    setLegacySaving(true);
    try {
      const notePayload: Partial<Note> = {
        title: legacyTitle.trim(),
        course: legacyCourse,
        semester: legacySemester,
        subject: legacySubject.trim() || 'General',
        unit: legacyUnit,
        offerPrice: legacyOfferPrice,
        originalPrice: legacyOriginalPrice,
        pages: legacyPages,
        description: legacyDescription.trim(),
        pdfUrl: legacyPdfUrl.trim(),
        published: legacyPublished
      };

      if (editingNoteId) {
        await AdminService.updateNote(editingNoteId, notePayload);
      } else {
        await AdminService.createNote(notePayload);
      }

      await loadData();
      setIsLegacyModalOpen(false);
      setEditingNoteId(null);
    } catch (err: any) {
      setLegacyFormError(err.message || 'Failed to save note');
    } finally {
      setLegacySaving(false);
    }
  };

  const handleDeleteLegacyNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await AdminService.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  // Filter chapters
  const filteredChapters = chapters.filter(c => {
    if (levelFilter !== 'all' && c.educationLevel !== levelFilter) return false;
    if (classFilter !== 'all' && c.classOrCourse !== classFilter) return false;
    if (mediumFilter !== 'all' && c.medium !== mediumFilter) return false;
    if (groupFilter !== 'all') {
      if (groupFilter === '__none__') {
        if (c.groupId) return false;
      } else if (c.groupId !== groupFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSub = c.subject.toLowerCase().includes(q);
      const matchClass = c.classOrCourse.toLowerCase().includes(q);
      const matchTopics = (c.topics || []).some(t => t.topicName.toLowerCase().includes(q));
      if (!matchTitle && !matchSub && !matchClass && !matchTopics) return false;
    }
    return true;
  });

  // Filter legacy notes
  const filteredLegacyNotes = notes.filter(n => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">Curriculum & Study Materials</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage multi-tier academic content for School (Classes 9–12) and College (B.Com, B.A., B.Sc.) in Assamese, English, Bangla, and Hindi mediums.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700/60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync</span>
          </button>

          {activeSubTab === 'chapters' ? (
            <button
              onClick={() => {
                setEditingChapter(null);
                setIsChapterModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Chapter</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingNoteId(null);
                setLegacyTitle('');
                setLegacySubject('');
                setLegacyPdfUrl('');
                setIsLegacyModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add B.Com Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Switcher: Chapters & Curriculum vs Legacy Unit Notes */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('chapters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'chapters'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Multi-Education Chapters ({chapters.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('legacy_notes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'legacy_notes'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Legacy B.Com Notes ({notes.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CHAPTERS & CURRICULUM VIEW (Multi-Education) */}
      {/* ========================================================================= */}
      {activeSubTab === 'chapters' && (
        <div className="space-y-6">
          {/* Filters & Search Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search chapter title, subject, or topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">All Levels</option>
                {academicSettings.educationLevels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>

              {/* Class/Course Filter */}
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">All Classes / Courses</option>
                {[...academicSettings.schoolClasses, ...academicSettings.collegeCourses].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Medium Filter */}
              <select
                value={mediumFilter}
                onChange={e => setMediumFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-medium"
              >
                <option value="all">All Mediums</option>
                {academicSettings.mediums.map(m => (
                  <option key={m} value={m}>{m} Medium</option>
                ))}
              </select>

              {/* Group Filter */}
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-medium"
              >
                <option value="all">All Groups</option>
                <option value="__none__">Unassigned (No Group)</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.groupName}
                  </option>
                ))}
              </select>

              {onNavigateToGroups && (
                <button
                  onClick={onNavigateToGroups}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Open Groups Tab"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manage Groups</span>
                </button>
              )}
            </div>
          </div>

          {/* Chapters List */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading academic chapters from Firestore...</span>
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="py-16 bg-slate-900 border border-dashed border-slate-800 rounded-3xl text-center p-6">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No chapters match your criteria</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing your search or add a new chapter using the &quot;Add Chapter&quot; button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredChapters.map(chapter => {
                const isSchool = chapter.educationLevel === 'School';
                return (
                  <div
                    key={chapter.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isSchool ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {isSchool ? <School className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                            {chapter.classOrCourse}
                          </span>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {chapter.medium}
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {chapter.stream}
                          </span>

                          {chapter.accessType === 'premium' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                              <span>👑</span>
                              <span>Premium:</span>
                              {(chapter.originalPrice ?? 50) > (chapter.offerPrice ?? chapter.price ?? 30) ? (
                                <span className="flex items-center gap-1">
                                  <span className="line-through text-amber-400/60 font-normal">₹{chapter.originalPrice ?? 50}</span>
                                  <span className="text-amber-300 font-black">₹{chapter.offerPrice ?? chapter.price ?? 30}</span>
                                </span>
                              ) : (
                                <span>₹{chapter.offerPrice ?? chapter.price ?? 30}</span>
                              )}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                              <span>📄</span>
                              <span>Normal:</span>
                              {(chapter.originalPrice ?? 20) > (chapter.offerPrice ?? chapter.price ?? 10) ? (
                                <span className="flex items-center gap-1">
                                  <span className="line-through text-slate-400 font-normal">₹{chapter.originalPrice ?? 20}</span>
                                  <span className="text-emerald-400 font-black">₹{chapter.offerPrice ?? chapter.price ?? 10}</span>
                                </span>
                              ) : (
                                <span>₹{chapter.offerPrice ?? chapter.price ?? 10}</span>
                              )}
                            </span>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${chapter.published ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                          {chapter.published ? 'Live' : 'Draft'}
                        </span>
                      </div>

                      {/* Subject & Group & Title */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                          {chapter.subject} {chapter.semester && chapter.semester !== 'N/A' ? `• ${chapter.semester}` : ''}
                        </span>
                        {chapter.groupId && (
                          <span className="text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-800/60 flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            {groups.find(g => g.id === chapter.groupId)?.groupName || 'Group'}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-white text-base leading-snug group-hover:text-emerald-300 transition-colors">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </h3>

                      {chapter.description && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {chapter.description}
                        </p>
                      )}

                      {/* Content Assets Summary Pills */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800 font-semibold flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-400" />
                          <span>{(chapter.topics || []).length} Topics</span>
                        </span>

                        {(chapter.topics || []).some(t => !!t.pdfUrl) && (
                          <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800 font-semibold flex items-center gap-1">
                            <FileText className="w-3 h-3 text-emerald-400" />
                            <span>PDFs</span>
                          </span>
                        )}

                        {(chapter.topics || []).some(t => !!t.videoUrl) && (
                          <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800 font-semibold flex items-center gap-1">
                            <Video className="w-3 h-3 text-amber-400" />
                            <span>Video</span>
                          </span>
                        )}

                        {(chapter.topics || []).some(t => (t.flashcards || []).length > 0) && (
                          <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Cards</span>
                          </span>
                        )}

                        {(chapter.topics || []).some(t => (t.quiz || []).length > 0) && (
                          <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800 font-semibold flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-indigo-400" />
                            <span>Quiz</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setPreviewingChapter(chapter)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preview</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingChapter(chapter);
                            setIsChapterModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Chapter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LEGACY B.COM NOTES VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'legacy_notes' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search B.Com notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLegacyNotes.map(note => (
              <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold text-emerald-400">{note.course} • {note.semester}</span>
                    <span className="font-bold text-white">₹{note.offerPrice}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{note.title}</h3>
                  <div className="text-xs text-slate-400 mt-1">{note.subject} • {note.unit}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewingLegacyNote(note)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setLegacyTitle(note.title);
                        setLegacyCourse(note.course);
                        setLegacySemester(note.semester);
                        setLegacySubject(note.subject);
                        setLegacyUnit(note.unit);
                        setLegacyOfferPrice(note.offerPrice);
                        setLegacyOriginalPrice(note.originalPrice);
                        setLegacyPages(note.pages);
                        setLegacyDescription(note.description);
                        setLegacyPdfUrl(note.pdfUrl);
                        setLegacyPublished(note.published);
                        setIsLegacyModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLegacyNote(note.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Chapter Modal */}
      {isChapterModalOpen && (
        <AdminChapterModal
          initialChapter={editingChapter}
          academicSettings={academicSettings}
          groups={groups}
          onSave={handleSaveChapter}
          onClose={() => {
            setIsChapterModalOpen(false);
            setEditingChapter(null);
          }}
        />
      )}

      {/* Interactive Chapter Content Previewer */}
      {previewingChapter && (
        <ChapterContentViewerModal
          chapter={previewingChapter}
          user={user}
          onClose={() => setPreviewingChapter(null)}
        />
      )}

      {/* Legacy Drive Viewer Modal */}
      {previewingLegacyNote && (
        <GoogleDriveViewerModal
          note={previewingLegacyNote}
          studentName={user?.name || 'Administrator'}
          studentEmail={user?.email || 'admin@notenest.in'}
          onClose={() => setPreviewingLegacyNote(null)}
        />
      )}

      {/* Legacy Note Create/Edit Modal */}
      {isLegacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">{editingNoteId ? 'Edit B.Com Note' : 'Add B.Com Note'}</h3>
              <button onClick={() => setIsLegacyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLegacyNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={legacyTitle}
                  onChange={e => setLegacyTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={legacySubject}
                    onChange={e => setLegacySubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={legacyUnit}
                    onChange={e => setLegacyUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={legacyOfferPrice}
                    onChange={e => setLegacyOfferPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={legacyOriginalPrice}
                    onChange={e => setLegacyOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Google Drive PDF URL</label>
                <input
                  type="url"
                  value={legacyPdfUrl}
                  onChange={e => setLegacyPdfUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              {legacyFormError && (
                <div className="text-xs text-rose-400">{legacyFormError}</div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLegacyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={legacySaving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  {legacySaving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
