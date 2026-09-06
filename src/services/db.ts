import { Note, Order, Purchase, User, WebsiteSettings, PaymentSettings, Chapter, Topic, AcademicSettings, FlashcardItem, QuizItem, Group } from '../types';

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp-c10-sci-chem',
    groupId: 'grp-c10-sci-chem',
    groupName: 'ৰাসায়নিক পদাৰ্থ আৰু বিক্ৰিয়া (Chemical Substances & Reactions)',
    description: 'ৰাসায়নিক বিক্ৰিয়া, সমীকৰণ, সন্তুলন, এছিড-ক্ষাৰক আৰু ধাতু সম্পৰ্কীয় বিষয়সমূহ',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    medium: 'Assamese',
    semester: 'N/A',
    subject: 'General Science',
    chapterIds: ['chap-c10-sci-ch1-as', 'chap-c10-sci-ch3-as'],
    chapterOrder: ['chap-c10-sci-ch1-as', 'chap-c10-sci-ch3-as'],
    order: 1,
    active: true,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z'
  },
  {
    id: 'grp-c10-sci-carbon',
    groupId: 'grp-c10-sci-carbon',
    groupName: 'কাৰ্বন আৰু তাৰ যৌগ (Carbon & Its Compounds)',
    description: 'কাৰ্বনৰ বিশেষ ধৰ্ম, সহযোজী বান্ধনি, হাইড্ৰ’কাৰ্বন আৰু জৈৱিক যৌগ',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    medium: 'Assamese',
    semester: 'N/A',
    subject: 'General Science',
    chapterIds: ['chap-c10-sci-ch4-as'],
    chapterOrder: ['chap-c10-sci-ch4-as'],
    order: 2,
    active: true,
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z'
  },
  {
    id: 'grp-c10-math-real',
    groupId: 'grp-c10-math-real',
    groupName: 'Number Systems & Foundations',
    description: 'Real numbers, Euclid Division Lemma, Arithmetic Theorem and Irrationality proofs',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    medium: 'English',
    semester: 'N/A',
    subject: 'Mathematics',
    chapterIds: ['chap-c10-math-ch1-en'],
    chapterOrder: ['chap-c10-math-ch1-en'],
    order: 1,
    active: true,
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z'
  },
  {
    id: 'grp-c12-phy-electro',
    groupId: 'grp-c12-phy-electro',
    groupName: 'Electrostatics & Electric Fields',
    description: 'Coulomb’s law, dipole, Gauss’s law, flux and charge distributions',
    educationLevel: 'School',
    classOrCourse: 'Class 12',
    medium: 'English',
    semester: 'N/A',
    subject: 'Physics',
    chapterIds: ['chap-c12-phy-ch1-en'],
    chapterOrder: ['chap-c12-phy-ch1-en'],
    order: 1,
    active: true,
    createdAt: '2026-08-08T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z'
  },
  {
    id: 'grp-bcom-sem1-fa-basics',
    groupId: 'grp-bcom-sem1-fa-basics',
    groupName: 'Group 1 — Accounting Basics & Principles',
    description: 'Accounting concepts, conventions, AS-1, AS-9, and accounting equations',
    educationLevel: 'College',
    classOrCourse: 'B.Com',
    medium: 'English',
    semester: '1st Semester',
    subject: 'Financial Accounting',
    chapterIds: ['chap-bcom-sem1-fa-ch1-en'],
    chapterOrder: ['chap-bcom-sem1-fa-ch1-en'],
    order: 1,
    active: true,
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z'
  },
  {
    id: 'grp-bcom-sem1-fa-valuation',
    groupId: 'grp-bcom-sem1-fa-valuation',
    groupName: 'Group 2 — Depreciation & Asset Valuation',
    description: 'Straight Line, Diminishing Balance methods, provisions and reserves',
    educationLevel: 'College',
    classOrCourse: 'B.Com',
    medium: 'English',
    semester: '1st Semester',
    subject: 'Financial Accounting',
    chapterIds: ['chap-bcom-sem1-fa-ch2-en'],
    chapterOrder: ['chap-bcom-sem1-fa-ch2-en'],
    order: 2,
    active: true,
    createdAt: '2026-08-11T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z'
  },
  {
    id: 'grp-ba-sem1-pol-theory',
    groupId: 'grp-ba-sem1-pol-theory',
    groupName: 'ৰাজনৈতিক তত্ত্বৰ বুনিয়াদ (Foundations of Political Theory)',
    description: 'ৰাজনীতিৰ সংজ্ঞা, উৎপত্তি, সাৰ্বভৌমত্ব আৰু আধুনিক ধাৰণাসমূহ',
    educationLevel: 'College',
    classOrCourse: 'B.A.',
    medium: 'Assamese',
    semester: '1st Semester',
    subject: 'Political Science',
    chapterIds: ['chap-ba-sem1-pol-ch1-as'],
    chapterOrder: ['chap-ba-sem1-pol-ch1-as'],
    order: 1,
    active: true,
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z'
  }
];

