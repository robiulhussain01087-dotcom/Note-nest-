import React, { useState, useMemo, useEffect } from 'react';
import { Group, Chapter, AcademicSettings } from '../../types';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  MoveUp,
  MoveDown,
  BookOpen,
  Crown,
  FileText,
  AlertCircle,
  FolderPlus,
  RefreshCw
} from 'lucide-react';

interface AdminGroupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (groupData: Partial<Group>, selectedChapterIds: string[]) => Promise<void>;
  onSaveGroup?: (groupData: Partial<Group>, selectedChapterIds: string[]) => Promise<void>;
  editingGroup: Group | null;
  chapters: Chapter[];
  groups: Group[];
  academicSettings: AcademicSettings;
  presetFilters?: {
    educationLevel?: string;
    classOrCourse?: string;
    medium?: string;
    subject?: string;
  };
}

export const AdminGroupWizardModal: React.FC<AdminGroupWizardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveGroup,
  editingGroup,
  chapters,
  groups,
  academicSettings,
  presetFilters
}) => {
  // Step: 1 = 'select-chapters', 2 = 'group-details'
  const [currentStep, setCurrentStep] = useState<'select-chapters' | 'group-details'>(
    editingGroup ? 'group-details' : 'select-chapters'
  );

  // Selected chapters list (in ordered sequence)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);

  // Step 1: Chapter filters
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [mediumFilter, setMediumFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [chapterSearch, setChapterSearch] = useState('');

  // Step 2: Group Information Form Fields
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [educationLevel, setEducationLevel] = useState<'School' | 'College'>('School');
  const [classOrCourse, setClassOrCourse] = useState('Class 10');
  const [medium, setMedium] = useState('Assamese');
  const [semester, setSemester] = useState('N/A');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize state when modal opens or editingGroup changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingGroup) {
      // Editing existing group
      const existingIds = editingGroup.chapterOrder && editingGroup.chapterOrder.length > 0
        ? editingGroup.chapterOrder
        : (editingGroup.chapterIds || chapters.filter(c => c.groupId === editingGroup.id).map(c => c.id));

      setSelectedChapterIds(existingIds);
      setGroupName(editingGroup.groupName || '');
      setDescription(editingGroup.description || '');
      setEducationLevel((editingGroup.educationLevel as any) || 'School');
      setClassOrCourse(editingGroup.classOrCourse || 'Class 10');
      setMedium(editingGroup.medium || 'Assamese');
      setSemester(editingGroup.semester || 'N/A');

      const availableSubs = academicSettings.subjects[editingGroup.classOrCourse] || [];
      if (availableSubs.includes(editingGroup.subject)) {
        setSubject(editingGroup.subject);
        setCustomSubject('');
      } else {
        setSubject('__custom__');
        setCustomSubject(editingGroup.subject || '');
      }

      setOrder(Number(editingGroup.order) || 1);
      setActive(editingGroup.active !== false);
      setCurrentStep('group-details');
    } else {
      // Creating a new group - starts at Step 1: Select Chapters
      setSelectedChapterIds([]);
      setGroupName('');
      setDescription('');

      const edLevel = (presetFilters?.educationLevel as 'School' | 'College') || 'School';
      setEducationLevel(edLevel);
      setLevelFilter(presetFilters?.educationLevel || 'all');

      const defaultClass = edLevel === 'School'
        ? (academicSettings.schoolClasses[0] || 'Class 10')
        : (academicSettings.collegeCourses[0] || 'B.Com');
      const cls = presetFilters?.classOrCourse || defaultClass;
      setClassOrCourse(cls);
      setClassFilter(presetFilters?.classOrCourse || 'all');

      const med = presetFilters?.medium || 'Assamese';
      setMedium(med);
      setMediumFilter(presetFilters?.medium || 'all');

      setSemester(edLevel === 'College' ? '1st Semester' : 'N/A');

      const availableSubs = academicSettings.subjects[cls] || [];
      const sub = presetFilters?.subject || availableSubs[0] || 'General Science';
      setSubject(sub);
      setSubjectFilter(presetFilters?.subject || 'all');
      setCustomSubject('');

      setOrder(groups.length + 1);
      setActive(true);
      setCurrentStep('select-chapters');
    }
    setFormError(null);
  }, [isOpen, editingGroup]);

  // Dynamic available classes for Step 1 filter
  const availableClasses = useMemo(() => {
    if (levelFilter === 'School') return academicSettings.schoolClasses;
    if (levelFilter === 'College') return academicSettings.collegeCourses;
    return [...academicSettings.schoolClasses, ...academicSettings.collegeCourses];
  }, [levelFilter, academicSettings]);

  // Dynamic available subjects for Step 1 filter
  const availableSubjectsForFilter = useMemo(() => {
    const subs = new Set<string>();
    chapters.forEach(c => {
      if (levelFilter === 'all' || c.educationLevel === levelFilter) {
        if (classFilter === 'all' || c.classOrCourse === classFilter) {
          subs.add(c.subject);
        }
      }
    });
    return Array.from(subs);
  }, [chapters, levelFilter, classFilter]);

  // Filtered chapters for Step 1: Selection list
  const filteredChapters = useMemo(() => {
    return chapters.filter(c => {
      if (levelFilter !== 'all' && c.educationLevel !== levelFilter) return false;
      if (classFilter !== 'all' && c.classOrCourse !== classFilter) return false;
      if (mediumFilter !== 'all' && c.medium !== mediumFilter) return false;
      if (subjectFilter !== 'all' && c.subject !== subjectFilter) return false;

      if (chapterSearch.trim()) {
        const q = chapterSearch.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesNum = (c.chapterNumber || '').toLowerCase().includes(q);
        const matchesSub = c.subject.toLowerCase().includes(q);
        const matchesClass = c.classOrCourse.toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesNum && !matchesSub && !matchesClass && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [chapters, levelFilter, classFilter, mediumFilter, subjectFilter, chapterSearch]);

  // Toggle selection for a chapter
  const handleToggleChapter = (chapterId: string) => {
    setSelectedChapterIds(prev => {
      if (prev.includes(chapterId)) {
        return prev.filter(id => id !== chapterId);
      } else {
        return [...prev, chapterId];
      }
    });
  };

  // Bulk select / deselect
  const handleSelectAllVisible = () => {
    const visibleIds = filteredChapters.map(c => c.id);
    setSelectedChapterIds(prev => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleDeselectAll = () => {
    setSelectedChapterIds([]);
  };

  // Move chapter up in playlist order
  const handleMoveChapterUp = (index: number) => {
    if (index === 0) return;
    setSelectedChapterIds(prev => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move chapter down in playlist order
  const handleMoveChapterDown = (index: number) => {
    if (index >= selectedChapterIds.length - 1) return;
    setSelectedChapterIds(prev => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Remove chapter from playlist
  const handleRemoveChapter = (chapterId: string) => {
    setSelectedChapterIds(prev => prev.filter(id => id !== chapterId));
  };

  // Step 1 -> Step 2 transition with intelligent auto-fill from selected chapters
  const handleProceedToStep2 = () => {
    if (selectedChapterIds.length === 0) {
      setFormError('Please select at least one chapter before continuing to Group Details.');
      return;
    }
    setFormError(null);

    if (selectedChapterIds.length > 0 && !editingGroup) {
      // Infer academic fields from selected chapters if possible
      const firstSelected = chapters.find(c => c.id === selectedChapterIds[0]);
      if (firstSelected) {
        setEducationLevel((firstSelected.educationLevel as any) || 'School');
        setClassOrCourse(firstSelected.classOrCourse);
        setMedium(firstSelected.medium);
        setSemester(firstSelected.semester || 'N/A');
        setSubject(firstSelected.subject);
        setCustomSubject('');
      }
    }
    setCurrentStep('group-details');
  };

  // Save Group
  const handleSaveGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const finalName = groupName.trim();
    if (!finalName) {
      setFormError('Group Name is required. Please enter a descriptive name.');
      return;
    }

    // Ensure at least one chapter is selected & remove duplicates
    const uniqueChapterIds: string[] = Array.from(new Set<string>(selectedChapterIds.filter(id => Boolean(id))));
    if (uniqueChapterIds.length === 0) {
      setFormError('At least one chapter must be selected for this group. Please go back to Step 1 to select chapters.');
      return;
    }

    const finalSubject = subject === '__custom__' ? customSubject.trim() : subject.trim();
    if (!finalSubject) {
      setFormError('Subject is required. Please select or enter a subject.');
      return;
    }

    const saveHandler = onSave || onSaveGroup;
    if (typeof saveHandler !== 'function') {
      setFormError('Save handler is not configured. Please refresh and try again.');
      return;
    }

    setSaving(true);
    try {
      const groupData: Partial<Group> = {
        groupName: finalName,
        description: description.trim(),
        educationLevel,
        classOrCourse,
        medium,
        semester: educationLevel === 'College' ? semester : 'N/A',
        subject: finalSubject,
        order: Number(order) || 1,
        active,
        chapterIds: uniqueChapterIds,
        chapterOrder: uniqueChapterIds
      };

      await saveHandler(groupData, uniqueChapterIds);
      onClose();
    } catch (err: any) {
      console.error('[AdminGroupWizardModal] Error saving group:', err);
      setFormError(err?.message || 'Failed to save group. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header & Step Indicator */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {editingGroup ? 'Edit Syllabus Group' : 'Add New Syllabus Group'}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentStep === 'select-chapters'
                    ? 'Step 1 of 2: Select existing chapters from Firestore'
                    : 'Step 2 of 2: Enter Group Information & Review Playlist Order'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep('select-chapters')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                currentStep === 'select-chapters'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep === 'select-chapters' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
              }`}>
                1
              </span>
              <span>1. Select Chapters ({selectedChapterIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToStep2}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                currentStep === 'group-details'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep === 'group-details' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
              }`}>
                2
              </span>
              <span>2. Group Information</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-6">
          {formError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: SELECT CHAPTERS */}
          {/* ========================================================================= */}
          {currentStep === 'select-chapters' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>SELECT CHAPTERS FOR GROUP</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedChapterIds.length} {selectedChapterIds.length === 1 ? 'Chapter Selected' : 'Chapters Selected'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select existing chapters from Firestore. Selected chapters will form this group's playlist without duplicating files or prices.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    Select All Visible ({filteredChapters.length})
                  </button>
                  {selectedChapterIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      Deselect All
                    </button>
                  )}
                </div>
              </div>

              {/* Filters for finding chapters */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Level */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Education Level
                    </label>
                    <select
                      value={levelFilter}
                      onChange={(e) => {
                        setLevelFilter(e.target.value);
                        setClassFilter('all');
                        setSubjectFilter('all');
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="School">School</option>
                      <option value="College">College</option>
                    </select>
                  </div>

                  {/* Class / Course */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Class / Course
                    </label>
                    <select
                      value={classFilter}
                      onChange={(e) => {
                        setClassFilter(e.target.value);
                        setSubjectFilter('all');
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Classes/Courses</option>
                      {availableClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Medium */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Medium
                    </label>
                    <select
                      value={mediumFilter}
                      onChange={(e) => setMediumFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Mediums</option>
                      {academicSettings.mediums.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Subject
                    </label>
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Subjects</option>
                      {availableSubjectsForFilter.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    placeholder="Search by chapter number, title, or keywords..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Chapters Checklist */}
              <div className="space-y-2">
                <div className="text-xs text-slate-400 flex items-center justify-between font-semibold px-1">
                  <span>Available Chapters ({filteredChapters.length})</span>
                  <span>Click checkbox or card to toggle</span>
                </div>

                {filteredChapters.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No chapters found matching current filters</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting the filters or clear the search input</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
                    {filteredChapters.map(chap => {
                      const isSelected = selectedChapterIds.includes(chap.id);
                      const isPremium = chap.accessType === 'premium';
                      const currentGroup = chap.groupId
                        ? groups.find(g => g.id === chap.groupId)
                        : undefined;
                      const isAssignedToOtherGroup = currentGroup && (!editingGroup || currentGroup.id !== editingGroup.id);

                      return (
                        <div
                          key={chap.id}
                          onClick={() => handleToggleChapter(chap.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500/60 shadow-xs'
                              : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black'
                                : 'border-slate-700 bg-slate-900 text-transparent'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-xs text-white">
                                  {chap.chapterNumber ? `Chapter ${chap.chapterNumber} — ` : ''}{chap.title}
                                </span>
                                {isPremium ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    👑 Premium
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                                    Normal
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                                <span className="text-emerald-400 font-bold">{chap.subject}</span>
                                <span>•</span>
                                <span>{chap.classOrCourse}</span>
                                <span>•</span>
                                <span>{chap.medium}</span>
                                <span>•</span>
                                <span className="text-slate-200 font-bold">₹{chap.offerPrice ?? chap.price}</span>

                                {isAssignedToOtherGroup && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                                    In: {currentGroup.groupName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className={`text-[11px] font-extrabold px-2 py-1 rounded-xl ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-500'
                            }`}>
                              {isSelected ? 'Selected' : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: GROUP INFORMATION */}
          {/* ========================================================================= */}
          {currentStep === 'group-details' && (
            <form onSubmit={handleSaveGroup} className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>GROUP DETAILS</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (Define the group playlist information)
                  </span>
                </h3>

                {/* Group Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Group Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Accounting Basics or Real Numbers & Polynomials"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Give this group a concise, descriptive name that describes its chapter collection.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Group Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of chapters and syllabus covered in this group..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                {/* Academic Alignment Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  {/* Education Level */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => {
                        const lvl = e.target.value as 'School' | 'College';
                        setEducationLevel(lvl);
                        if (lvl === 'School') {
                          setClassOrCourse(academicSettings.schoolClasses[0] || 'Class 10');
                          setSemester('N/A');
                        } else {
                          setClassOrCourse(academicSettings.collegeCourses[0] || 'B.Com');
                          setSemester('1st Semester');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="School">School (Classes 9–12)</option>
                      <option value="College">College (B.Com, B.A., B.Sc.)</option>
                    </select>
                  </div>

                  {/* Class / Course */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Class / Course
                    </label>
                    <select
                      value={classOrCourse}
                      onChange={(e) => setClassOrCourse(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {(educationLevel === 'School' ? academicSettings.schoolClasses : academicSettings.collegeCourses).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Medium */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Medium
                    </label>
                    <select
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {academicSettings.mediums.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester (if College) */}
                  {educationLevel === 'College' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {academicSettings.semesters.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Subject */}
                  <div className={educationLevel === 'School' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Subject <span className="text-emerald-400">*</span>
                    </label>
                    <div className="space-y-1.5">
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {(academicSettings.subjects[classOrCourse] || []).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="__custom__">+ Custom Subject...</option>
                      </select>

                      {subject === '__custom__' && (
                        <input
                          type="text"
                          required
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="Type custom subject name..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Order & Active State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Display Order (Position in Curriculum)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Status (Active / Inactive)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActive(true)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                          active
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        Active (YES)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActive(false)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                          !active
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        Inactive (NO)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Chapters Playlist Review & Order */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <span>GROUP CHAPTERS PLAYLIST</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedChapterIds.length} {selectedChapterIds.length === 1 ? 'Chapter' : 'Chapters'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Use ▲ / ▼ to reorder chapters. Customers will see them in this exact playlist order.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('select-chapters')}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl border border-slate-800 flex items-center gap-1 transition cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Select / Add Chapters</span>
                  </button>
                </div>

                {selectedChapterIds.length === 0 ? (
                  <div className="p-6 text-center bg-slate-900/60 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                    <p className="font-semibold text-slate-300">No chapters selected yet</p>
                    <p className="text-[11px] text-slate-500 mt-1 mb-3">
                      You can create an empty group or select existing chapters now.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('select-chapters')}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Select Chapters</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {selectedChapterIds.map((cId, index) => {
                      const chap = chapters.find(c => c.id === cId);
                      if (!chap) return null;

                      return (
                        <div
                          key={chap.id}
                          className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center font-black text-emerald-400 text-[11px] shrink-0 border border-slate-800">
                              {index + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-bold text-white mr-1.5">
                                {chap.chapterNumber ? `Ch ${chap.chapterNumber} — ` : ''}{chap.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({chap.subject} • ₹{chap.offerPrice ?? chap.price})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveChapterUp(index)}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveChapterDown(index)}
                              disabled={index === selectedChapterIds.length - 1}
                              className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveChapter(chap.id)}
                              className="p-1 text-slate-400 hover:text-red-400 cursor-pointer ml-1"
                              title="Remove from group (chapter will remain intact in Firestore)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep === 'group-details' && (
              <button
                type="button"
                onClick={() => setCurrentStep('select-chapters')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Select Chapters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            {currentStep === 'select-chapters' ? (
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Continue to Group Details ({selectedChapterIds.length} Selected)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveGroup()}
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingGroup ? 'Save Group Changes' : 'Create Group'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
