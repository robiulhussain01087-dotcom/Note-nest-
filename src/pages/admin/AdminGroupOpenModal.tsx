import React from 'react';
import { Group, Chapter } from '../../types';
import {
  Layers,
  BookOpen,
  X,
  Edit2,
  FolderPlus,
  Crown,
  FileText,
  Video,
  Presentation,
  BrainCircuit,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface AdminGroupOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  groupChapters: Chapter[];
  onEditGroup: (group: Group) => void;
  onAddChapters: (group: Group) => void;
}

export const AdminGroupOpenModal: React.FC<AdminGroupOpenModalProps> = ({
  isOpen,
  onClose,
  group,
  groupChapters,
  onEditGroup,
  onAddChapters
}) => {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0 mt-0.5">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Order #{group.order || 1}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    group.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {group.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {group.educationLevel} • {group.classOrCourse} • {group.medium}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1.5">
                  {group.groupName}
                </h2>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">
                  {group.subject} {group.semester && group.semester !== 'N/A' ? `• ${group.semester}` : ''}
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

          {group.description && (
            <p className="text-xs text-slate-300 mt-3.5 p-3 bg-slate-950 rounded-xl border border-slate-800/80 leading-relaxed">
              {group.description}
            </p>
          )}
        </div>

        {/* Modal Body: Chapter Playlist */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Group Chapters Playlist ({groupChapters.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Chapters organized within this group playlist. Individual chapter pricing and files remain intact.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onAddChapters(group);
              }}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add Chapters</span>
            </button>
          </div>

          {groupChapters.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No chapters assigned to this group yet</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-4">
                You can select existing chapters to populate this group playlist.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddChapters(group);
                }}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add Existing Chapters</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {groupChapters.map((chap, idx) => {
                const isPremium = chap.accessType === 'premium';
                const topicsCount = chap.topics ? chap.topics.length : (chap.topicsCount || 0);

                return (
                  <div
                    key={chap.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-emerald-400 text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-white">
                            {chap.chapterNumber ? `Chapter ${chap.chapterNumber} — ` : ''}{chap.title}
                          </h4>
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

                        {chap.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {chap.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-300">
                            <BookOpen className="w-3 h-3 text-emerald-400" />
                            <span>{topicsCount} Topics</span>
                          </span>
                          {chap.pdfUrl && (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <FileText className="w-3 h-3" />
                              <span>PDF Ready</span>
                            </span>
                          )}
                          <span className="text-emerald-400 font-bold">
                            ₹{chap.offerPrice ?? chap.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                      <span className="text-[11px] font-extrabold text-slate-300 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                        ₹{chap.offerPrice ?? chap.price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditGroup(group);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Group & Reorder</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
