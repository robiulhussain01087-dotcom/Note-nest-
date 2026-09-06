import React from 'react';
import { Note } from '../types';
import { getGoogleDriveEmbedUrl } from '../utils/assetService';
import { BookOpen, ExternalLink, X, Download, ShieldCheck } from 'lucide-react';

interface GoogleDriveViewerModalProps {
  note: Note;
  studentName?: string;
  studentEmail?: string;
  onClose: () => void;
}

export const GoogleDriveViewerModal: React.FC<GoogleDriveViewerModalProps> = ({
  note,
  studentName,
  studentEmail,
  onClose,
}) => {
  const originalUrl = note.pdfUrl || '';
  const embedUrl = getGoogleDriveEmbedUrl(originalUrl);

  const handleOpenGoogleDrive = () => {
    if (originalUrl) {
      window.open(originalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[900px] text-white animate-fadeIn">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {note.course} • {note.semester}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline truncate">
                  {note.subject} {note.unit ? `(${note.unit})` : ''}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate mt-0.5">{note.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {originalUrl && (
              <button
                type="button"
                onClick={handleOpenGoogleDrive}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                title="Open official Google Drive document in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in Google Drive</span>
                <span className="sm:hidden">Drive</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Body */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 overflow-hidden relative flex flex-col">
          {embedUrl ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-slate-800 shadow-inner flex flex-col">
              <iframe
                src={embedUrl}
                title={note.title}
                className="w-full h-full border-0 rounded-xl"
                allow="autoplay; fullscreen"
                loading="lazy"
              />
            </div>
          ) : originalUrl ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-slate-800 shadow-inner flex flex-col">
              <iframe
                src={originalUrl}
                title={note.title}
                className="w-full h-full border-0 rounded-xl"
                allow="autoplay; fullscreen"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-base font-bold text-white">Document Link Unavailable</h4>
                <p className="text-xs text-slate-400">
                  The Google Drive document link has not been linked to this note yet. Please contact support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Authorized Student License{studentName ? `: ${studentName}` : ''}
              {studentEmail ? ` (${studentEmail})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {originalUrl && (
              <button
                type="button"
                onClick={handleOpenGoogleDrive}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Direct Google Drive Document</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