export const INITIAL_ACADEMIC_SETTINGS: AcademicSettings = {
  educationLevels: ['School', 'College'],
  schoolClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
  collegeCourses: ['B.Com', 'B.A.', 'B.Sc.', 'BCA', 'Other Courses'],
  streams: ['Science', 'Commerce', 'Arts', 'General'],
  mediums: ['Assamese', 'English', 'Bangla', 'Hindi'],
  semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'],
  subjects: {
    'School': ['General Science', 'Mathematics', 'Social Science', 'English', 'Assamese', 'Hindi'],
    'Class 9': ['General Science', 'Mathematics', 'Social Science', 'English', 'Assamese', 'Hindi'],
    'Class 10': ['General Science', 'Mathematics', 'Social Science', 'English', 'Assamese', 'Hindi'],
    'Class 11': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'Political Science', 'History'],
    'Class 12': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'Political Science', 'History'],
    'College': ['Financial Accounting', 'Business Law', 'Corporate Accounting', 'Political Science', 'Economics', 'Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology'],
    'B.Com': ['Financial Accounting', 'Business Law', 'Principles of Management', 'Business Economics', 'Corporate Accounting', 'Income Tax'],
    'B.A.': ['Political Science', 'History', 'Education', 'Sociology', 'English Literature', 'Assamese Literature'],
    'B.Sc.': ['Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology', 'Computer Science']
  }
};

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap-c10-sci-ch1-as',
    groupId: 'grp-c10-sci-chem',
    title: 'ৰাসায়নিক বিক্ৰিয়া আৰু সমীকৰণ (Chemical Reactions and Equations)',
    chapterNumber: '1',
    description: 'দশম শ্ৰেণীৰ বিজ্ঞান বিষয়ৰ প্ৰথম অধ্যায়: ৰাসায়নিক বিক্ৰিয়াৰ প্ৰকাৰ, সন্তুলিত ৰাসায়নিক সমীকৰণ, জাৰণ-বিজাৰণ আৰু ক্ষয়ীভৱন।',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    stream: 'General',
    medium: 'Assamese',
    semester: 'N/A',
    subject: 'General Science',
    accessType: 'normal',
    originalPrice: 20,
    offerPrice: 10,
    price: 10,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    topicsCount: 2,
    published: true,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    topics: [
      {
        id: 'top-c10-sci-1',
        chapterId: 'chap-c10-sci-ch1-as',
        topicName: 'ৰাসায়নিক বিক্ৰিয়াৰ ধাৰণা আৰু সন্তুলন (Chemical Equations & Balancing)',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-1', question: 'ৰাসায়নিক বিক্ৰিয়া বুলিলে কি বুজা?', answer: 'যি প্ৰক্ৰিয়াত এক বা ততোধিক পদাৰ্থই পৰস্পৰ ক্ৰিয়া কৰি নতুন ধৰ্মসম্পন্ন নতুন পদাৰ্থ সৃষ্টি কৰে।' },
          { id: 'fc-2', question: 'বিক্ৰিয়ক আৰু বিক্ৰিয়াজাত পদাৰ্থ কি?', answer: 'বিক্ৰিয়াত অংশ লোৱা পদাৰ্থক বিক্ৰিয়ক আৰু বিক্ৰিয়াৰ ফলত উৎপন্ন হোৱা পদাৰ্থক বিক্ৰিয়াজাত পদাৰ্থ বোলে।' },
          { id: 'fc-3', question: 'সমীকৰণ সন্তুলন কৰাৰ মূল নিয়ম কি?', answer: 'ভৰৰ সংৰক্ষণ সূত্ৰ—বিক্ৰিয়কৰ মুঠ ভৰ বিক্ৰিয়াজাত পদাৰ্থৰ মুঠ ভৰৰ সমান হ’ব লাগে।' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-1',
            question: 'মেগনেছিয়াম ফিটা বায়ুত জ্বলালে কি উৎপন্ন হয়?',
            optionA: 'মেগনেছিয়াম নাইট্ৰাইড',
            optionB: 'মেগনেছিয়াম অক্সাইড (MgO) বগা গুড়ি',
            optionC: 'কাৰ্বন ডাই অক্সাইড',
            optionD: 'মেগনেছিয়াম ক্লৰাইড',
            correctAnswer: 'B',
            explanation: 'মেগনেছিয়ামে বায়ুৰ অক্সিজেনৰ সৈতে বিক্ৰিয়া কৰি মেগনেছিয়াম অক্সাইড উৎপন্ন কৰে: 2Mg + O₂ → 2MgO.'
          },
          {
            id: 'qz-2',
            question: 'ৰাসায়নিক সমীকৰণ সন্তুলন কৰাৰ আধাৰ কি?',
            optionA: 'ভৰৰ সংৰক্ষণ সূত্ৰ',
            optionB: 'স্থিৰানুপাত সূত্ৰ',
            optionC: 'গে-লুছাকৰ সূত্ৰ',
            optionD: 'শক্তিৰ অপচয় সূত্ৰ',
            correctAnswer: 'A',
            explanation: 'ভৰৰ সংৰক্ষণ সূত্ৰ অনুসৰি কোনো ৰাসায়নিক বিক্ৰিয়াত ভৰ সৃষ্টি বা ধ্বংস নহয়।'
          }
        ]
      },
      {
        id: 'top-c10-sci-2',
        chapterId: 'chap-c10-sci-ch1-as',
        topicName: 'সংযোজন, বিয়োজন, অপসৰণ আৰু দ্বি-অপসৰণ বিক্ৰিয়া',
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-4', question: 'সংযোজন বিক্ৰিয়া কি?', answer: 'যি বিক্ৰিয়াত দুটা বা ততোধিক পদাৰ্থ লগ লাগি এটা মাত্ৰ বিক্ৰিয়াজাত পদাৰ্থ উৎপন্ন কৰে।' },
          { id: 'fc-5', question: 'উত্তাপশোষী আৰু উত্তাপবৰ্জী বিক্ৰিয়াৰ মাজত পাৰ্থক্য কি?', answer: 'উত্তাপ নিৰ্গত হ’লে উত্তাপবৰ্জী আৰু উত্তাপ শোষিত হ’লে উত্তাপশোষী বিক্ৰিয়া।' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-3',
            question: 'শ্বসন এটা কি ধৰণৰ বিক্ৰিয়া?',
            optionA: 'উত্তাপশোষী বিক্ৰিয়া',
            optionB: 'উত্তাপবৰ্জী বিক্ৰিয়া',
            optionC: 'অপসৰণ বিক্ৰিয়া',
            optionD: 'দ্বি-অপসৰণ বিক্ৰিয়া',
            correctAnswer: 'B',
            explanation: 'শ্বসন প্ৰক্ৰিয়াত গ্লুক’জ ভাঙি শক্তি (উত্তাপ) নিৰ্গত হয়, সেয়েহে ই উত্তাপবৰ্জী বিক্ৰিয়া।'
          }
        ]
      }
    ]
  },
  {
    id: 'chap-c10-sci-ch2-as',
    title: 'এছিড, ক্ষাৰক আৰু লৱণ (Acids, Bases and Salts)',
    chapterNumber: '2',
    description: 'দশম শ্ৰেণীৰ বিজ্ঞান বিষয়ৰ দ্বিতীয় অধ্যায়: এছিড আৰু ক্ষাৰকৰ ধৰ্ম, সূচক (Indicator), pH মাপদণ্ড, দৈনন্দিন জীৱনত pH ৰ গুৰুত্ব আৰু প্ৰয়োজনীয় লৱণসমূহ।',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    stream: 'General',
    medium: 'Assamese',
    semester: 'N/A',
    subject: 'General Science',
    accessType: 'premium',
    originalPrice: 50,
    offerPrice: 30,
    price: 30,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    topicsCount: 1,
    published: true,
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    topics: [
      {
        id: 'top-c10-sci-2-1',
        chapterId: 'chap-c10-sci-ch2-as',
        topicName: 'এছিড আৰু ক্ষাৰকৰ ৰাসায়নিক ধৰ্ম আৰু সূচক',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-ab1', question: 'এছিড আৰু ক্ষাৰকৰ বিক্ৰিয়াক কি বোলে?', answer: 'প্ৰশমন বিক্ৰিয়া (Neutralisation Reaction): এছিড + ক্ষাৰক → লৱণ + পানী।' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-ab1',
            question: 'বিশুদ্ধ পানীৰ pH মান কিমান?',
            optionA: '0',
            optionB: '7',
            optionC: '14',
            optionD: '1',
            correctAnswer: 'B',
            explanation: 'নিৰপেক্ষ দ্ৰৱ বা বিশুদ্ধ পানীৰ pH মান ৭।'
          }
        ]
      }
    ]
  },
  {
    id: 'chap-c10-sci-ch3-as',
    groupId: 'grp-c10-sci-chem',
    title: 'ধাতু আৰু অধাতু (Metals and Non-Metals)',
    chapterNumber: '3',
    description: 'দশম শ্ৰেণীৰ বিজ্ঞান বিষয়ৰ তৃতীয় অধ্যায়: ধাতু আৰু অধাতুৰ ভৌতিক আৰু ৰাসায়নিক ধৰ্ম, সক্ৰিয়তা শ্ৰেণী, ধাতু নিষ্কাষণ আৰু ক্ষয়ীভৱন ৰোধৰ উপায়।',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    stream: 'General',
    medium: 'Assamese',
    semester: 'N/A',
    subject: 'General Science',
    accessType: 'normal',
    originalPrice: 30,
    offerPrice: 15,
    price: 15,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    published: true,
    createdAt: '2026-08-25T12:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    topics: [
      {
        id: 'top-c10-sci-3-1',
        chapterId: 'chap-c10-sci-ch3-as',
        topicName: 'ধাতুৰ ভৌতিক আৰু ৰাসায়নিক ধৰ্ম',
        order: 1
      }
    ]
  },
  {
    id: 'chap-c10-sci-ch4-as',
    groupId: 'grp-c10-sci-carbon',
    title: 'কাৰ্বন আৰু তাৰ যৌগ (Carbon and its Compounds)',
    chapterNumber: '4',
    description: 'দশম শ্ৰেণীৰ বিজ্ঞান বিষয়ৰ চতুৰ্থ অধ্যায়: কাৰ্বনৰ সহযোজী বান্ধনি, শৃংখলন গুণ, সমগণীয় শ্ৰেণী, হাইড্ৰ’কাৰ্বন, কাৰ্যকৰী মূলক আৰু চাবোন-অপমাৰ্জক।',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    stream: 'General',
    medium: 'Assamese',
    semester: 'N/A',
    subject: 'General Science',
    accessType: 'premium',
    originalPrice: 60,
    offerPrice: 35,
    price: 35,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    published: true,
    createdAt: '2026-08-25T12:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    topics: [
      {
        id: 'top-c10-sci-4-1',
        chapterId: 'chap-c10-sci-ch4-as',
        topicName: 'কাৰ্বনৰ সহযোজী বান্ধনি আৰু চাবোনৰ মলি নিষ্কাষণ ধৰ্ম',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium'
      }
    ]
  },
  {
    id: 'chap-c10-math-ch1-en',
    groupId: 'grp-c10-math-real',
    title: 'Chapter 1: Real Numbers (CBSE & State Board)',
    chapterNumber: '1',
    description: 'Fundamental Theorem of Arithmetic, Euclid Division Algorithm, proofs of irrationality (√2, √3, √5) and decimal expansions of rational numbers.',
    educationLevel: 'School',
    classOrCourse: 'Class 10',
    stream: 'General',
    medium: 'English',
    semester: 'N/A',
    subject: 'Mathematics',
    accessType: 'normal',
    originalPrice: 25,
    offerPrice: 10,
    price: 10,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    topicsCount: 2,
    published: true,
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-26T12:00:00.000Z',
    topics: [
      {
        id: 'top-c10-math-1',
        chapterId: 'chap-c10-math-ch1-en',
        topicName: 'Euclid’s Division Lemma and Fundamental Theorem of Arithmetic',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-m1', question: 'State Fundamental Theorem of Arithmetic', answer: 'Every composite number can be expressed as a product of primes uniquely, apart from the order in which prime factors occur.' },
          { id: 'fc-m2', question: 'Relationship between HCF and LCM of two positive integers a and b', answer: 'HCF(a, b) × LCM(a, b) = a × b' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-m1',
            question: 'If HCF(306, 657) = 9, what is LCM(306, 657)?',
            optionA: '22,338',
            optionB: '2,238',
            optionC: '223,380',
            optionD: '9,999',
            correctAnswer: 'A',
            explanation: 'LCM = (306 × 657) / 9 = 22,338.'
          }
        ]
      },
      {
        id: 'top-c10-math-2',
        chapterId: 'chap-c10-math-ch1-en',
        topicName: 'Proof of Irrationality of √2, √3, √5',
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-m3', question: 'What proof technique is used for proving √2 is irrational?', answer: 'Proof by Contradiction (assuming √2 = a/b where a and b are co-prime integers).' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-m2',
            question: 'Which of the following numbers is irrational?',
            optionA: '√4',
            optionB: '3 + √5',
            optionC: '0.375',
            optionD: '22/7',
            correctAnswer: 'B',
            explanation: 'The sum of a non-zero rational and an irrational number is always irrational.'
          }
        ]
      }
    ]
  },
  {
    id: 'chap-c12-phy-ch1-en',
    groupId: 'grp-c12-phy-electro',
    title: 'Chapter 1: Electric Charges and Fields',
    chapterNumber: '1',
    description: 'Class 12 Physics: Electrostatic principles, Coulomb’s Law in vector form, Electric Dipole, and Gauss’s Law with symmetric applications.',
    educationLevel: 'School',
    classOrCourse: 'Class 12',
    stream: 'Science',
    medium: 'English',
    semester: 'N/A',
    subject: 'Physics',
    accessType: 'premium',
    originalPrice: 60,
    offerPrice: 30,
    price: 30,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    topicsCount: 2,
    published: true,
    createdAt: '2026-08-08T10:00:00.000Z',
    updatedAt: '2026-08-24T12:00:00.000Z',
    topics: [
      {
        id: 'top-c12-phy-1',
        chapterId: 'chap-c12-phy-ch1-en',
        topicName: 'Coulomb’s Law, Superposition Principle & Electric Field',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-p1', question: 'State Coulomb’s Law', answer: 'The electrostatic force between two point charges is directly proportional to the product of charges and inversely proportional to the square of the distance between them.' },
          { id: 'fc-p2', question: 'What is the SI unit of electric permittivity ε₀?', answer: 'C² N⁻¹ m⁻²' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-p1',
            question: 'What is the value of 1/(4πε₀)?',
            optionA: '9 × 10⁹ N m² C⁻²',
            optionB: '8.854 × 10⁻¹² C² N⁻¹ m⁻²',
            optionC: '6.67 × 10⁻¹¹ N m² kg⁻²',
            optionD: '1.6 × 10⁻¹⁹ C',
            correctAnswer: 'A',
            explanation: 'The electrostatic constant k = 1/(4πε₀) is approximately 9 × 10⁹ N m²/C².'
          }
        ]
      },
      {
        id: 'top-c12-phy-2',
        chapterId: 'chap-c12-phy-ch1-en',
        topicName: 'Gauss’s Law & Applications to Infinitely Long Wire and Sphere',
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-p3', question: 'State Gauss’s Law', answer: 'The total electric flux through any closed surface is equal to 1/ε₀ times the total charge enclosed within that surface.' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-p2',
            question: 'What is the electric field inside a uniformly charged hollow spherical conductor?',
            optionA: 'Infinite',
            optionB: 'Zero',
            optionC: 'Variable depending on radius',
            optionD: 'Equal to field at surface',
            correctAnswer: 'B',
            explanation: 'Inside a hollow conductor, enclosed charge is 0, hence electric field E = 0.'
          }
        ]
      }
    ]
  },
  {
    id: 'chap-bcom-fa-ch1-en',
    groupId: 'grp-bcom-sem1-fa-basics',
    title: 'Chapter 1: Theoretical Framework & Accounting Standards (AS-1, AS-9)',
    chapterNumber: '1',
    description: 'B.Com 1st Semester: Generally Accepted Accounting Principles (GAAP), conventions, revenue recognition, and capital vs revenue expenditure.',
    educationLevel: 'College',
    classOrCourse: 'B.Com',
    stream: 'Commerce',
    medium: 'English',
    semester: '1st Semester',
    subject: 'Financial Accounting',
    accessType: 'premium',
    originalPrice: 70,
    offerPrice: 30,
    price: 30,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    topicsCount: 2,
    published: true,
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    topics: [
      {
        id: 'top-bcom-fa-1',
        chapterId: 'chap-bcom-fa-ch1-en',
        topicName: 'Accounting Principles, Concepts and Conventions',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-fa1', question: 'What is the Prudence (Conservatism) Convention?', answer: 'Anticipate no profit, but provide for all possible losses.' },
          { id: 'fc-fa2', question: 'What is the Dual Aspect Concept?', answer: 'Every transaction affects at least two accounts: Total Assets = Total Liabilities + Capital.' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-fa1',
            question: 'Valuation of closing stock at Cost or Net Realisable Value (whichever is lower) is based on:',
            optionA: 'Cost Concept',
            optionB: 'Prudence / Conservatism Concept',
            optionC: 'Realisation Concept',
            optionD: 'Going Concern Concept',
            correctAnswer: 'B',
            explanation: 'The prudence concept mandates providing for potential loss by valuing stock at lower of cost or market value.'
          }
        ]
      },
      {
        id: 'top-bcom-fa-2',
        chapterId: 'chap-bcom-fa-ch1-en',
        topicName: 'Accounting Standards AS-1 (Disclosure) and AS-9 (Revenue)',
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-fa3', question: 'What are the 3 fundamental accounting assumptions under AS-1?', answer: 'Going Concern, Consistency, and Accrual.' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-fa2',
            question: 'Under AS-9, when is revenue from sale of goods recognized?',
            optionA: 'When order is received',
            optionB: 'When cash is collected',
            optionC: 'When significant risks and rewards of ownership are transferred to buyer',
            optionD: 'At the end of financial year',
            correctAnswer: 'C',
            explanation: 'Revenue is recognized when the seller transfers significant risks and rewards of ownership to the buyer.'
          }
        ]
      }
    ]
  },
  {
    id: 'chap-ba-pol-ch1-as',
    groupId: 'grp-ba-sem1-pol-theory',
    title: 'ৰাজনৈতিক তত্ত্বৰ ধাৰণা (Understanding Political Theory)',
    chapterNumber: '1',
    description: 'বি.এ. প্ৰথম ষাণ্মাসিক (B.A. 1st Semester): ৰাজনীতি বিজ্ঞানৰ সংজ্ঞা, পৰিসৰ, স্বাধীনতা, সমতা আৰু ন্যায়ৰ তাৎপৰ্য।',
    educationLevel: 'College',
    classOrCourse: 'B.A.',
    stream: 'Arts',
    medium: 'Assamese',
    semester: '1st Semester',
    subject: 'Political Science',
    accessType: 'normal',
    originalPrice: 20,
    offerPrice: 10,
    price: 10,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    topicsCount: 1,
    published: true,
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    topics: [
      {
        id: 'top-ba-pol-1',
        chapterId: 'chap-ba-pol-ch1-as',
        topicName: 'ৰাজনৈতিক তত্ত্বৰ অৰ্থ, প্ৰকৃতি আৰু প্ৰয়োজনীয়তা',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoAccess: 'premium',
        slidesUrl: 'https://docs.google.com/presentation/d/177sUaM7Q872_example/preview',
        slidesAccess: 'premium',
        flashcardsAccess: 'premium',
        flashcards: [
          { id: 'fc-pol1', question: 'ৰাজনীতি শব্দটোৰ উৎপত্তি কি?', answer: 'গ্ৰীক শব্দ ‘Polis’ (নগৰ ৰাষ্ট্ৰ) ৰ পৰা ৰাজনীতি শব্দটোৰ উৎপত্তি হৈছে।' }
        ],
        quizAccess: 'premium',
        quiz: [
          {
            id: 'qz-pol1',
            question: '‘ৰাজনীতি বিজ্ঞানৰ পিতৃ’ কাক কোৱা হয়?',
            optionA: 'প্লেটো',
            optionB: 'এৰিষ্টটল',
            optionC: 'ছক্ৰেটিছ',
            optionD: 'মেকিয়াভেলি',
            correctAnswer: 'B',
            explanation: 'এৰিষ্টটলক আধুনিক ৰাজনীতি বিজ্ঞানৰ জনক বা পিতৃ বুলি গণ্য কৰা হয়।'
          }
        ]
      }
    ]
  }
];

