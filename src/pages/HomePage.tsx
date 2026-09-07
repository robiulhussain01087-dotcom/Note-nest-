import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurriculum } from '../context/CurriculumContext';
import { Chapter, Note } from '../types';
import { NoteNestDB } from '../services/db';
import { NoteCard } from '../components/NoteCard';
import { ChapterContentViewerModal } from '../components/ChapterContentViewerModal';
import {
  Search,
  BookOpen,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Download,
  Award,
  Crown,
  GraduationCap,
  Layers,
  Globe,
  Video,
  FileText
} from 'lucide-react';

interface HomePageProps {
  onExplore: () => void;
  onSelectNote: (note: Note) => void;
  onBuyNow: (note: Note) => void;
  onSelectSubject?: (subject: string) => void;
  onBuyChapter?: (chapter: Chapter) => void;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onExplore,
  onSelectNote,
  onBuyNow,
  onBuyChapter,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<'all' | 'school' | 'college'>('all');
  const [activeChapterForViewer, setActiveChapterForViewer] = useState<Chapter | null>(null);

  const allNotes = NoteNestDB.getNotes().filter(n => n.published);
  const featuredNotes = allNotes.slice(0, 4);

  const academicSettings = NoteNestDB.getAcademicSettings();
  const { chapters: realtimeChapters } = useCurriculum();
  const allChapters = useMemo(() => realtimeChapters.filter(c => c.published !== false), [realtimeChapters]);

  // Filtered chapters for interactive multi-education showcase
  const displayChapters = useMemo(() => {
    let list = allChapters;
    if (selectedEducationLevel !== 'all') {
      list = list.filter(c => c.educationLevel === selectedEducationLevel);
    }
    return list.slice(0, 6);
  }, [allChapters, selectedEducationLevel]);

