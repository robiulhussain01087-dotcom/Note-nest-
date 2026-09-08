import React, { useState, useMemo } from 'react';
import { Group, Chapter } from '../types';
import { NoteNestDB } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useCurriculum } from '../context/CurriculumContext';
import { ChapterContentViewerModal } from '../components/ChapterContentViewerModal';
import {
  ArrowLeft,
  FolderTree,
  BookOpen,
  FileText,
  PlayCircle,
  HelpCircle,
  Eye,
  CheckCircle2,
  Crown,
  Sparkles,
  Layers,
  GraduationCap,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';

interface GroupDetailPageProps {
  groupId: string;
  onBack: () => void;
  onBuyChapter: (chapter: Chapter) => void;
}

export const GroupDetailPage: React.FC<GroupDetailPageProps> = ({
  groupId,
  onBack,
  onBuyChapter,
}) => {
  const { user } = useAuth();
  const [activeChapterForViewer, setActiveChapterForViewer] = useState<Chapter | null>(null);

  // Live real-time curriculum sync from Firestore
  const { groups: allGroups, chapters: allRealtimeChapters, isLive } = useCurriculum();

  // Find the requested group reactively from live Firestore snapshot
  const group: Group | undefined = useMemo(() => {
    return allGroups.find(g => g.id === groupId || g.groupId === groupId);
  }, [allGroups, groupId]);

  // Read published chapters reactively from live Firestore snapshot
  const allChapters: Chapter[] = useMemo(() => {
    return allRealtimeChapters.filter(c => c.published !== false);
  }, [allRealtimeChapters]);

  // Resolve chapters belonging to this group in admin-defined order
  const groupChapters: Chapter[] = useMemo(() => {
    if (!group) return [];
    const chapterMap = new Map(allChapters.map(c => [c.id, c]));

    // 1. Follow stored chapterOrder or chapterIds
    const orderedIds = (group.chapterOrder && group.chapterOrder.length > 0)
      ? group.chapterOrder
      : (group.chapterIds || []);

    const result: Chapter[] = [];
    const seen = new Set<string>();

    for (const id of orderedIds) {
      if (!seen.has(id)) {
        const chap = chapterMap.get(id);
        if (chap) {
          result.push(chap);
          seen.add(id);
        }
      }
    }

    // 2. Also include any chapters assigned to this group (by groupId) that may not yet be in chapterIds
    for (const chap of allChapters) {
      if ((chap.groupId === group.id || chap.groupId === group.groupId) && !seen.has(chap.id)) {
        result.push(chap);
        seen.add(chap.id);
      }
    }

    return result;
  }, [group, allChapters]);

  // Check if group is inactive or not found
  if (!group || group.active === false) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <FolderTree className="w-8 h-8 stroke-1" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Syllabus Group Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            The syllabus group you are looking for may have been retired or is currently unavailable.
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all shadow-xs group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Groups</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Academic Library</span>
            <span>&gt;</span>
            <span>Groups</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-bold">{group.groupName}</span>
          </div>
        </div>

        {/* Group Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3 max-w-3xl">
              {/* Group Metadata Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-950 text-white shadow-xs">
                  <span>📂</span> Group {group.order || 1}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-950 border border-blue-100 uppercase tracking-wider">
                  {group.classOrCourse}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {group.medium} Medium
                </span>
                {group.semester && group.semester !== 'N/A' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {group.semester}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {groupChapters.length} {groupChapters.length === 1 ? 'Chapter' : 'Chapters'}
                </span>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sync
                  </span>
                )}
              </div>

              {/* Group Name & Subject */}
              <div>
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                  {group.subject}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  📂 {group.groupName}
                </h1>
              </div>

              {/* Description */}
              {group.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {group.description}
                </p>
              )}
            </div>

            {/* Quick summary badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shrink-0 text-center sm:text-left min-w-[200px]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Syllabus Unit Structure
              </span>
              <div className="text-2xl font-black text-slate-900">
                {groupChapters.length}
                <span className="text-sm font-semibold text-slate-500 ml-1.5">
                  {groupChapters.length === 1 ? 'Chapter' : 'Chapters'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Sequential admin-defined curriculum order
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              GROUP: {group.groupName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {groupChapters.length} {groupChapters.length === 1 ? 'Chapter' : 'Chapters'} in this syllabus group • Individual chapter purchases
            </p>
          </div>
        </div>

        {/* Chapters List */}
        {groupChapters.length > 0 ? (
          <div className="space-y-4">
            {groupChapters.map((chapter, idx) => {
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

              return (
                <div
                  key={chapter.id}
                  className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-xs hover:shadow-md ${
                    isPremium
                      ? 'border-amber-200/90 hover:border-amber-300'
                      : 'border-slate-200/90 hover:border-blue-900/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left Details */}
                    <div className="space-y-2.5 flex-1">
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-slate-900 text-white">
                          #{idx + 1}
                        </span>

                        {isPremium ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            <span>👑</span> Premium
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            Normal
                          </span>
                        )}

                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                          {chapter.subject}
                        </span>

                        {isPurchased && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Purchased
                          </span>
                        )}
                      </div>

                      {/* Chapter Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {idx + 1}. {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : ''}{chapter.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 max-w-3xl">
                        {chapter.description || (isPremium
                          ? 'Comprehensive premium unit coverage with interactive lecture videos, slides, flashcards, and quizzes.'
                          : 'Standard academic curriculum unit notes with full PDF reading materials.')}
                      </p>

                      {/* Topics pills */}
                      {chapter.topics && chapter.topics.length > 0 && (
                        <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Topics ({chapter.topics.length}):
                          </span>
                          {chapter.topics.slice(0, 3).map((t, tIdx) => (
                            <span
                              key={t.id || tIdx}
                              className="px-2 py-0.5 rounded bg-slate-50 text-[11px] text-slate-600 font-medium border border-slate-100"
                            >
                              {t.topicName}
                            </span>
                          ))}
                          {chapter.topics.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              +{chapter.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Pricing & Actions */}
                    <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                      {/* Price display */}
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{originalPrice}
                          </span>
                        )}
                        <span className="text-xl font-black text-slate-900">
                          ₹{offerPrice}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {/* Explore sample / viewer */}
                        <button
                          onClick={() => setActiveChapterForViewer(chapter)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Preview topics and sample materials"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Explore</span>
                        </button>

                        {/* Buy or Open */}
                        {isPurchased ? (
                          <button
                            onClick={() => setActiveChapterForViewer(chapter)}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Unlocked • Open</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onBuyChapter(chapter)}
                            className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                              isPremium
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                                : 'bg-blue-950 hover:bg-blue-900 text-white'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Buy Chapter (₹{offerPrice})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No chapters assigned yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Chapters for this syllabus group are being organized by the administration.
            </p>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Back to Groups
            </button>
          </div>
        )}
      </div>

      {/* Interactive Chapter Content Viewer Modal */}
      {activeChapterForViewer && (
        <ChapterContentViewerModal
          chapter={activeChapterForViewer}
          user={user}
          onClose={() => setActiveChapterForViewer(null)}
          onBuyChapter={(ch) => {
            setActiveChapterForViewer(null);
            onBuyChapter(ch);
          }}
        />
      )}
    </div>
  );
};