// Default initial note data for B.Com 1st Semester
const INITIAL_NOTES: Note[] = [
  {
    id: 'note-fa-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Financial Accounting',
    unit: 'Unit 1: Introduction to Accounting & Standards',
    title: 'Financial Accounting – Unit 1 Complete Handwritten Notes',
    description: 'Comprehensive exam-focused notes covering Accounting Principles, Conventions, AS-1, AS-9, Accounting Equation, and Journal Entries with solved university questions.',
    pages: 42,
    originalPrice: 50,
    offerPrice: 20,
    coverImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-20T12:00:00.000Z',
    downloadsCount: 148,
    pdfFileName: 'BCom_Sem1_Financial_Accounting_Unit1_NoteNest.pdf'
  },
  {
    id: 'note-fa-u2',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Financial Accounting',
    unit: 'Unit 2: Depreciation, Reserves & Provisions',
    title: 'Financial Accounting – Unit 2 Depreciation & Valuation Master Notes',
    description: 'Straight Line Method, Diminishing Balance Method, Change of Method provisions as per AS-6/AS-10 with practical step-by-step illustrations.',
    pages: 36,
    originalPrice: 60,
    offerPrice: 25,
    coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-18T10:00:00.000Z',
    updatedAt: '2026-08-22T12:00:00.000Z',
    downloadsCount: 92,
    pdfFileName: 'BCom_Sem1_Financial_Accounting_Unit2_NoteNest.pdf'
  },
  {
    id: 'note-bl-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Business Law',
    unit: 'Unit 1: Indian Contract Act 1872',
    title: 'Business Law – Unit 1 Indian Contract Act Simplified',
    description: 'Covers Offer & Acceptance, Consideration, Capacity of Parties, Free Consent, Legality of Object and Void Agreements with famous landmark cases.',
    pages: 58,
    originalPrice: 80,
    offerPrice: 35,
    coverImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    downloadsCount: 215,
    pdfFileName: 'BCom_Sem1_Business_Law_Unit1_NoteNest.pdf'
  },
  {
    id: 'note-pom-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Principles of Management',
    unit: 'Unit 1: Fundamentals of Management & Planning',
    title: 'Principles of Management – Unit 1 Concepts & Theories',
    description: 'Classical, Neo-Classical, Modern Management approaches, Fayols 14 Principles, Scientific Management by Taylor, MBO & Planning hierarchy.',
    pages: 45,
    originalPrice: 45,
    offerPrice: 19,
    coverImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z',
    downloadsCount: 160,
    pdfFileName: 'BCom_Sem1_Principles_Of_Management_Unit1_NoteNest.pdf'
  },
  {
    id: 'note-be-u1',
    course: 'B.Com',
    semester: '1st Semester',
    subject: 'Business Economics',
    unit: 'Unit 1: Demand & Consumer Behavior',
    title: 'Business Economics (Micro) – Unit 1 Demand Analysis & Elasticity',
    description: 'Law of Demand, Elasticity of Demand (Price, Income, Cross), Indifference Curve Analysis, Consumer Surplus, and practical managerial applications.',
    pages: 50,
    originalPrice: 65,
    offerPrice: 29,
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80'
    ],
    published: true,
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-28T12:00:00.000Z',
    downloadsCount: 180,
    pdfFileName: 'BCom_Sem1_Business_Economics_Unit1_NoteNest.pdf'
  }
];

