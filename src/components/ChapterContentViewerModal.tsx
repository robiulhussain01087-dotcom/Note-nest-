import React, { useState } from 'react';
import { Chapter, Topic, User } from '../types';
import { NoteNestDB } from '../services/db';
import {
  X,
  BookOpen,
  FileText,
  Video,
  Presentation,
  Sparkles,
  HelpCircle,
  Lock,
  Crown,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ChapterContentViewerModalProps {
  chapter: Chapter;
  user: User | null;
  onBuyChapter?: (chapter: Chapter) => void;
  onClose: () => void;
}

export const ChapterContentViewerModal: React.FC<ChapterContentViewerModalProps> = ({
  chapter,
  user,
  onBuyChapter,
  onClose
}) => {
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [activeContentType, setActiveContentType] = useState<'pdf' | 'video' | 'slides' | 'flashcards' | 'quiz'>('pdf');

  // Flashcards state
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const topics = chapter.topics && chapter.topics.length > 0 ? chapter.topics : [];
  const currentTopic: Topic | undefined = topics[activeTopicIndex];

  const isAdmin = user?.role === 'admin';
  const isPurchased = user?.uid ? NoteNestDB.hasCustomerPurchasedChapter(user.uid, chapter.id) : false;
  const isPremiumChapter = chapter.accessType === 'premium';
  const offerPrice = typeof chapter.offerPrice === 'number' && !isNaN(chapter.offerPrice)
    ? chapter.offerPrice
    : (typeof chapter.price === 'number' && !isNaN(chapter.price) && chapter.price > 0
        ? chapter.price
        : (isPremiumChapter ? 30 : 10));

  const originalPrice = typeof chapter.originalPrice === 'number' && !isNaN(chapter.originalPrice)
    ? chapter.originalPrice
    : (isPremiumChapter ? 50 : 20);

  const hasDiscount = originalPrice > offerPrice;
  const chapterPrice = offerPrice;
  const chapterPdfLink = chapter.pdfUrl || (chapter.topics && (chapter.topics as any)[0]?.pdfUrl) || '';

  const handlePurchase = () => {
    if (onBuyChapter) {
      onBuyChapter(chapter);
    }
  };

  const checkAccess = (contentType: 'pdf' | 'video' | 'slides' | 'flashcards' | 'quiz'): boolean => {
    if (isAdmin) return true;
    if (!isPurchased) return false;
    if (chapter.accessType === 'normal') {
      return contentType === 'pdf';
    }
    return true;
  };

  const getEmbedUrl = (rawUrl?: string): string => {
    if (!rawUrl) return '';
    if (rawUrl.includes('drive.google.com')) {
      const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return rawUrl.replace(/\/view(\?.*)?$/, '/preview');
    }
    if (rawUrl.includes('youtube.com/watch')) {
      const v = new URL(rawUrl).searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : rawUrl;
    }
    if (rawUrl.includes('youtu.be/')) {
      const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
    }
    return rawUrl;
  };

  // Reset local state when topic changes
  const handleSelectTopic = (idx: number) => {
    setActiveTopicIndex(idx);
    setCurrentFcIndex(0);
    setFcFlipped(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isPremiumChapter
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {isPremiumChapter ? <Crown className="w-5 h-5 text-amber-400" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {chapter.educationLevel} • {chapter.classOrCourse}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {chapter.medium} Medium
                </span>
                {isPremiumChapter ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <span>👑</span> Premium
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Normal
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400">
                  ₹{chapterPrice}
                </span>
              </div>
              <h2 className="text-base font-black text-white mt-1">
                {isPremiumChapter && <span className="mr-1">👑</span>}
                {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : ''}{chapter.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
                Admin Full Access
              </span>
            ) : isPurchased ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Chapter Unlocked</span>
              </span>
            ) : (
              <button
                onClick={handlePurchase}
                className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                  isPremiumChapter
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-emerald-500 text-white hover:bg-emerald-400'
                }`}
              >
                {isPremiumChapter && <span>👑</span>}
                <span className="flex items-center gap-1.5">
                  <span>Buy Chapter</span>
                  {hasDiscount && (
                    <span className="line-through opacity-70 font-normal">₹{originalPrice}</span>
                  )}
                  <span className="font-black">₹{offerPrice}</span>
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Chapter-Level PDF and Topic Navigation Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-col gap-2.5">
          {/* Chapter-Level Complete PDF Link */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-emerald-300">
                    📄 Complete Chapter PDF
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-medium hidden sm:inline">
                    (Single study note for the whole chapter)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveContentType('pdf')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeContentType === 'pdf'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                    : 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-800/40'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{activeContentType === 'pdf' ? 'Viewing Chapter PDF' : 'Open Chapter PDF'}</span>
                {!checkAccess('pdf') && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
              </button>

              {chapterPdfLink && checkAccess('pdf') && (
                <a
                  href={chapterPdfLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-700 transition-colors hidden sm:inline-flex items-center gap-1"
                >
                  <span>Drive Tab ↗</span>
                </a>
              )}
            </div>
          </div>

          {/* Topics Navigation Bar */}
          {topics.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Topics:
              </span>
              {topics.map((t, idx) => (
                <button
                  key={t.id || idx}
                  onClick={() => {
                    handleSelectTopic(idx);
                    if (activeContentType === 'pdf') {
                      setActiveContentType('video');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                    activeTopicIndex === idx && activeContentType !== 'pdf'
                      ? isPremiumChapter
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                        : 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {isPremiumChapter && <span className="text-[10px]">👑</span>}
                  <span>{t.topicName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Body */}
        {currentTopic ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Nav for Content Modes: PDF, Video, Slides, Flashcards, Quiz */}
            <div className="w-full md:w-56 bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-800 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
              <div className="hidden md:block px-2 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Chapter Material:
              </div>

              <button
                onClick={() => setActiveContentType('pdf')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeContentType === 'pdf'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>📄 Complete PDF Note</span>
                </div>
                {!checkAccess('pdf') && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <div className="hidden md:block px-2 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Topic #{activeTopicIndex + 1} Content:
              </div>

              <button
                onClick={() => setActiveContentType('video')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeContentType === 'video'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>🎬 Video Lesson</span>
                </div>
                {!checkAccess('video') && (
                  isPremiumChapter ? <Crown className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3 text-slate-500" />
                )}
              </button>

              <button
                onClick={() => setActiveContentType('slides')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeContentType === 'slides'
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Presentation className="w-4 h-4 text-blue-400" />
                  <span>📊 Slides</span>
                </div>
                {!checkAccess('slides') && (
                  isPremiumChapter ? <Crown className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3 text-slate-500" />
                )}
              </button>

              <button
                onClick={() => setActiveContentType('flashcards')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeContentType === 'flashcards'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Flashcards ({(currentTopic.flashcards || []).length})</span>
                </div>
                {!checkAccess('flashcards') && (
                  isPremiumChapter ? <Crown className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3 text-slate-500" />
                )}
              </button>

              <button
                onClick={() => setActiveContentType('quiz')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeContentType === 'quiz'
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Practice Quiz ({(currentTopic.quiz || []).length})</span>
                </div>
                {!checkAccess('quiz') && (
                  isPremiumChapter ? <Crown className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3 text-slate-500" />
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-900 p-4 sm:p-6 overflow-y-auto">
              {/* PDF Viewer - Chapter-Level Complete Study Note */}
              {activeContentType === 'pdf' && (
                <div className="h-full flex flex-col space-y-3">
                  <div className="flex items-center justify-between bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <FileText className="w-4 h-4" />
                      <span>Complete Chapter Study Note: {chapter.title}</span>
                    </div>
                    {chapterPdfLink && (
                      <a
                        href={chapterPdfLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1"
                      >
                        Open in Google Drive ↗
                      </a>
                    )}
                  </div>

                  {!checkAccess('pdf') ? (
                    <ChapterUnlockGate
                      chapter={chapter}
                      contentType="pdf"
                      isPurchased={isPurchased}
                      onBuyChapter={handlePurchase}
                    />
                  ) : chapterPdfLink ? (
                    <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
                      <iframe
                        src={getEmbedUrl(chapterPdfLink)}
                        className="w-full h-full border-0"
                        title="Complete Chapter PDF Note Preview"
                        allow="autoplay"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                      No PDF link specified for this chapter yet. Administrator can add one in the Chapter Editor.
                    </div>
                  )}
                </div>
              )}

              {/* Video Player */}
              {activeContentType === 'video' && (
                <div className="h-full flex flex-col">
                  {!checkAccess('video') ? (
                    <ChapterUnlockGate
                      chapter={chapter}
                      contentType="video"
                      isPurchased={isPurchased}
                      onBuyChapter={handlePurchase}
                    />
                  ) : currentTopic.videoUrl ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      <iframe
                        src={getEmbedUrl(currentTopic.videoUrl)}
                        className="w-full h-full border-0"
                        title="Video Lesson"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                      No video lesson link uploaded for this topic.
                    </div>
                  )}
                </div>
              )}

              {/* Slides Player */}
              {activeContentType === 'slides' && (
                <div className="h-full flex flex-col">
                  {!checkAccess('slides') ? (
                    <ChapterUnlockGate
                      chapter={chapter}
                      contentType="slides"
                      isPurchased={isPurchased}
                      onBuyChapter={handlePurchase}
                    />
                  ) : currentTopic.slidesUrl ? (
                    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      <iframe
                        src={getEmbedUrl(currentTopic.slidesUrl)}
                        className="w-full h-full border-0"
                        title="Slides Presentation"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                      No presentation slides added for this topic.
                    </div>
                  )}
                </div>
              )}

              {/* Flashcards Player */}
              {activeContentType === 'flashcards' && (
                <div className="h-full flex flex-col">
                  {!checkAccess('flashcards') ? (
                    <ChapterUnlockGate
                      chapter={chapter}
                      contentType="flashcards"
                      isPurchased={isPurchased}
                      onBuyChapter={handlePurchase}
                    />
                  ) : (currentTopic.flashcards || []).length > 0 ? (
                    <div className="max-w-xl mx-auto w-full space-y-6 py-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Card {currentFcIndex + 1} of {(currentTopic.flashcards || []).length}</span>
                        <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Click card to flip</span>
                        </span>
                      </div>

                      {/* Flip Card */}
                      <div
                        onClick={() => setFcFlipped(!fcFlipped)}
                        className="h-64 rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-amber-500/50 select-none group"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          {fcFlipped ? 'Answer / Explanation' : 'Question / Concept'}
                        </div>
                        <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                          {fcFlipped
                            ? currentTopic.flashcards![currentFcIndex].answer
                            : currentTopic.flashcards![currentFcIndex].question}
                        </div>
                        <div className="mt-4 text-[10px] text-slate-500 group-hover:text-slate-400 flex items-center gap-1">
                          <RotateCw className="w-3 h-3" />
                          <span>Tap to reveal {fcFlipped ? 'question' : 'answer'}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setCurrentFcIndex(Math.max(0, currentFcIndex - 1));
                            setFcFlipped(false);
                          }}
                          disabled={currentFcIndex === 0}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentFcIndex(Math.min((currentTopic.flashcards || []).length - 1, currentFcIndex + 1));
                            setFcFlipped(false);
                          }}
                          disabled={currentFcIndex === (currentTopic.flashcards || []).length - 1}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                      No flashcards created for this topic.
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Player */}
              {activeContentType === 'quiz' && (
                <div className="h-full flex flex-col">
                  {!checkAccess('quiz') ? (
                    <ChapterUnlockGate
                      chapter={chapter}
                      contentType="quiz"
                      isPurchased={isPurchased}
                      onBuyChapter={handlePurchase}
                    />
                  ) : (currentTopic.quiz || []).length > 0 ? (
                    <div className="max-w-2xl mx-auto w-full space-y-6 py-2">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-indigo-400" />
                          <span>Self-Assessment Quiz</span>
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {(currentTopic.quiz || []).length} questions
                        </span>
                      </div>

                      <div className="space-y-6">
                        {currentTopic.quiz!.map((q, qIdx) => {
                          const userSelected = selectedAnswers[qIdx];
                          const isCorrect = userSelected === q.correctAnswer;
                          const showFeedback = quizSubmitted;

                          return (
                            <div key={q.id || qIdx} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                              <div className="font-bold text-xs sm:text-sm text-white flex items-start gap-2">
                                <span className="text-indigo-400">Q{qIdx + 1}.</span>
                                <span>{q.question}</span>
                              </div>

                              <div className="space-y-2 pt-1">
                                {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                                  const optText = (q as any)[`option${optKey}`];
                                  if (!optText) return null;

                                  const isThisSelected = userSelected === optKey;
                                  const isThisCorrect = q.correctAnswer === optKey;

                                  let optionStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                                  if (showFeedback) {
                                    if (isThisCorrect) {
                                      optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                                    } else if (isThisSelected && !isThisCorrect) {
                                      optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                                    }
                                  } else if (isThisSelected) {
                                    optionStyle = 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold';
                                  }

                                  return (
                                    <button
                                      key={optKey}
                                      onClick={() => {
                                        if (!quizSubmitted) {
                                          setSelectedAnswers({ ...selectedAnswers, [qIdx]: optKey });
                                        }
                                      }}
                                      className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer ${optionStyle}`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                                          {optKey}
                                        </span>
                                        <span>{optText}</span>
                                      </div>

                                      {showFeedback && isThisCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      )}
                                      {showFeedback && isThisSelected && !isThisCorrect && (
                                        <XCircle className="w-4 h-4 text-rose-400" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {showFeedback && q.explanation && (
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 mt-2">
                                  <strong className="text-emerald-400">Explanation: </strong>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Quiz Submit Button */}
                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        {quizSubmitted ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white">
                              Your Score:{' '}
                              <span className="text-emerald-400">
                                {Object.entries(selectedAnswers).filter(([idx, ans]) => currentTopic.quiz![Number(idx)]?.correctAnswer === ans).length}
                              </span>{' '}
                              / {currentTopic.quiz!.length}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedAnswers({});
                                setQuizSubmitted(false);
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                            >
                              Retake Quiz
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setQuizSubmitted(true)}
                            className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
                          >
                            Submit & Check Answers
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                      No quiz questions added for this topic.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No topics defined for this chapter yet.
          </div>
        )}
      </div>
    </div>
  );
};

// Per-Chapter Unlock Gate Component
interface ChapterUnlockGateProps {
  chapter: Chapter;
  contentType: 'pdf' | 'video' | 'slides' | 'flashcards' | 'quiz';
  isPurchased: boolean;
  onBuyChapter: () => void;
}

const ChapterUnlockGate: React.FC<ChapterUnlockGateProps> = ({
  chapter,
  contentType,
  isPurchased,
  onBuyChapter
}) => {
  const isPremiumChapter = chapter.accessType === 'premium';
  const offerPrice = typeof chapter.offerPrice === 'number' && !isNaN(chapter.offerPrice)
    ? chapter.offerPrice
    : (typeof chapter.price === 'number' && !isNaN(chapter.price) && chapter.price > 0
        ? chapter.price
        : (isPremiumChapter ? 30 : 10));

  const originalPrice = typeof chapter.originalPrice === 'number' && !isNaN(chapter.originalPrice)
    ? chapter.originalPrice
    : (isPremiumChapter ? 50 : 20);

  const hasDiscount = originalPrice > offerPrice;
  const price = offerPrice;

  // If the user has purchased a normal chapter, but tries to access premium material (video, slides, flashcards, quiz)
  if (isPurchased && !isPremiumChapter && contentType !== 'pdf') {
    return (
      <div className="my-auto py-12 px-6 flex flex-col items-center text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center border shadow-xl bg-slate-800/80 text-slate-400 border-slate-700">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 bg-slate-800 text-slate-300 border border-slate-700">
            Normal Chapter Material
          </span>
          <h3 className="text-lg font-black text-white">Feature Not Available</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            This chapter is set as a Normal chapter by the administrator. Video lectures, interactive slides, and quizzes are only available for 👑 Premium chapters.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
          ✓ Your PDF notes for this chapter remain fully unlocked!
        </div>
      </div>
    );
  }

  // Not purchased yet
  const contentTypeLabels: Record<string, string> = {
    pdf: 'PDF Study Notes',
    video: 'Video Overview & Lecture',
    slides: 'Interactive Slides',
    flashcards: 'Revision Flashcards',
    quiz: 'Practice Quiz'
  };

  return (
    <div className="my-auto py-12 px-6 flex flex-col items-center text-center max-w-md mx-auto space-y-4">
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-xl ${
        isPremiumChapter ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      }`}>
        {isPremiumChapter ? <Crown className="w-8 h-8 text-amber-400" /> : <Lock className="w-8 h-8" />}
      </div>

      <div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 ${
          isPremiumChapter ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {isPremiumChapter ? (
            <>
              <span>👑</span>
              <span>Premium Chapter</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Normal Chapter</span>
            </>
          )}
          <span>•</span>
          {hasDiscount ? (
            <span className="flex items-center gap-1">
              <span className="line-through opacity-60 font-normal">₹{originalPrice}</span>
              <span className="font-black">₹{offerPrice}</span>
            </span>
          ) : (
            <span>₹{offerPrice}</span>
          )}
        </span>
        <h3 className="text-lg font-black text-white">
          {contentTypeLabels[contentType] || 'Chapter Content'} Locked
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          {isPremiumChapter
            ? `Unlock this 👑 Premium Chapter for only ₹${offerPrice}${hasDiscount ? ` (Regular: ₹${originalPrice})` : ''} to get full access to PDF notes, video lectures, slides, flashcards, and quizzes.`
            : `Unlock this chapter for only ₹${offerPrice}${hasDiscount ? ` (Regular: ₹${originalPrice})` : ''} to access complete, high-yield PDF study notes.`}
        </p>
      </div>

      <button
        onClick={onBuyChapter}
        className={`px-7 py-3 rounded-2xl font-black text-xs shadow-xl transition-all cursor-pointer flex items-center gap-2 ${
          isPremiumChapter
            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/20'
            : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20'
        }`}
      >
        {isPremiumChapter && <span>👑</span>}
        <span className="flex items-center gap-1.5">
          <span>Unlock Chapter {chapter.chapterNumber ? `${chapter.chapterNumber} ` : ''}for</span>
          {hasDiscount && (
            <span className="line-through opacity-70 font-normal">₹{originalPrice}</span>
          )}
          <span className="font-black">₹{offerPrice}</span>
        </span>
        <ChevronRight className="w-4 h-4" />
      </button>

      <p className="text-[11px] text-slate-500">
        Direct one-time payment with UPI / QR code verification. No recurring subscription.
      </p>
    </div>
  );
};
