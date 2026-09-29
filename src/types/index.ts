export type SubjectType = 'geography' | 'history';

export type MiniGameType = 
  | 'map_explore'      // خريطة تفاعلية باللمس والاستماع
  | 'timeline_order'   // ترتيب زمني بسحب البطاقات
  | 'matching_pairs'   // مطابقة الشخصيات أو المفاهيم صوتياً وحركياً
  | 'memory_cards'     // كروت الذاكرة
  | 'clue_puzzle'      // ألغاز بصرية واستنتاج
  | 'tap_discover'     // اضغط لتكتشف وتسمع الشرح الفوري
  | 'water_harvest'    // لعبة حركية تفاعلية (جمع المحاصيل أو قطرات النيل)
  | 'boss_duel';       // مواجهة الزعيم التفاعلية الصوتية

export type AcademicGrade = 'excellent' | 'good' | 'average' | 'needs_review';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  hint: string;
  sourceLesson: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardXP: number;
  rewardCoins: number;
  rewardExchangeCoins?: number;
  audioPrompt?: string; // Voice line spoken by the narrator
}

export interface InteractiveMapPin {
  id: string;
  title: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  info: string;
  audioLine?: string; // Short voice explanation
  isCorrect?: boolean;
}

export interface TimelineItem {
  id: string;
  year: string;
  event: string;
  order: number;
  audioSnippet?: string;
}

export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
  audioFact?: string;
}

export interface MemoryCard {
  id: string;
  text: string;
  matchId: string;
  category: string;
  audioClue?: string;
}

export interface TapDiscoverHotspot {
  id: string;
  title: string;
  x: number;
  y: number;
  audioFact: string;
  discovered: boolean;
}

export interface MiniGameConfig {
  type: MiniGameType;
  instructions: string;
  audioInstruction?: string;
  mapPins?: InteractiveMapPin[];
  timelineItems?: TimelineItem[];
  matchingPairs?: MatchingPair[];
  memoryCards?: MemoryCard[];
  puzzleClues?: string[];
  puzzleAnswer?: string;
  puzzleOptions?: string[];
  tapHotspots?: TapDiscoverHotspot[];
}

export interface KnowledgeCard {
  title: string;
  summaryPoints: string[];
  keyTerm?: { term: string; definition: string };
  funFact?: string;
}

export interface LessonStage {
  id: string;
  zoneId: string;
  title: string;
  subtitle: string;
  subject: SubjectType;
  lessonNumber: number;
  audioStory?: string; // The audio story narrated to the student
  audioLessonSummary?: string; // The audio summary replacing reading
  audioFile?: string; // Path to pre-recorded MP3 narrator audio file
  ambientType?: 'nile_river' | 'market_cairo' | 'war_battle' | 'ancient_temple' | 'wind_sea';
  npcDialogue: {
    characterName: string;
    avatar: string;
    lines: string[];
    egyptianDialectVoice?: string;
  };
  knowledgeCard: KnowledgeCard;
  miniGame: MiniGameConfig;
  questions: Question[];
  xpReward: number;
  coinsReward: number; // In-game Game Coins
  exchangeCoinsReward?: number; // Exchange Coins convertible to cash
  rewardPoints: number;
  isBossStage?: boolean;
}

export interface Zone {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  subject: SubjectType;
  description: string;
  stages: LessonStage[];
  requiredLevel: number;
  requiredPrevZoneId?: string;
  bossStageId: string;
  accentColor: string;
  iconName: string;
}

export interface AcademicBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  category: 'mastery' | 'speed' | 'nohints' | 'review' | 'completion';
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'streak' | 'boss';
  unlockedAt?: string;
  rewardXP: number;
  rewardCoins: number;
}

export interface LessonEvaluation {
  stageId: string;
  stageTitle: string;
  subject: SubjectType;
  grade: AcademicGrade;
  accuracy: number; // 0-100%
  masteryPointsEarned: number;
  hintsUsedCount: number;
  attemptsCount: number;
  completedAt: string;
}

export interface CustomizationItem {
  id: string;
  name: string;
  category: 'avatar' | 'title' | 'badge';
  cost: number;
  unlocked: boolean;
  value: string;
  description: string;
}

export interface ParentReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
  category: 'gaming' | 'outing' | 'gift' | 'allowance';
  isClaimed: boolean;
  claimedAt?: string;
}

export interface ExchangeTransaction {
  id: string;
  timestamp: string;
  coinsExchanged: number;
  cashGivenEGP: number;
  note: string;
}

export interface ExchangeConfig {
  enabled: boolean;
  coinsPerPound: number; // e.g. 20 exchange coins = 1 EGP (100 coins = 5 EGP)
  minCoinsToExchange: number; // e.g. 200 coins
  dailyMaxCashEGP: number; // e.g. 50 EGP
  transactions: ExchangeTransaction[];
}

export interface PlayerProfile {
  name: string;
  selectedAvatar: string;
  activeTitle: string;
  level: number;
  xp: number;
  coins: number; // 🪙 عملات اللعبة (Game Coins)
  exchangeCoins: number; // 💵 عملات التبديل بفلوس حقيقية (Exchange Coins)
  rewardPoints: number; // 🎁 نقاط مكافآت ولي الأمر
  masteryScore: number; // 📊 إجمالي نقاط الإتقان الأكاديمي
  academicBadges: string[]; // 🎖️ الشارات الأكاديمية المكتسبة
  lessonEvaluations: Record<string, LessonEvaluation>;
  completedStages: string[];
  stageStars: Record<string, number>;
  unlockedZones: string[];
  inventoryItems: string[];
  streakDays: number;
  lastActiveDate: string;
  dailyChallengeCompleted: boolean;
  dailyChallengeDate: string;
  mistakesHistory: {
    questionId: string;
    questionText: string;
    topic: string;
    count: number;
    resolved: boolean;
  }[];
  soundEnabled: boolean;
  voiceNarratorEnabled: boolean; // 🔊 تفعيل الراوي الصوتي
  voiceRecognitionEnabled: boolean; // 🎤 تفعيل الإجابة الصوتية
  ambientMusicEnabled: boolean; // 🎵 تفعيل الموسيقى المحيطية
}

export interface ParentConfig {
  parentPin: string; // default "1234"
  pointsToCurrencyRatio: number;
  dailyMinutesLimit: number;
  rewards: ParentReward[];
  exchangeConfig: ExchangeConfig;
}