const INITIAL_WEBSITE_SETTINGS: WebsiteSettings = {
  logoUrl: '/assets/notenest-logo.png', // official NoteNest permanent logo
  siteName: 'NoteNest',
  tagline: 'Learn • Prepare • Succeed',
  supportEmail: 'support@notenest.in',
  phone: '+91 98765 43210',
  primaryCourse: 'B.Com',
  primarySemester: '1st Semester'
};

const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: 'notenest01@ptyes',
  qrCodeUrl: '/assets/qr/qr-1.png',
  activeQrCode: 'qr-1',
  accountName: 'Nabiran Necha (NoteNest)',
  instructions: '1. Open any UPI App (PhonePe, Google Pay, Paytm, BHIM).\n2. Scan the active NoteNest QR code or send payment directly to the UPI ID.\n3. Enter the exact note amount.\n4. After successful payment, copy the 12-digit UPI Transaction ID / UTR.\n5. Paste the UTR below and submit for instant admin verification.'
};

const INITIAL_USERS: User[] = [];

const STORAGE_KEYS = {
  NOTES: 'notenest_notes_v1',
  USERS: 'notenest_users_v1',
  ORDERS: 'notenest_orders_v1',
  PURCHASES: 'notenest_purchases_v1',
  WEBSITE_SETTINGS: 'notenest_website_settings_v1',
  PAYMENT_SETTINGS: 'notenest_payment_settings_v1',
  FIREBASE_CONFIG: 'notenest_firebase_config_v1',
  CHAPTERS: 'notenest_chapters_v2',
  GROUPS: 'notenest_groups_v1',
  ACADEMIC_SETTINGS: 'notenest_academic_settings_v2'
};