  const bcomSubjects = [
    {
      name: 'Financial Accounting',
      units: 'Units 1 to 4 Available',
      desc: 'Accounting Standards, Depreciation, Hire Purchase & Partnership Accounts.',
      badge: 'Bestseller',
      bgGradient: 'from-blue-900 to-indigo-950',
      accentColor: 'text-blue-200'
    },
    {
      name: 'Business Law',
      units: 'Contract Act & Special Contracts',
      desc: 'Landmark case laws, essentials of valid contract, free consent & discharge.',
      badge: 'High Yield',
      bgGradient: 'from-emerald-900 to-teal-950',
      accentColor: 'text-emerald-200'
    },
    {
      name: 'Principles of Management',
      units: 'Taylor, Fayol, MBO & Planning',
      desc: 'Management theories, organizing structures, leadership & decision matrices.',
      badge: 'Syllabus Aligned',
      bgGradient: 'from-slate-900 to-blue-950',
      accentColor: 'text-cyan-200'
    },
    {
      name: 'Business Economics',
      units: 'Micro Economics & Demand Analysis',
      desc: 'Elasticity, indifference curves, cost-revenue curves & market structures.',
      badge: 'Diagram Heavy',
      bgGradient: 'from-amber-950 to-stone-900',
      accentColor: 'text-amber-200'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExplore();
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Ambient color blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Multi-Education Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-400 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>School (Classes 9–12) & College (B.Com, B.A., B.Sc.) In 4 Mediums</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Quality Study Notes, <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Made Simple.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Direct, exam-focused study notes, video lessons, slides, and quizzes in <strong>Assamese, English, Bangla, and Hindi</strong> mediums. Built for state boards, CBSE, and university curriculums.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-xl mx-auto flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-slate-200/20 text-slate-900"
          >
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters, topics (e.g. Accounting, Gravitation, Contract Act)..."
              className="w-full px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={onExplore}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <span>Search</span>
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onExplore}
              className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-slate-950" />
              <span>Explore Curriculum</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">4 Regional Mediums</p>
                <p className="text-[11px] text-slate-400">Assamese, English, Bangla, Hindi</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Direct Manual UPI</p>
                <p className="text-[11px] text-slate-400">PhonePe / GPay / Paytm</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Admin Verified</p>
                <p className="text-[11px] text-slate-400">Instant student unlocking</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Per-Chapter Purchase</p>
                <p className="text-[11px] text-slate-400">Pay only for what you study</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Education Curriculum Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Education Syllabus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Chapters & Topics
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select your education tier below to preview interactive unit study materials, video lectures, and revision quizzes.
            </p>
          </div>

          {/* Education Level Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200">
            <button
              onClick={() => setSelectedEducationLevel('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedEducationLevel === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setSelectedEducationLevel('school')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedEducationLevel === 'school'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              School (9–12)
            </button>
            <button
              onClick={() => setSelectedEducationLevel('college')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedEducationLevel === 'college'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              College (UG)
            </button>
          </div>
        </div>

        {/* Chapters Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayChapters.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setActiveChapterForViewer(ch)}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-100 uppercase">
                      {ch.educationLevel === 'school' ? 'School' : 'College'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {ch.classOrCourse}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 capitalize">
                    {ch.medium} Medium
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400">Chapter {ch.chapterNumber} • {ch.subject}</span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors mt-0.5 line-clamp-1">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {ch.description || 'Comprehensive chapter curriculum covering core theoretical formulas, question patterns and exam solutions.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-800" />
                    {ch.topics?.length || 0} Topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-rose-600" />
                    Videos & Slides
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>Preview Chapter Content</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured B.Com 1st Semester Section (Preserved for existing students) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>College Highlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              B.Com 1st Semester Subjects
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select any core subject below to view topic-wise notes, units, and past university solved examples.
            </p>
          </div>

          <button
            onClick={onExplore}
            className="text-sm font-bold text-blue-900 hover:text-emerald-600 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>View All Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Subject cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bcomSubjects.map((subj, idx) => (
            <div
              key={idx}
              onClick={onExplore}
              className={`rounded-2xl p-5 bg-gradient-to-br ${subj.bgGradient} text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold tracking-wider bg-white/15 px-2 py-0.5 rounded text-white backdrop-blur-xs">
                    {subj.badge}
                  </span>
                  <BookOpen className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white mb-1">
                  {subj.name}
                </h3>
                <p className={`text-xs font-semibold ${subj.accentColor} mb-2`}>
                  {subj.units}
                </p>
                <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed">
                  {subj.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                <span>Browse Notes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Notes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Study Notes
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Top handwritten and typed notes with genuine original prices and verified student discounts.
            </p>
          </div>

          <button
            onClick={onExplore}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
          >
            Explore All Notes ({allNotes.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onSelect={onSelectNote}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      </section>

      {/* How NoteNest Works */}
      <section className="bg-slate-100/80 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simple 3-Step Study Notes Access
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Fast, transparent, and direct manual UPI verification without extra platform commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 font-extrabold text-xl flex items-center justify-center mb-4 border border-blue-100">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Pick Your Subject & Unit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review syllabus coverage, page count, and unit previews before making your choice.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xl flex items-center justify-center mb-4 border border-emerald-100">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Pay via PhonePe / Any UPI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan the Admin UPI QR code, pay the exact offer price, and enter your 12-digit UTR transaction ID.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 font-extrabold text-xl flex items-center justify-center mb-4 border border-purple-100">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Instant Admin Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once approved, your note unlocks immediately in &ldquo;My Purchases&rdquo; for high-res PDF reading & offline study.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Content Viewer Modal for Instant Preview on Home */}
      {activeChapterForViewer && (
        <ChapterContentViewerModal
          chapter={activeChapterForViewer}
          user={user}
          onClose={() => setActiveChapterForViewer(null)}
          onBuyChapter={(chap) => {
            setActiveChapterForViewer(null);
            if (onBuyChapter) {
              onBuyChapter(chap);
            } else if (onNavigate) {
              onNavigate(`checkout/chapter/${chap.id}`);
            }
          }}
        />
      )}
    </div>
  );
};
