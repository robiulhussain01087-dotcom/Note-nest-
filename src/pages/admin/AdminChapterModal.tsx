import React, { useState, useMemo } from 'react';
import { Chapter, Topic, ContentAccessTier, FlashcardItem, QuizItem, AcademicSettings, Group } from '../../types';
import { NoteNestDB } from '../../services/db';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  Video,
  Presentation,
  Sparkles,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
  AlertCircle,
  Crown,
  IndianRupee
} from 'lucide-react';

interface AdminChapterModalProps {
  initialChapter?: Chapter | null;
  academicSettings: AcademicSettings;
  groups?: Group[];
  onSave: (chapter: Chapter) => Promise<void>;
  onClose: () => void;
}

export const AdminChapterModal: React.FC<AdminChapterModalProps> = ({
  initialChapter,
  academicSettings,
  groups: propGroups,
  onSave,
  onClose
}) => {
  const isEditing = !!initialChapter;

  // Available Groups
  const availableGroups = useMemo(() => {
    return propGroups || NoteNestDB.getGroups();
  }, [propGroups]);

  // Hierarchy fields
  const [educationLevel, setEducationLevel] = useState<string>(initialChapter?.educationLevel || 'School');
  const [classOrCourse, setClassOrCourse] = useState<string>(
    initialChapter?.classOrCourse || (educationLevel === 'School' ? 'Class 10' : 'B.Com')
  );
  const [stream, setStream] = useState<string>(initialChapter?.stream || 'General');
  const [medium, setMedium] = useState<string>(initialChapter?.medium || 'Assamese');
  const [semester, setSemester] = useState<string>(initialChapter?.semester || '1st Semester');
  const [subject, setSubject] = useState<string>(initialChapter?.subject || 'General Science');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [groupId, setGroupId] = useState<string>(initialChapter?.groupId || '');

  // Chapter info
  const [chapterNumber, setChapterNumber] = useState<string>(initialChapter?.chapterNumber?.toString() || '1');
  const [title, setTitle] = useState<string>(initialChapter?.title || '');
  const [description, setDescription] = useState<string>(initialChapter?.description || '');
  const [published, setPublished] = useState<boolean>(initialChapter ? initialChapter.published : true);

  // Access Type & Dual Pricing (Original Price and Offer Price)
  const [accessType, setAccessType] = useState<'normal' | 'premium'>(
    initialChapter?.accessType || 'normal'
  );

  const initialOffer = initialChapter?.offerPrice !== undefined
    ? initialChapter.offerPrice
    : (initialChapter?.price !== undefined
        ? initialChapter.price
        : (initialChapter?.accessType === 'premium' ? 30 : 10));

  const initialOriginal = initialChapter?.originalPrice !== undefined
    ? initialChapter.originalPrice
    : (initialChapter?.accessType === 'premium' ? 50 : 20);

  const [originalPrice, setOriginalPrice] = useState<number | string>(initialOriginal);
  const [offerPrice, setOfferPrice] = useState<number | string>(initialOffer);

  const handleAccessTypeChange = (newType: 'normal' | 'premium') => {
    setAccessType(newType);
    if (newType === 'premium') {
      if ((Number(originalPrice) === 20 && Number(offerPrice) === 10) || !originalPrice || !offerPrice) {
        setOriginalPrice(50);
        setOfferPrice(30);
      }
    } else {
      if ((Number(originalPrice) === 50 && Number(offerPrice) === 30) || !originalPrice || !offerPrice) {
        setOriginalPrice(20);
        setOfferPrice(10);
      }
    }
  };

  // Complete Chapter-Level PDF Link (Single study note for the entire chapter)
  const [pdfUrl, setPdfUrl] = useState<string>(
    initialChapter?.pdfUrl || (initialChapter?.topics && (initialChapter.topics as any)[0]?.pdfUrl) || ''
  );

  // Topics (Organizing Video Lessons, Slides, Flashcards, and Quizzes)
  const [topics, setTopics] = useState<Topic[]>(
    initialChapter?.topics && initialChapter.topics.length > 0
      ? initialChapter.topics
      : [
          {
            id: `top-${Date.now()}-1`,
            chapterId: initialChapter?.id || '',
            topicName: 'Topic 1: Overview and Core Concepts',
            order: 1,
            videoUrl: '',
            videoAccess: 'premium',
            slidesUrl: '',
            slidesAccess: 'premium',
            flashcardsAccess: 'premium',
            quizAccess: 'premium',
            flashcards: [],
            quiz: []
          }
        ]
  );

  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sub-tab for topic content: 'media' (Video & Slides) | 'flashcards' | 'quiz'
  const [topicSubTab, setTopicSubTab] = useState<'media' | 'flashcards' | 'quiz'>('media');

  // Handle Education Level Change
  const handleEducationLevelChange = (newLevel: string) => {
    setEducationLevel(newLevel);
    if (newLevel === 'School') {
      setClassOrCourse(academicSettings.schoolClasses[0] || 'Class 10');
      setStream('General');
      setSubject(academicSettings.subjects['Class 10']?.[0] || 'General Science');
    } else {
      setClassOrCourse(academicSettings.collegeCourses[0] || 'B.Com');
      setStream('Commerce');
      setSubject(academicSettings.subjects['B.Com']?.[0] || 'Financial Accounting');
    }
  };

  // Handle Class / Course change
  const handleClassOrCourseChange = (newClass: string) => {
    setClassOrCourse(newClass);
    const availableSubjects = academicSettings.subjects[newClass] || [];
    if (availableSubjects.length > 0) {
      setSubject(availableSubjects[0]);
    }
  };

  // Add Topic
  const handleAddTopic = () => {
    const nextOrder = topics.length + 1;
    const newTopic: Topic = {
      id: `top-${Date.now()}-${nextOrder}`,
      chapterId: initialChapter?.id || '',
      topicName: `Topic ${nextOrder}: New Topic`,
      order: nextOrder,
      videoUrl: '',
      videoAccess: 'premium',
      slidesUrl: '',
      slidesAccess: 'premium',
      flashcardsAccess: 'premium',
      quizAccess: 'premium',
      flashcards: [],
      quiz: []
    };
    setTopics([...topics, newTopic]);
    setActiveTopicIndex(topics.length);
  };

  // Remove Topic
  const handleRemoveTopic = (idx: number) => {
    if (topics.length <= 1) {
      setError('At least one topic is required per chapter.');
      return;
    }
    const updated = topics.filter((_, i) => i !== idx).map((t, i) => ({ ...t, order: i + 1 }));
    setTopics(updated);
    setActiveTopicIndex(Math.max(0, idx - 1));
  };

  // Update current topic field
  const updateCurrentTopic = (field: keyof Topic, value: any) => {
    setTopics(prev => {
      const copy = [...prev];
      if (copy[activeTopicIndex]) {
        copy[activeTopicIndex] = { ...copy[activeTopicIndex], [field]: value };
      }
      return copy;
    });
  };

  // Flashcards helpers
  const handleAddFlashcard = () => {
    const cur = topics[activeTopicIndex];
    const newFc: FlashcardItem = {
      id: `fc-${Date.now()}-${(cur.flashcards || []).length + 1}`,
      question: '',
      answer: ''
    };
    updateCurrentTopic('flashcards', [...(cur.flashcards || []), newFc]);
  };

  const handleUpdateFlashcard = (fcIdx: number, field: 'question' | 'answer', value: string) => {
    const cur = topics[activeTopicIndex];
    const fcs = [...(cur.flashcards || [])];
    if (fcs[fcIdx]) {
      fcs[fcIdx] = { ...fcs[fcIdx], [field]: value };
      updateCurrentTopic('flashcards', fcs);
    }
  };

  const handleRemoveFlashcard = (fcIdx: number) => {
    const cur = topics[activeTopicIndex];
    const fcs = (cur.flashcards || []).filter((_, i) => i !== fcIdx);
    updateCurrentTopic('flashcards', fcs);
  };

  // Quiz helpers
  const handleAddQuizQuestion = () => {
    const cur = topics[activeTopicIndex];
    const newQ: QuizItem = {
      id: `qz-${Date.now()}-${(cur.quiz || []).length + 1}`,
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: ''
    };
    updateCurrentTopic('quiz', [...(cur.quiz || []), newQ]);
  };

  const handleUpdateQuiz = (qIdx: number, field: keyof QuizItem, value: any) => {
    const cur = topics[activeTopicIndex];
    const qs = [...(cur.quiz || [])];
    if (qs[qIdx]) {
      qs[qIdx] = { ...qs[qIdx], [field]: value };
      updateCurrentTopic('quiz', qs);
    }
  };

  const handleRemoveQuiz = (qIdx: number) => {
    const cur = topics[activeTopicIndex];
    const qs = (cur.quiz || []).filter((_, i) => i !== qIdx);
    updateCurrentTopic('quiz', qs);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalSubject = customSubject.trim() || subject;
    if (!title.trim()) {
      setError('Please provide a Chapter Title.');
      return;
    }
    if (!finalSubject.trim()) {
      setError('Please select or specify a Subject.');
      return;
    }

    const numOriginal = Number(originalPrice);
    const numOffer = Number(offerPrice);

    if (isNaN(numOriginal) || numOriginal < 0) {
      setError('Please enter a valid Original Price (₹).');
      return;
    }

    if (isNaN(numOffer) || numOffer < 0) {
      setError('Please enter a valid Offer Price (₹).');
      return;
    }

    if (numOffer > numOriginal) {
      setError('Offer Price cannot be greater than Original Price');
      return;
    }

    setSaving(true);
    const chapterId = initialChapter?.id || `chap-${Date.now()}`;

    const finalTopics: Topic[] = topics.map((t, idx) => ({
      ...t,
      chapterId,
      order: idx + 1
    }));

    const payload: Chapter = {
      id: chapterId,
      chapterId,
      title: title.trim(),
      chapterNumber: chapterNumber.trim() || '1',
      groupId: groupId ? groupId : undefined,
      description: description.trim(),
      educationLevel,
      classOrCourse,
      classLevel: classOrCourse,
      stream,
      medium,
      semester: educationLevel === 'College' ? semester : 'N/A',
      subject: finalSubject,
      subjectId: finalSubject,
      accessType,
      originalPrice: numOriginal,
      offerPrice: numOffer,
      price: numOffer, // Customer pays ONLY offerPrice
      pdfUrl: pdfUrl.trim(),
      topicsCount: finalTopics.length,
      topics: finalTopics,
      published,
      isActive: published,
      createdAt: initialChapter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save chapter.');
      setSaving(false);
    }
  };

  const currentTopic = topics[activeTopicIndex] || topics[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Edit Chapter Curriculum' : 'Add Chapter to Syllabus'}
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{educationLevel}</span>
                <span>•</span>
                <span>{classOrCourse}</span>
                <span>•</span>
                <span>{medium} Medium</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Academic Hierarchy */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Step 1: Academic Placement Hierarchy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Education Level */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Education Level</label>
                <select
                  value={educationLevel}
                  onChange={e => handleEducationLevelChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {academicSettings.educationLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Class or Course */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Class / Course</label>
                <select
                  value={classOrCourse}
                  onChange={e => handleClassOrCourseChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {(educationLevel === 'School' ? academicSettings.schoolClasses : academicSettings.collegeCourses).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Medium */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Language / Medium</label>
                <select
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {academicSettings.mediums.map(med => (
                    <option key={med} value={med}>{med} Medium</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stream */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Stream</label>
                <select
                  value={stream}
                  onChange={e => setStream(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {academicSettings.streams.map(str => (
                    <option key={str} value={str}>{str}</option>
                  ))}
                </select>
              </div>

              {/* Semester (for College) */}
              {educationLevel === 'College' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {academicSettings.semesters.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div className={educationLevel === 'College' ? '' : 'sm:col-span-2'}>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {(academicSettings.subjects[classOrCourse] || academicSettings.subjects[educationLevel] || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__custom">+ Custom Subject Name</option>
                </select>
              </div>
            </div>

            {subject === '__custom' && (
              <div>
                <label className="block text-[11px] font-semibold text-amber-400 mb-1">Enter Custom Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Political Philosophy"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  required
                />
              </div>
            )}

            {/* Syllabus Group Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Syllabus Group (Optional Organization)</span>
                </span>
                {groupId ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Group Assigned
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">None</span>
                )}
              </label>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- No Group (Unassigned / General) --</option>
                {availableGroups
                  .filter(g => g.classOrCourse === classOrCourse && g.subject === subject)
                  .map(g => (
                    <option key={g.id} value={g.id}>
                      ★ {g.groupName} (#{g.order})
                    </option>
                  ))}
                {availableGroups.filter(g => !(g.classOrCourse === classOrCourse && g.subject === subject)).length > 0 && (
                  <optgroup label="Other Groups (Different Class or Subject)">
                    {availableGroups
                      .filter(g => !(g.classOrCourse === classOrCourse && g.subject === subject))
                      .map(g => (
                        <option key={g.id} value={g.id}>
                          {g.groupName} ({g.classOrCourse} • {g.subject})
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Assigning this chapter to a group arranges it under that group in the student curriculum view.
              </p>
            </div>
          </div>

          {/* Section 2: Chapter Details */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Step 2: Chapter Metadata</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Chapter No.</label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={chapterNumber}
                  onChange={e => setChapterNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Chapter Title (English / Assamese / Regional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chemical Reactions and Equations / ৰাসায়নিক বিক্ৰিয়া আৰু সমীকৰণ"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Chapter Syllabus Summary / Description</label>
              <textarea
                placeholder="Key concepts, learning outcomes, board guidelines covered..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2b: Admin-Controlled Access Type & Chapter Pricing */}
          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Step 2b: Chapter Access Type & Pricing Setting</span>
              </div>
              {accessType === 'premium' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                  <span>👑</span>
                  <span>Premium Chapter Badge Active</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <span>📄</span>
                  <span>Normal Chapter (No Badge)</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Access Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  Access Type:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleAccessTypeChange('normal')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      accessType === 'normal'
                        ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="text-base">📄</span>
                        <span>Normal</span>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        accessType === 'normal' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                      }`}>
                        {accessType === 'normal' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      No 👑 badge. Standard chapter containing PDF notes. Default ₹10.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccessTypeChange('premium')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      accessType === 'premium'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <span className="text-base">👑</span>
                        <span>Premium</span>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        accessType === 'premium' ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
                      }`}>
                        {accessType === 'premium' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Displays 👑 badge. Unlocks PDF, Video, Slides, Quiz. Default ₹30.
                    </p>
                  </button>
                </div>
              </div>

              {/* Dual Price Setting: Original Price and Offer Price */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Original Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Original Price (₹):</span>
                      <span className="text-[10px] font-normal text-slate-400">Reference / Display</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-black text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        value={originalPrice}
                        onChange={e => setOriginalPrice(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                        required
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Standard price before any discount.
                    </p>
                  </div>

                  {/* Offer Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span className="text-emerald-300 font-black">Offer Price (₹):</span>
                      <span className="text-[10px] font-bold text-emerald-400">Actual Payable</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-black text-emerald-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        value={offerPrice}
                        onChange={e => setOfferPrice(e.target.value)}
                        placeholder="e.g. 10"
                        className={`w-full bg-slate-900 border rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-emerald-300 font-black focus:outline-none ${
                          Number(offerPrice) > Number(originalPrice)
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                            : 'border-emerald-500/60 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30'
                        }`}
                        required
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-emerald-400/90 font-medium">
                      Customer pays ONLY this amount.
                    </p>
                  </div>
                </div>

                {/* Validation Error Banner */}
                {Number(offerPrice) > Number(originalPrice) && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span className="font-semibold">Offer Price cannot be greater than Original Price</span>
                  </div>
                )}

                {/* Customer View Live Preview */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-300 font-semibold">Customer UI Preview:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {accessType === 'premium' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        👑 Premium
                      </span>
                    )}
                    {Number(originalPrice) > Number(offerPrice) ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-400 line-through decoration-slate-400">
                          ₹{originalPrice}
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          ₹{offerPrice}
                        </span>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          Save {Math.round(((Number(originalPrice) - Number(offerPrice)) / (Number(originalPrice) || 1)) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-black text-emerald-400">
                        ₹{offerPrice}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 ml-1">
                      (Customer pays ₹{offerPrice}, NOT ₹{originalPrice})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2c: Complete Chapter PDF (Single Study Note for Chapter) */}
          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Step 2c: Complete Chapter PDF (Single Chapter-Level Study Note)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Chapter-Level Only
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Complete Chapter PDF Link (Google Drive Link):</span>
                </span>
                <span className="text-[10px] font-normal text-slate-400">Google Drive Preview / Embed Link</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../preview"
                  value={pdfUrl}
                  onChange={e => setPdfUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                The PDF is the complete study note for the entire Chapter. There is only one PDF link for the whole chapter; individual topics below organize video lessons, slides, flashcards, and quizzes.
              </p>
            </div>
          </div>

          {/* Section 3: Topics Management */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 3: Chapter Topics & Study Content ({topics.length})</span>
              </div>

              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Topic</span>
              </button>
            </div>

            {/* Topic Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {topics.map((top, idx) => (
                <button
                  key={top.id || idx}
                  type="button"
                  onClick={() => setActiveTopicIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                    activeTopicIndex === idx
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>#{idx + 1} {top.topicName || 'Untitled Topic'}</span>
                  {topics.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTopic(idx);
                      }}
                      className="hover:text-rose-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Current Topic Editor */}
            {currentTopic && (
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Topic Name</label>
                    <input
                      type="text"
                      value={currentTopic.topicName}
                      onChange={e => updateCurrentTopic('topicName', e.target.value)}
                      placeholder="e.g. Types of Chemical Reactions & Equations"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Sub-tabs: Video & Slides / Flashcards / Quiz */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setTopicSubTab('media')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      topicSubTab === 'media'
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>Video & Slides</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTopicSubTab('flashcards')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      topicSubTab === 'flashcards'
                        ? 'bg-slate-800 text-amber-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Flashcards ({(currentTopic.flashcards || []).length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTopicSubTab('quiz')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      topicSubTab === 'quiz'
                        ? 'bg-slate-800 text-purple-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Quiz Questions ({(currentTopic.quiz || []).length})</span>
                  </button>
                </div>

                {/* SubTab 1: Video & Slides for this Topic */}
                {topicSubTab === 'media' && (
                  <div className="space-y-4 pt-1">
                    {/* Video Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-amber-400" />
                          <span>Video Lesson Link (Google Drive / YouTube Embed)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/embed/... or Drive video preview link"
                          value={currentTopic.videoUrl || ''}
                          onChange={e => updateCurrentTopic('videoUrl', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Access Tier</label>
                        <select
                          value={currentTopic.videoAccess || 'premium'}
                          onChange={e => updateCurrentTopic('videoAccess', e.target.value as ContentAccessTier)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="premium">👑 Premium Only</option>
                          <option value="normal">Normal & Premium</option>
                        </select>
                      </div>
                    </div>

                    {/* Slides / Presentation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                          <Presentation className="w-3.5 h-3.5 text-blue-400" />
                          <span>Google Slides / Presentation Embed Link</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://docs.google.com/presentation/d/.../preview"
                          value={currentTopic.slidesUrl || ''}
                          onChange={e => updateCurrentTopic('slidesUrl', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Access Tier</label>
                        <select
                          value={currentTopic.slidesAccess || 'premium'}
                          onChange={e => updateCurrentTopic('slidesAccess', e.target.value as ContentAccessTier)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="premium">👑 Premium Only</option>
                          <option value="normal">Normal & Premium</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* SubTab 2: Flashcards */}
                {topicSubTab === 'flashcards' && (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-300">
                        Interactive flip cards for quick active recall test.
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFlashcard}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Card</span>
                      </button>
                    </div>

                    {(currentTopic.flashcards || []).length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                        No flashcards created for this topic yet. Click &quot;Add Card&quot; to add key questions and answers.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(currentTopic.flashcards || []).map((fc, fcIdx) => (
                          <div key={fc.id || fcIdx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="font-bold text-amber-400">Card #{fcIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFlashcard(fcIdx)}
                                className="text-slate-500 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Front (Question / Concept)..."
                              value={fc.question}
                              onChange={e => handleUpdateFlashcard(fcIdx, 'question', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                            <textarea
                              placeholder="Back (Answer / Explanation)..."
                              value={fc.answer}
                              onChange={e => handleUpdateFlashcard(fcIdx, 'answer', e.target.value)}
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SubTab 3: Quiz Questions */}
                {topicSubTab === 'quiz' && (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-300">
                        Practice MCQs with instantaneous student self-assessment and feedback.
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuizQuestion}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {(currentTopic.quiz || []).length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                        No quiz questions created yet. Click &quot;Add Question&quot; to build chapter tests.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(currentTopic.quiz || []).map((qz, qIdx) => (
                          <div key={qz.id || qIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-400 text-xs">Question #{qIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuiz(qIdx)}
                                className="text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <input
                              type="text"
                              placeholder="Enter quiz question..."
                              value={qz.question}
                              onChange={e => handleUpdateQuiz(qIdx, 'question', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 font-bold">Option A</label>
                                <input
                                  type="text"
                                  value={qz.optionA}
                                  onChange={e => handleUpdateQuiz(qIdx, 'optionA', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-bold">Option B</label>
                                <input
                                  type="text"
                                  value={qz.optionB}
                                  onChange={e => handleUpdateQuiz(qIdx, 'optionB', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-bold">Option C</label>
                                <input
                                  type="text"
                                  value={qz.optionC}
                                  onChange={e => handleUpdateQuiz(qIdx, 'optionC', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-bold">Option D</label>
                                <input
                                  type="text"
                                  value={qz.optionD}
                                  onChange={e => handleUpdateQuiz(qIdx, 'optionD', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center pt-1">
                              <div>
                                <label className="text-[10px] text-emerald-400 font-bold block mb-1">Correct Answer</label>
                                <select
                                  value={qz.correctAnswer}
                                  onChange={e => handleUpdateQuiz(qIdx, 'correctAnswer', e.target.value as 'A' | 'B' | 'C' | 'D')}
                                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none"
                                >
                                  <option value="A">Option A</option>
                                  <option value="B">Option B</option>
                                  <option value="C">Option C</option>
                                  <option value="D">Option D</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] text-slate-400 font-bold block mb-1">Explanation (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="Why is this correct?"
                                  value={qz.explanation || ''}
                                  onChange={e => handleUpdateQuiz(qIdx, 'explanation', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Publishing Toggle */}
          <div className="flex items-center gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <input
              type="checkbox"
              id="publishedChapter"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="publishedChapter" className="text-xs text-slate-300 font-medium cursor-pointer">
              Publish chapter immediately to students in the catalog
            </label>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isEditing ? 'Update Chapter' : 'Save Chapter to Firestore'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