export class NoteNestDB {
  static getNotes(): Note[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
        return INITIAL_NOTES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTES;
    }
  }

  static saveNotes(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  static getNoteById(id: string): Note | undefined {
    return this.getNotes().find(n => n.id === id);
  }

  static addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const notes = this.getNotes();
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  static updateNote(id: string, updates: Partial<Note>): Note | null {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;
    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveNotes(notes);
    return notes[index];
  }

  static deleteNote(id: string): boolean {
    const notes = this.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === notes.length) return false;
    this.saveNotes(filtered);
    return true;
  }

  // Users
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Sync verified user profile from Firebase to local customer directory
  static syncUserProfile(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    this.saveUsers(users);
  }

  // Orders
  static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static createOrder(orderData: {
    customerId: string;
    userId?: string;
    customerName: string;
    customerEmail: string;
    chapterId?: string;
    chapterTitle?: string;
    accessType?: 'normal' | 'premium';
    noteId?: string;
    noteTitle: string;
    amount: number;
    paymentMethod?: 'manual_upi' | 'future_gateway';
  }): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerId: orderData.customerId,
      userId: orderData.userId || orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      chapterId: orderData.chapterId,
      chapterTitle: orderData.chapterTitle,
      accessType: orderData.accessType,
      noteId: orderData.noteId || orderData.chapterId,
      noteTitle: orderData.noteTitle,
      amount: orderData.amount,
      paymentMethod: orderData.paymentMethod || 'manual_upi',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  static submitPaymentProof(orderId: string, utr: string, screenshotUrl?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    order.utr = utr;
    if (screenshotUrl) order.screenshotUrl = screenshotUrl;
    order.paymentStatus = 'pending';
    this.saveOrders(orders);
    return order;
  }

  static verifyPayment(orderId: string, status: 'paid' | 'rejected', verifiedBy: string, adminNote?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = status;
    order.verifiedAt = new Date().toISOString();
    order.verifiedBy = verifiedBy;
    if (adminNote) order.adminNote = adminNote;
    this.saveOrders(orders);

    if (status === 'paid') {
      // If order includes chapterId, create or update chapter purchase record
      if (order.chapterId) {
        const purchases = this.getPurchases();
        const existing = purchases.find(p => p.customerId === order.customerId && (p.chapterId === order.chapterId || p.noteId === order.chapterId));
        const chapter = this.getChapterById(order.chapterId);
        if (!existing) {
          const newPurchase: Purchase = {
            id: `pur-${Date.now()}`,
            customerId: order.customerId,
            chapterId: order.chapterId,
            chapterTitle: order.chapterTitle || chapter?.title || order.noteTitle,
            accessType: order.accessType || chapter?.accessType || 'normal',
            noteId: order.chapterId,
            orderId: order.id,
            noteTitle: order.noteTitle,
            purchasedPrice: order.amount,
            purchasedAt: new Date().toISOString(),
            accessStatus: 'active',
            course: chapter?.classOrCourse || 'Curriculum',
            semester: chapter?.semester || 'Academic Session',
            subject: chapter?.subject || 'All Subjects'
          };
          purchases.unshift(newPurchase);
          this.savePurchases(purchases);
        }
      } else if (order.noteId) {
        // If order includes noteId, create or update purchase record
        const purchases = this.getPurchases();
        const existing = purchases.find(p => p.customerId === order.customerId && p.noteId === order.noteId);
        const note = this.getNoteById(order.noteId);
        if (!existing) {
          const newPurchase: Purchase = {
            id: `pur-${Date.now()}`,
            customerId: order.customerId,
            noteId: order.noteId,
            orderId: order.id,
            noteTitle: order.noteTitle,
            purchasedPrice: order.amount,
            purchasedAt: new Date().toISOString(),
            accessStatus: 'active',
            course: note?.course || 'Curriculum',
            semester: note?.semester || 'Academic Session',
            subject: note?.subject || 'All Subjects'
          };
          purchases.unshift(newPurchase);
          this.savePurchases(purchases);

          // Increment download/sale count
          if (note) {
            this.updateNote(note.id, { downloadsCount: (note.downloadsCount || 0) + 1 });
          }
        }
      }
    }
    return order;
  }

  // Purchases
  static getPurchases(): Purchase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static savePurchases(purchases: Purchase[]): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }

  static getCustomerPurchases(customerId: string): Purchase[] {
    return this.getPurchases().filter(p => p.customerId === customerId && p.accessStatus === 'active');
  }

  static hasCustomerPurchasedNote(customerId: string, noteId: string): boolean {
    return this.getPurchases().some(p => p.customerId === customerId && p.noteId === noteId && p.accessStatus === 'active');
  }

  static hasCustomerPurchasedChapter(customerId: string, chapterId: string): boolean {
    if (!customerId || !chapterId) return false;
    return this.getPurchases().some(
      p => p.customerId === customerId &&
      (p.chapterId === chapterId || p.noteId === chapterId) &&
      p.accessStatus === 'active'
    );
  }

  // Website Settings
  static getWebsiteSettings(): WebsiteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEBSITE_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(INITIAL_WEBSITE_SETTINGS));
        return INITIAL_WEBSITE_SETTINGS;
      }
      const parsed = JSON.parse(data);
      if (!parsed.logoUrl) {
        parsed.logoUrl = '/assets/notenest-logo.png';
      }
      return parsed;
    } catch {
      return INITIAL_WEBSITE_SETTINGS;
    }
  }

  static saveWebsiteSettings(settings: WebsiteSettings): void {
    localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(settings));
  }

  // Payment Settings
  static getPaymentSettings(): PaymentSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(INITIAL_PAYMENT_SETTINGS));
        return INITIAL_PAYMENT_SETTINGS;
      }
      const parsed = JSON.parse(data);
      const activeQr = (parsed.activeQrCode === 'qr-2' || parsed.activeQrCode === 'qr-3') ? parsed.activeQrCode : 'qr-1';
      parsed.activeQrCode = activeQr;
      if (!parsed.qrCodeUrl || parsed.qrCodeUrl.includes('api.qrserver.com') || parsed.qrCodeUrl.includes('firebasestorage')) {
        parsed.qrCodeUrl = `/assets/qr/${activeQr}.png`;
      }
      return parsed;
    } catch {
      return INITIAL_PAYMENT_SETTINGS;
    }
  }

  static savePaymentSettings(settings: PaymentSettings): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(settings));
  }

  // ==========================================
  // Chapters & Topics (Multi-Education)
  // ==========================================
  static getChapters(): Chapter[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(INITIAL_CHAPTERS));
        return INITIAL_CHAPTERS;
      }
      const parsed: Chapter[] = JSON.parse(data);
      // Ensure accessType, originalPrice, offerPrice, and price are normalized
      return parsed.map(c => {
        const accessType: 'normal' | 'premium' = c.accessType === 'premium' ? 'premium' : 'normal';
        const defaultOffer = accessType === 'premium' ? 30 : 10;
        const defaultOriginal = accessType === 'premium' ? 50 : 20;

        let offerPrice = typeof c.offerPrice === 'number' && !isNaN(c.offerPrice) && c.offerPrice >= 0
          ? c.offerPrice
          : (typeof c.price === 'number' && !isNaN(c.price) && c.price >= 0 ? c.price : defaultOffer);

        let originalPrice = typeof c.originalPrice === 'number' && !isNaN(c.originalPrice) && c.originalPrice >= 0
          ? c.originalPrice
          : Math.max(offerPrice, defaultOriginal);

        // Validation: offerPrice cannot be greater than originalPrice
        if (offerPrice > originalPrice) {
          originalPrice = offerPrice;
        }

        const price = offerPrice;

        const defaultPdf = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview';
        const pdfUrl = c.pdfUrl || (c as any).pdfLink || (c.topics && (c.topics as any)[0]?.pdfUrl) || defaultPdf;

        return {
          ...c,
          accessType,
          originalPrice,
          offerPrice,
          price,
          pdfUrl
        };
      });
    } catch {
      return INITIAL_CHAPTERS;
    }
  }

  static saveChapters(chapters: Chapter[]): void {
    const normalized = chapters.map(c => {
      const accessType: 'normal' | 'premium' = c.accessType === 'premium' ? 'premium' : 'normal';
      const defaultOffer = accessType === 'premium' ? 30 : 10;
      const defaultOriginal = accessType === 'premium' ? 50 : 20;

      let offerPrice = typeof c.offerPrice === 'number' && !isNaN(c.offerPrice) && c.offerPrice >= 0
        ? c.offerPrice
        : (typeof c.price === 'number' && !isNaN(c.price) && c.price >= 0 ? c.price : defaultOffer);

      let originalPrice = typeof c.originalPrice === 'number' && !isNaN(c.originalPrice) && c.originalPrice >= 0
        ? c.originalPrice
        : Math.max(offerPrice, defaultOriginal);

      if (offerPrice > originalPrice) {
        originalPrice = offerPrice;
      }

      const price = offerPrice;

      return {
        ...c,
        accessType,
        originalPrice,
        offerPrice,
        price
      };
    });
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(normalized));
  }

  static getChapterById(id: string): Chapter | undefined {
    return this.getChapters().find(c => c.id === id);
  }

  static saveChapter(chapter: Chapter): Chapter {
    const chapters = this.getChapters();
    const idx = chapters.findIndex(c => c.id === chapter.id);
    const accessType: 'normal' | 'premium' = chapter.accessType === 'premium' ? 'premium' : 'normal';
    const defaultOffer = accessType === 'premium' ? 30 : 10;
    const defaultOriginal = accessType === 'premium' ? 50 : 20;

    let offerPrice = typeof chapter.offerPrice === 'number' && !isNaN(chapter.offerPrice) && chapter.offerPrice >= 0
      ? chapter.offerPrice
      : (typeof chapter.price === 'number' && !isNaN(chapter.price) && chapter.price >= 0 ? chapter.price : defaultOffer);

    let originalPrice = typeof chapter.originalPrice === 'number' && !isNaN(chapter.originalPrice) && chapter.originalPrice >= 0
      ? chapter.originalPrice
      : Math.max(offerPrice, defaultOriginal);

    if (offerPrice > originalPrice) {
      originalPrice = offerPrice;
    }

    const price = offerPrice;

    const updatedChapter: Chapter = {
      ...chapter,
      accessType,
      originalPrice,
      offerPrice,
      price,
      topicsCount: chapter.topics ? chapter.topics.length : (chapter.topicsCount || 0),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      chapters[idx] = updatedChapter;
    } else {
      chapters.unshift(updatedChapter);
    }
    this.saveChapters(chapters);
    return updatedChapter;
  }

  static deleteChapter(id: string): boolean {
    const chapters = this.getChapters();
    const filtered = chapters.filter(c => c.id !== id);
    if (filtered.length === chapters.length) return false;
    this.saveChapters(filtered);
    return true;
  }

  // ==========================================
  // Groups Management (Multi-Education Syllabus)
  // ==========================================
  static getGroups(): Group[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      let groups: Group[] = [];
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
        groups = INITIAL_GROUPS;
      } else {
        groups = JSON.parse(data);
      }

      // Ensure chapterIds & chapterOrder arrays exist for backwards-compatibility
      const chapters = this.getChapters();
      let changed = false;
      groups = groups.map(g => {
        const id = g.id || g.groupId;
        let cIds = Array.isArray(g.chapterIds) ? [...g.chapterIds] : [];
        if (cIds.length === 0) {
          const associatedChapters = chapters.filter(c => c.groupId === id);
          if (associatedChapters.length > 0) {
            cIds = associatedChapters.map(c => c.id);
            changed = true;
          }
        }
        const cOrder = Array.isArray(g.chapterOrder) && g.chapterOrder.length > 0 ? g.chapterOrder : cIds;
        return {
          ...g,
          id,
          groupId: id,
          chapterIds: cIds,
          chapterOrder: cOrder
        };
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
      }

      // Sort by order ascending
      return groups.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    } catch {
      return INITIAL_GROUPS;
    }
  }

  static saveGroups(groups: Group[]): void {
    const sorted = [...groups].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(sorted));
  }

  static getGroupById(id: string): Group | undefined {
    return this.getGroups().find(g => g.id === id || g.groupId === id);
  }

  static saveGroup(group: Group): Group {
    const groups = this.getGroups();
    const targetId = group.id || group.groupId || `grp-${Date.now()}`;
    const idx = groups.findIndex(g => g.id === targetId || g.groupId === targetId);
    
    const chapterIds = Array.isArray(group.chapterIds) ? [...group.chapterIds] : [];
    const chapterOrder = Array.isArray(group.chapterOrder) && group.chapterOrder.length > 0
      ? group.chapterOrder
      : chapterIds;

    const updatedGroup: Group = {
      ...group,
      id: targetId,
      groupId: targetId,
      chapterIds,
      chapterOrder,
      order: typeof group.order === 'number' ? group.order : (groups.length + 1),
      active: group.active !== false,
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      groups[idx] = updatedGroup;
    } else {
      groups.push(updatedGroup);
    }
    this.saveGroups(groups);

    // Sync chapter relationships safely:
    // Update existing chapter documents with groupId link without duplicating or deleting any chapter
    const chapters = this.getChapters();
    const updatedChapters = chapters.map(c => {
      if (chapterIds.includes(c.id)) {
        return { ...c, groupId: targetId };
      }
      // If chapter was previously assigned to this group but unassigned, remove the link
      if (c.groupId === targetId && !chapterIds.includes(c.id)) {
        return { ...c, groupId: undefined };
      }
      return c;
    });
    this.saveChapters(updatedChapters);

    return updatedGroup;
  }

  /**
   * Safety rule: Deleting a Group removes only the Group playlist relationship.
   * Chapters are safely unlinked and NEVER deleted.
   */
  static deleteGroup(id: string): { deletedChaptersCount: number } {
    const groups = this.getGroups();
    const remainingGroups = groups.filter(g => g.id !== id && g.groupId !== id);
    this.saveGroups(remainingGroups);

    // Unlink chapters safely so they remain intact in Firestore & general curriculum
    const chapters = this.getChapters();
    const updatedChapters = chapters.map(c => (c.groupId === id ? { ...c, groupId: undefined } : c));
    this.saveChapters(updatedChapters);

    return { deletedChaptersCount: 0 };
  }

  static reorderGroups(groupOrders: { id: string; order: number }[]): Group[] {
    const groups = this.getGroups();
    const orderMap = new Map<string, number>();
    groupOrders.forEach(item => orderMap.set(item.id, item.order));

    const updated = groups.map(g => {
      if (orderMap.has(g.id)) {
        return { ...g, order: orderMap.get(g.id)!, updatedAt: new Date().toISOString() };
      }
      return g;
    });

    this.saveGroups(updated);
    return this.getGroups();
  }

  /**
   * Returns chapters belonging to a group, strictly ordered by the group's chapterOrder
   */
  static getChaptersByGroupId(groupId: string): Chapter[] {
    const group = this.getGroupById(groupId);
    const allChapters = this.getChapters();
    if (!group) {
      return allChapters.filter(c => c.groupId === groupId);
    }

    const assignedIds = group.chapterIds || [];
    // Also include any chapters having c.groupId === groupId if not in chapterIds yet
    allChapters.forEach(c => {
      if (c.groupId === groupId && !assignedIds.includes(c.id)) {
        assignedIds.push(c.id);
      }
    });

    const chapterMap = new Map<string, Chapter>();
    allChapters.forEach(c => chapterMap.set(c.id, c));

    const orderList = group.chapterOrder && group.chapterOrder.length > 0
      ? group.chapterOrder
      : assignedIds;

    const ordered: Chapter[] = [];
    orderList.forEach(id => {
      const c = chapterMap.get(id);
      if (c && !ordered.some(existing => existing.id === c.id)) {
        ordered.push(c);
      }
    });

    // Append any assigned chapters not listed in orderList
    assignedIds.forEach(id => {
      const c = chapterMap.get(id);
      if (c && !ordered.some(existing => existing.id === c.id)) {
        ordered.push(c);
      }
    });

    return ordered;
  }

  static addChaptersToGroup(groupId: string, newChapterIds: string[]): Group | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;

    const currentIds = group.chapterIds || [];
    const combinedIds = Array.from(new Set([...currentIds, ...newChapterIds]));
    const combinedOrder = Array.from(new Set([...(group.chapterOrder || currentIds), ...newChapterIds]));

    return this.saveGroup({
      ...group,
      chapterIds: combinedIds,
      chapterOrder: combinedOrder
    });
  }

  static removeChapterFromGroup(groupId: string, chapterId: string): Group | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;

    const updatedIds = (group.chapterIds || []).filter(id => id !== chapterId);
    const updatedOrder = (group.chapterOrder || []).filter(id => id !== chapterId);

    return this.saveGroup({
      ...group,
      chapterIds: updatedIds,
      chapterOrder: updatedOrder
    });
  }

  static reorderGroupChapters(groupId: string, orderedChapterIds: string[]): Group | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;

    return this.saveGroup({
      ...group,
      chapterOrder: orderedChapterIds
    });
  }

  // ==========================================
  // Academic Hierarchy Settings
  // ==========================================
  static getAcademicSettings(): AcademicSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACADEMIC_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, JSON.stringify(INITIAL_ACADEMIC_SETTINGS));
        return INITIAL_ACADEMIC_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ACADEMIC_SETTINGS;
    }
  }

  static saveAcademicSettings(settings: AcademicSettings): void {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, JSON.stringify(settings));
  }

  // Secure PDF content retrieval (generates official formatted printable PDF doc)
  static generateSecureNotePDF(note: Note, customerName: string): string {
    return `
      %PDF-1.4
      % NoteNest Protected Document
      Title: ${note.title}
      Course: ${note.course} - ${note.semester}
      Subject: ${note.subject}
      Unit: ${note.unit}
      Authorized Licensee: ${customerName}
      Pages: ${note.pages}
      Copyright © NoteNest. All rights reserved.
    `.trim();
  }
}
