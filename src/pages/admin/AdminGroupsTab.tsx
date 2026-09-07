import React, { useState, useEffect, useMemo } from 'react';
import { Group, Chapter, AcademicSettings } from '../../types';
import { AdminService } from '../../services/adminService';
import { NoteNestDB } from '../../services/db';
import { useCurriculum } from '../../context/CurriculumContext';
import { AdminGroupWizardModal } from './AdminGroupWizardModal';
import { AdminGroupOpenModal } from './AdminGroupOpenModal';
import { AdminAddChaptersModal } from './AdminAddChaptersModal';
import { AdminChapterModal } from './AdminChapterModal';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  FolderPlus,
  MoveUp,
  MoveDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Crown,
  FileText,
  Filter,
  School,
  Building2,
  X
} from 'lucide-react';

interface AdminGroupsTabProps {
  onNavigateToChapters?: (groupId?: string) => void;
}

export const AdminGroupsTab: React.FC<AdminGroupsTabProps> = ({ onNavigateToChapters }) => {
  const [groups, setGroups] = useState<Group[]>([]);
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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [mediumFilter, setMediumFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Wizard Modal state (Add / Edit Group)
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardEditingGroup, setWizardEditingGroup] = useState<Group | null>(null);

  // Group Open Modal state
  const [openModalGroup, setOpenModalGroup] = useState<Group | null>(null);

  // Add Chapters Modal state
  const [addChaptersModalGroup, setAddChaptersModalGroup] = useState<Group | null>(null);

  // Delete modal state
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create new chapter directly in group modal
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [selectedGroupForNewChapter, setSelectedGroupForNewChapter] = useState<Group | null>(null);

  // Real-time Firestore synchronization
  const { groups: realtimeGroups, chapters: realtimeChapters, isLive } = useCurriculum();

  useEffect(() => {
    if (realtimeGroups && realtimeGroups.length > 0) {
      setGroups(realtimeGroups);
    }
  }, [realtimeGroups]);

  useEffect(() => {
    if (realtimeChapters && realtimeChapters.length > 0) {
      setChapters(realtimeChapters);
    }
  }, [realtimeChapters]);

  const loadAll = async () => {
    try {
      const [fetchedGroups, fetchedChapters, fetchedSettings] = await Promise.all([
        AdminService.fetchGroups(),
        AdminService.fetchChapters(),
        AdminService.fetchAcademicSettings()
      ]);
      setGroups(fetchedGroups);
      setChapters(fetchedChapters);
      setAcademicSettings(fetchedSettings);
    } catch (err) {
      console.error('[AdminGroupsTab] Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  // Helper to get chapters in a group's playlist (sorted by chapterOrder)
  const getGroupChapters = (group: Group): Chapter[] => {
    const list = chapters.filter(
      c => c.groupId === group.id || (group.chapterIds && group.chapterIds.includes(c.id))
    );

    if (group.chapterOrder && group.chapterOrder.length > 0) {
      return [...list].sort((a, b) => {
        const idxA = group.chapterOrder!.indexOf(a.id);
        const idxB = group.chapterOrder!.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return (Number(a.chapterNumber) || 0) - (Number(b.chapterNumber) || 0);
      });
    }

    return list.sort((a, b) => (Number(a.chapterNumber) || 0) - (Number(b.chapterNumber) || 0));
  };

  // Open Add Group Wizard
  const handleOpenAddWizard = () => {
    setWizardEditingGroup(null);
    setWizardOpen(true);
  };

  // Open Edit Group Wizard
  const handleOpenEditWizard = (group: Group) => {
    setWizardEditingGroup(group);
    setWizardOpen(true);
  };

  // Save Group from Wizard (Create or Edit)
  const handleSaveGroupFromWizard = async (
    groupData: Partial<Group>,
    selectedChapterIds: string[]
  ) => {
    const isEdit = !!wizardEditingGroup;
    const groupId = wizardEditingGroup?.id || `grp-${Date.now()}`;
    const uniqueChapterIds = Array.from(new Set(selectedChapterIds.filter(Boolean)));

    const newGroup: Group = {
      id: groupId,
      groupId: groupId,
      groupName: (groupData.groupName || '').trim(),
      description: (groupData.description || '').trim(),
      educationLevel: (groupData.educationLevel as any) || 'School',
      classOrCourse: groupData.classOrCourse || 'Class 10',
      medium: groupData.medium || 'Assamese',
      semester: groupData.educationLevel === 'College' ? (groupData.semester || '1st Semester') : 'N/A',
      subject: (groupData.subject || '').trim(),
      order: Number(groupData.order) || (groups.length + 1),
      active: groupData.active !== false,
      chapterIds: uniqueChapterIds,
      chapterOrder: uniqueChapterIds,
      createdAt: wizardEditingGroup?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore and local store
    const result = await AdminService.saveGroup(newGroup);
    if (result && !result.success && result.error) {
      throw new Error(result.error);
    }

    // Update local groups state
    setGroups(prev => {
      const idx = prev.findIndex(g => g.id === groupId);
      let updated: Group[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = newGroup;
      } else {
        updated = [...prev, newGroup];
      }
      return updated.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    });

    // Update local chapters state to reflect new groupId linking
    setChapters(prev =>
      prev.map(c => {
        if (uniqueChapterIds.includes(c.id)) {
          return { ...c, groupId: groupId };
        }
        if (isEdit && c.groupId === groupId && !uniqueChapterIds.includes(c.id)) {
          return { ...c, groupId: undefined };
        }
        return c;
      })
    );

    setWizardOpen(false);

    // Refresh groups list from Firestore in background to maintain synchronization
    loadAll().catch(err => console.warn('[AdminGroupsTab] Background refresh error:', err));
  };

  // Add Chapters to Group from dedicated modal
  const handleAddChaptersToGroup = async (groupId: string, newChapterIds: string[]) => {
    const targetGroup = groups.find(g => g.id === groupId);
    if (!targetGroup) return;

    const existingIds = targetGroup.chapterIds || [];
    const mergedIds = [...existingIds, ...newChapterIds.filter(id => !existingIds.includes(id))];
    const updatedGroup: Group = {
      ...targetGroup,
      chapterIds: mergedIds,
      chapterOrder: mergedIds,
      updatedAt: new Date().toISOString()
    };

    await AdminService.saveGroup(updatedGroup);

    // Update local groups
    setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));

    // Update local chapters
    setChapters(prev =>
      prev.map(c => newChapterIds.includes(c.id) ? { ...c, groupId: groupId } : c)
    );
  };

  // Toggle Active/Inactive status
  const handleToggleActive = async (group: Group) => {
    const updated: Group = {
      ...group,
      active: !group.active,
      updatedAt: new Date().toISOString()
    };
    await AdminService.saveGroup(updated);
    setGroups(prev => prev.map(g => g.id === group.id ? updated : g));
  };

  // Move Group Up/Down in display order
  const handleMoveOrder = async (group: Group, direction: 'up' | 'down') => {
    const sorted = [...groups].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const currentIndex = sorted.findIndex(g => g.id === group.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentGroup = sorted[currentIndex];
    const targetGroup = sorted[targetIndex];

    const tempOrder = currentGroup.order;
    currentGroup.order = targetGroup.order;
    targetGroup.order = tempOrder;

    if (currentGroup.order === targetGroup.order) {
      currentGroup.order = direction === 'up' ? targetGroup.order - 1 : targetGroup.order + 1;
    }

    const reorderedList = sorted.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const normalized = reorderedList.map((g, idx) => ({ ...g, order: idx + 1 }));
    setGroups(normalized);

    const orderUpdates = normalized.map(g => ({ id: g.id, order: g.order }));
    await AdminService.reorderGroups(orderUpdates);
  };

  // Delete Group: SAFE UNLINK ONLY
  // User Prompt: "Deleting a Group must NOT automatically delete its Chapters.
  // The Group relationship is removed. The Chapters remain in Firestore."
  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    setDeleting(true);
    try {
      await AdminService.deleteGroup(groupToDelete.id);

      setGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
      setChapters(prev =>
        prev.map(c => c.groupId === groupToDelete.id ? { ...c, groupId: undefined } : c)
      );

      setGroupToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete group.');
    } finally {
      setDeleting(false);
    }
  };

  // Save new chapter created directly into a group
  const handleSaveChapterFromGroup = async (savedChapter: Chapter) => {
    await AdminService.saveChapter(savedChapter);
    setChapters(prev => {
      const idx = prev.findIndex(c => c.id === savedChapter.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedChapter;
        return next;
      }
      return [savedChapter, ...prev];
    });

    if (savedChapter.groupId) {
      const grp = groups.find(g => g.id === savedChapter.groupId);
      if (grp && !(grp.chapterIds || []).includes(savedChapter.id)) {
        const updatedChapterIds = [...(grp.chapterIds || []), savedChapter.id];
        const updatedGrp = {
          ...grp,
          chapterIds: updatedChapterIds,
          chapterOrder: updatedChapterIds
        };
        await AdminService.saveGroup(updatedGrp);
        setGroups(prev => prev.map(g => g.id === grp.id ? updatedGrp : g));
      }
    }

    setChapterModalOpen(false);
  };

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      if (levelFilter !== 'all' && g.educationLevel !== levelFilter) return false;
      if (classFilter !== 'all' && g.classOrCourse !== classFilter) return false;
      if (mediumFilter !== 'all' && g.medium.toLowerCase() !== mediumFilter.toLowerCase()) return false;
      if (subjectFilter !== 'all' && g.subject !== subjectFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = g.groupName.toLowerCase().includes(q);
        const matchesDesc = (g.description || '').toLowerCase().includes(q);
        const matchesSubject = g.subject.toLowerCase().includes(q);
        const matchesClass = g.classOrCourse.toLowerCase().includes(q);
        const matchesMedium = g.medium.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesSubject && !matchesClass && !matchesMedium) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [groups, levelFilter, classFilter, mediumFilter, subjectFilter, searchQuery]);

  // Dynamic available classes for filter
  const availableClasses = useMemo(() => {
    if (levelFilter === 'School') return academicSettings.schoolClasses;
    if (levelFilter === 'College') return academicSettings.collegeCourses;
    return [...academicSettings.schoolClasses, ...academicSettings.collegeCourses];
  }, [levelFilter, academicSettings]);

  // Dynamic available subjects for filter
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    groups.forEach(g => {
      if (levelFilter === 'all' || g.educationLevel === levelFilter) {
        if (classFilter === 'all' || g.classOrCourse === classFilter) {
          subjects.add(g.subject);
        }
      }
    });
    return Array.from(subjects);
  }, [groups, levelFilter, classFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 sm:p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Manage Groups
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Two-step group workflow: Select existing chapters first, then name and configure the group playlist.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-2xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            title="Refresh groups from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User Requested: "Manage Groups → Add New Group → Select Chapters → Enter Group Name → Create Group" */}
          <button
            onClick={handleOpenAddWizard}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Group</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search Toolbar */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search groups by name, subject, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setClassFilter('all');
                setSubjectFilter('all');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Education Levels</option>
              <option value="School">School (Classes 9–12)</option>
              <option value="College">College (B.Com, B.A., B.Sc.)</option>
            </select>
          </div>

          {/* Class/Course Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setSubjectFilter('all');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Classes / Courses</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Medium Filter */}
          <div>
            <select
              value={mediumFilter}
              onChange={(e) => setMediumFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Mediums</option>
              {academicSettings.mediums.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Subject Filter Pills */}
        {availableSubjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
            <span className="text-[11px] font-bold uppercase text-slate-500 mr-1.5 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Subjects:
            </span>
            <button
              onClick={() => setSubjectFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                subjectFilter === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All
            </button>
            {availableSubjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSubjectFilter(sub)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  subjectFilter === sub
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Groups List */}
      {loading ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-400">Loading syllabus groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Groups Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            {searchQuery || levelFilter !== 'all' || classFilter !== 'all'
              ? 'No groups match your current filter criteria. Try clearing filters or create a new group.'
              : 'Create your first syllabus group using the new 2-step chapter selection workflow.'}
          </p>
          <button
            onClick={handleOpenAddWizard}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Group</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
            <span>Showing {filteredGroups.length} Groups (ordered by playlist hierarchy)</span>
            <span className="hidden sm:inline">Use ▲ / ▼ buttons to adjust customer display order</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredGroups.map((group, index) => {
              const groupChapters = getGroupChapters(group);
              const premiumCount = groupChapters.filter(c => c.accessType === 'premium').length;
              const normalCount = groupChapters.length - premiumCount;

              return (
                <div
                  key={group.id}
                  className={`bg-slate-900/90 hover:bg-slate-900 rounded-3xl border transition p-4 sm:p-5 ${
                    group.active
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-slate-800/60 opacity-75 bg-slate-950/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Reorder controls & Details */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      {/* Order Controls ([Reorder] action) */}
                      <div className="flex flex-col items-center justify-center bg-slate-950 p-2 rounded-2xl border border-slate-800 shrink-0">
                        <button
                          onClick={() => handleMoveOrder(group, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-20 disabled:hover:text-slate-400 transition cursor-pointer"
                          title="Move Group Up"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <div className="text-[11px] font-black text-emerald-400 my-0.5" title="Display Order">
                          #{group.order}
                        </div>
                        <button
                          onClick={() => handleMoveOrder(group, 'down')}
                          disabled={index === filteredGroups.length - 1}
                          className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-20 disabled:hover:text-slate-400 transition cursor-pointer"
                          title="Move Group Down"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Main Group Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Hierarchy Badges: Level, Class/Course, Medium, Semester, Subject */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                            group.educationLevel === 'School'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {group.educationLevel}
                          </span>

                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {group.classOrCourse}
                          </span>

                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {group.medium}
                          </span>

                          {group.semester && group.semester !== 'N/A' && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {group.semester}
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {group.subject}
                          </span>

                          {!group.active && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Inactive (Hidden)
                            </span>
                          )}
                        </div>

                        {/* Group Name & Description */}
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                            <span>{group.groupName}</span>
                          </h3>
                          {group.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                              {group.description}
                            </p>
                          )}
                        </div>

                        {/* Associated Chapters Counter (Number of Chapters) */}
                        <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 flex-wrap">
                          <div className="flex items-center gap-1.5 font-bold text-slate-300">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{groupChapters.length} {groupChapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
                          </div>

                          {premiumCount > 0 && (
                            <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                              <Crown className="w-3 h-3" />
                              {premiumCount} Premium
                            </span>
                          )}

                          {normalCount > 0 && (
                            <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                              <FileText className="w-3 h-3 text-slate-400" />
                              {normalCount} Normal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions Requested by User:
                        [Open]
                        [Edit]
                        [Add Chapters]
                        [Reorder] (handled by up/down on left)
                        [Activate/Deactivate]
                        [Delete]
                    */}
                    <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80 justify-end flex-wrap">
                      {/* [Open] */}
                      <button
                        onClick={() => setOpenModalGroup(group)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        title="Open group syllabus overview"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open</span>
                      </button>

                      {/* [Edit] */}
                      <button
                        onClick={() => handleOpenEditWizard(group)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        title="Edit group details and chapter playlist"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Edit</span>
                      </button>

                      {/* [Add Chapters] */}
                      <button
                        onClick={() => setAddChaptersModalGroup(group)}
                        className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition cursor-pointer"
                        title="Select and add more chapters to this group"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Add Chapters</span>
                      </button>

                      {/* [Activate/Deactivate] */}
                      <button
                        onClick={() => handleToggleActive(group)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          group.active
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title={group.active ? 'Active: click to deactivate' : 'Inactive: click to activate'}
                      >
                        {group.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{group.active ? 'Active' : 'Inactive'}</span>
                      </button>

                      {/* [Delete] */}
                      <button
                        onClick={() => setGroupToDelete(group)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition cursor-pointer"
                        title="Delete Group (safely preserves chapters)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview of playlist chapters inside this group */}
                  {groupChapters.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Group Playlist ({groupChapters.length}):</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Order preserved in student syllabus
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {groupChapters.slice(0, 6).map((chap, idx) => (
                          <div
                            key={chap.id}
                            className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="truncate mr-2 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-[10px] text-emerald-400 shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-slate-200 font-medium truncate">
                                {chap.chapterNumber ? `Ch ${chap.chapterNumber} — ` : ''}{chap.title}
                              </span>
                            </div>
                            <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              chap.accessType === 'premium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              ₹{chap.offerPrice ?? chap.price}
                            </span>
                          </div>
                        ))}
                        {groupChapters.length > 6 && (
                          <button
                            onClick={() => setOpenModalGroup(group)}
                            className="bg-slate-950/40 hover:bg-slate-950 px-3 py-2 rounded-xl border border-dashed border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center justify-center cursor-pointer"
                          >
                            + {groupChapters.length - 6} more chapters (Click to view all)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TWO-STEP GROUP CREATION / EDITING WIZARD MODAL */}
      {/* ========================================================================= */}
      <AdminGroupWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        editingGroup={wizardEditingGroup}
        chapters={chapters}
        groups={groups}
        academicSettings={academicSettings}
        onSave={handleSaveGroupFromWizard}
        onSaveGroup={handleSaveGroupFromWizard}
      />

      {/* ========================================================================= */}
      {/* 5. OPEN GROUP OVERVIEW MODAL */}
      {/* ========================================================================= */}
      <AdminGroupOpenModal
        isOpen={!!openModalGroup}
        onClose={() => setOpenModalGroup(null)}
        group={openModalGroup}
        groupChapters={openModalGroup ? getGroupChapters(openModalGroup) : []}
        onEditGroup={(grp) => {
          setOpenModalGroup(null);
          handleOpenEditWizard(grp);
        }}
        onAddChapters={(grp) => {
          setOpenModalGroup(null);
          setAddChaptersModalGroup(grp);
        }}
      />

      {/* ========================================================================= */}
      {/* 6. ADD CHAPTERS TO GROUP MODAL */}
      {/* ========================================================================= */}
      <AdminAddChaptersModal
        isOpen={!!addChaptersModalGroup}
        onClose={() => setAddChaptersModalGroup(null)}
        group={addChaptersModalGroup}
        chapters={chapters}
        groups={groups}
        academicSettings={academicSettings}
        onAddChapters={handleAddChaptersToGroup}
      />

      {/* ========================================================================= */}
      {/* 7. SAFE DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Delete Group?</h3>
                <p className="text-xs text-slate-400">Safe playlist removal confirmation</p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete the group playlist <strong className="text-white font-bold">"{groupToDelete.groupName}"</strong>?
              </p>

              {/* Explicit safety notice as requested */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Important Safety Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Deleting this Group will <strong>NOT</strong> delete its chapters. All attached chapters, PDFs, videos, slides, flashcards, quizzes, and per-chapter pricing remain 100% intact in Firestore and in the general curriculum.
                </p>
              </div>

              {(() => {
                const count = getGroupChapters(groupToDelete).length;
                return count > 0 ? (
                  <p className="text-[11px] text-slate-400">
                    The {count} {count === 1 ? 'chapter' : 'chapters'} currently in this group will simply have their group relationship unlinked.
                  </p>
                ) : null;
              })()}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupToDelete(null)}
                  disabled={deleting}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-red-500/20 transition cursor-pointer"
                >
                  {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Delete Group (Safe Unlink)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CREATE BRAND NEW CHAPTER DIRECTLY IN GROUP MODAL */}
      {/* ========================================================================= */}
      {chapterModalOpen && selectedGroupForNewChapter && (
        <AdminChapterModal
          initialChapter={null}
          groups={groups}
          academicSettings={academicSettings}
          onSave={handleSaveChapterFromGroup}
          onClose={() => setChapterModalOpen(false)}
        />
      )}
    </div>
  );
};
