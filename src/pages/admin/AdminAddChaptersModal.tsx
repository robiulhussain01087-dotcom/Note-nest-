import React, { useState, useMemo } from 'react';
import { Group, Chapter, AcademicSettings } from '../../types';
import {
  FolderPlus,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  BookOpen,
  Layers,
  AlertCircle
} from 'lucide-react';

interface AdminAddChaptersModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  chapters: Chapter[];
  groups: Group[];
  academicSettings: AcademicSettings;
  onAddChapters: (groupId: string, newChapterIds: string[]) => Promise<void>;
}

export const AdminAddChaptersModal: React.FC<AdminAddChaptersModalProps> = ({
  isOpen,
  onClose,
  group,
  chapters,
  groups,
  academicSettings,
  onAddChapters
}) => {
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [mediumFilter, setMediumFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group's existing chapter IDs
  const existingChapterIds = useMemo(() => {
    if (!group) return new Set<string>();
    return new Set<string>(group.chapterIds || []);
  }, [group]);

  // Filtered chapters: prioritize chapters matching group's subject / class, and exclude already assigned if desired
  const filteredChapters = useMemo(() => {
    if (!group) return [];

    return chapters.filter(c => {
      // Exclude chapters already in this group
      if (existingChapterIds.has(c.id)) return false;

      if (levelFilter !== 'all' && c.educationLevel !== levelFilter) return false;
      if (mediumFilter !== 'all' && c.medium !== mediumFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesNum = (c.chapterNumber || '').toLowerCase().includes(q);
        const matchesSub = c.subject.toLowerCase().includes(q);
        const matchesClass = c.classOrCourse.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNum && !matchesSub && !matchesClass) return false;
      }

      return true;
    });
  }, [chapters, group, existingChapterIds, levelFilter, mediumFilter, searchQuery]);

  const handleToggle = (id: string) => {
    setSelectedChapterIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    setSelectedChapterIds(filteredChapters.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedChapterIds([]);
  };

  const handleSubmit = async () => {
    if (!group) return;
    if (selectedChapterIds.length === 0) {
      setError('Please select at least one chapter to add.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onAddChapters(group.id, selectedChapterIds);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add chapters to group.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  Add Chapters to Group
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adding to playlist: <strong className="text-emerald-400">{group.groupName}</strong> ({group.subject} • {group.classOrCourse})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapters by title, number, or subject..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Levels</option>
                  <option value="School">School</option>
                  <option value="College">College</option>
                </select>

                <select
                  value={mediumFilter}
                  onChange={(e) => setMediumFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Mediums</option>
                  {academicSettings.mediums.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
                >
                  Select Visible
                </button>
                {selectedChapterIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chapter Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>Available Chapters to Add ({filteredChapters.length})</span>
              <span className="text-emerald-400 font-extrabold">{selectedChapterIds.length} Selected</span>
            </div>

            {filteredChapters.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No matching chapters found</p>
                <p className="text-[11px] text-slate-500 mt-1">All matching chapters may already be in this group</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredChapters.map(chap => {
                  const isSelected = selectedChapterIds.includes(chap.id);
                  const otherGroup = chap.groupId ? groups.find(g => g.id === chap.groupId) : null;

                  return (
                    <div
                      key={chap.id}
                      onClick={() => handleToggle(chap.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/60'
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black'
                            : 'border-slate-700 bg-slate-900 text-transparent'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs text-white">
                              {chap.chapterNumber ? `Ch ${chap.chapterNumber} — ` : ''}{chap.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                              ₹{chap.offerPrice ?? chap.price}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                            <span className="text-emerald-400 font-bold">{chap.subject}</span>
                            <span>•</span>
                            <span>{chap.classOrCourse}</span>
                            <span>•</span>
                            <span>{chap.medium}</span>
                            {otherGroup && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                                Moving from: {otherGroup.groupName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'
                      }`}>
                        {isSelected ? 'Added' : 'Select'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || selectedChapterIds.length === 0}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Add {selectedChapterIds.length} Chapters to Group</span>
          </button>
        </div>
      </div>
    </div>
  );
};
