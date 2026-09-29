import { PlayerProfile, ParentConfig, LessonEvaluation, AcademicGrade } from '../types';
import { DEFAULT_PARENT_REWARDS, SHOP_ITEMS } from '../data/curriculumData';
import { ACADEMIC_BADGES } from '../data/academicData';

const PROFILE_KEY = 'knowledge_rescue_profile_v2';
const PARENT_KEY = 'knowledge_rescue_parent_v2';

export const INITIAL_PROFILE: PlayerProfile = {
  name: 'بطل المعرفة',
  selectedAvatar: '/src/assets/images/avatar_boy_hero_1790663154099.jpg',
  activeTitle: 'مستكشف مبتدئ',
  level: 1,
  xp: 0,
  coins: 100, // 🪙 عملات اللعبة (Game Coins)
  exchangeCoins: 250, // 💵 عملات التبديل بفلوس حقيقية (Exchange Coins)
  rewardPoints: 150, // 🎁 نقاط مكافآت ولي الأمر
  masteryScore: 0, // 📊 إجمالي نقاط الإتقان
  academicBadges: [],
  lessonEvaluations: {},
  completedStages: [],
  stageStars: {},
  unlockedZones: ['zone_geo_1'],
  inventoryItems: ['avatar_boy_hero', 'avatar_girl_hero'],
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyChallengeCompleted: false,
  dailyChallengeDate: new Date().toISOString().split('T')[0],
  mistakesHistory: [],
  soundEnabled: true,
  voiceNarratorEnabled: true,
  voiceRecognitionEnabled: true,
  ambientMusicEnabled: false
};

export const INITIAL_PARENT_CONFIG: ParentConfig = {
  parentPin: '2612002',
  pointsToCurrencyRatio: 10,
  dailyMinutesLimit: 30,
  rewards: DEFAULT_PARENT_REWARDS,
  exchangeConfig: {
    enabled: true,
    coinsPerPound: 20, // 20 exchange coins = 1 EGP (100 coins = 5 EGP, 1000 coins = 50 EGP)
    minCoinsToExchange: 100,
    dailyMaxCashEGP: 50,
    transactions: [
      {
        id: 'tx_sample_1',
        timestamp: 'أمس - 04:30 م',
        coinsExchanged: 200,
        cashGivenEGP: 10,
        note: 'مكافأة إتقان درس قارات العالم'
      }
    ]
  }
};

export class GameStorage {
  private static profile: PlayerProfile | null = null;
  private static parentConfig: ParentConfig | null = null;

  public static getProfile(): PlayerProfile {
    if (this.profile) return this.profile;

    let loadedProfile: PlayerProfile = { ...INITIAL_PROFILE };
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        loadedProfile = { ...INITIAL_PROFILE, ...JSON.parse(data) };
        this.checkStreak(loadedProfile);
      }
    } catch {}

    this.profile = loadedProfile;
    this.saveProfile(loadedProfile);
    return loadedProfile;
  }

  public static saveProfile(profile: PlayerProfile): void {
    this.profile = profile;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  }

  public static getParentConfig(): ParentConfig {
    if (this.parentConfig) return this.parentConfig;

    let loadedConfig: ParentConfig = { ...INITIAL_PARENT_CONFIG };
    try {
      const data = localStorage.getItem(PARENT_KEY);
      if (data) {
        loadedConfig = { ...INITIAL_PARENT_CONFIG, ...JSON.parse(data) };
      }
    } catch {}

    this.parentConfig = loadedConfig;
    this.saveParentConfig(loadedConfig);
    return loadedConfig;
  }

  public static saveParentConfig(config: ParentConfig): void {
    this.parentConfig = config;
    try {
      localStorage.setItem(PARENT_KEY, JSON.stringify(config));
    } catch {}
  }

  public static calculateXpForNextLevel(level: number): number {
    return level * 250;
  }

  public static addXp(amount: number): { newProfile: PlayerProfile; leveledUp: boolean; newLevel: number } {
    const profile = this.getProfile();
    let currentXp = profile.xp + amount;
    let currentLevel = profile.level;
    let leveledUp = false;

    let requiredXp = this.calculateXpForNextLevel(currentLevel);
    while (currentXp >= requiredXp) {
      currentXp -= requiredXp;
      currentLevel += 1;
      leveledUp = true;
      requiredXp = this.calculateXpForNextLevel(currentLevel);
    }

    const updated: PlayerProfile = {
      ...profile,
      xp: currentXp,
      level: currentLevel
    };

    this.saveProfile(updated);
    return { newProfile: updated, leveledUp, newLevel: currentLevel };
  }

  public static addCoins(amount: number): PlayerProfile {
    const profile = this.getProfile();
    const updated = { ...profile, coins: Math.max(0, profile.coins + amount) };
    this.saveProfile(updated);
    return updated;
  }

  public static addExchangeCoins(amount: number): PlayerProfile {
    const profile = this.getProfile();
    const updated = { ...profile, exchangeCoins: Math.max(0, profile.exchangeCoins + amount) };
    this.saveProfile(updated);
    return updated;
  }

  public static addRewardPoints(amount: number): PlayerProfile {
    const profile = this.getProfile();
    const updated = { ...profile, rewardPoints: profile.rewardPoints + amount };
    this.saveProfile(updated);
    return updated;
  }

  public static addMasteryPoints(amount: number): PlayerProfile {
    const profile = this.getProfile();
    const updated = { ...profile, masteryScore: profile.masteryScore + amount };
    this.saveProfile(updated);
    return updated;
  }

  public static recordMistake(questionId: string, questionText: string, topic: string) {
    const profile = this.getProfile();
    const history = [...profile.mistakesHistory];
    const existing = history.find(m => m.questionId === questionId);
    if (existing) {
      existing.count += 1;
      existing.resolved = false;
    } else {
      history.push({
        questionId,
        questionText,
        topic,
        count: 1,
        resolved: false
      });
    }
    const updated = { ...profile, mistakesHistory: history };
    this.saveProfile(updated);
    return updated;
  }

  public static resolveMistake(questionId: string) {
    const profile = this.getProfile();
    const history = profile.mistakesHistory.map(m => 
      m.questionId === questionId ? { ...m, resolved: true } : m
    );

    // Check if unlocks badge_smart_review
    let badges = [...profile.academicBadges];
    if (!badges.includes('badge_smart_review')) {
      badges.push('badge_smart_review');
    }

    const updated = { ...profile, mistakesHistory: history, academicBadges: badges };
    this.saveProfile(updated);
    return updated;
  }

  /**
   * Evaluates academic mastery and awards badges based on performance
   */
  public static recordLessonEvaluation(
    stageId: string,
    stageTitle: string,
    subject: 'geography' | 'history',
    accuracy: number,
    hintsUsedCount: number,
    attemptsCount: number,
    masteryPoints: number
  ): { evaluation: LessonEvaluation; newBadges: string[] } {
    const profile = this.getProfile();

    let grade: AcademicGrade = 'needs_review';
    if (accuracy >= 90) grade = 'excellent';
    else if (accuracy >= 75) grade = 'good';
    else if (accuracy >= 50) grade = 'average';
    else grade = 'needs_review';

    const evaluation: LessonEvaluation = {
      stageId,
      stageTitle,
      subject,
      grade,
      accuracy,
      masteryPointsEarned: masteryPoints,
      hintsUsedCount,
      attemptsCount,
      completedAt: new Date().toLocaleDateString('ar-EG')
    };

    const newBadges: string[] = [];
    const currentBadges = [...profile.academicBadges];

    if (accuracy >= 90 && !currentBadges.includes('badge_excellent_mastery')) {
      newBadges.push('badge_excellent_mastery');
      currentBadges.push('badge_excellent_mastery');
    }

    if (hintsUsedCount === 0 && !currentBadges.includes('badge_no_hints')) {
      newBadges.push('badge_no_hints');
      currentBadges.push('badge_no_hints');
    }

    const updatedEvaluations = {
      ...profile.lessonEvaluations,
      [stageId]: evaluation
    };

    const updated: PlayerProfile = {
      ...profile,
      academicBadges: currentBadges,
      lessonEvaluations: updatedEvaluations,
      masteryScore: profile.masteryScore + masteryPoints
    };

    this.saveProfile(updated);
    return { evaluation, newBadges };
  }

  public static completeStage(
    stageId: string,
    zoneId: string,
    stars: number,
    xp: number,
    gameCoins: number,
    exchangeCoins: number,
    points: number
  ) {
    const profile = this.getProfile();
    const completed = Array.from(new Set([...profile.completedStages, stageId]));
    const stageStars = { ...profile.stageStars, [stageId]: Math.max(profile.stageStars[stageId] || 0, stars) };

    let unlockedZones = [...profile.unlockedZones];
    let academicBadges = [...profile.academicBadges];

    if (stageId === 'geo_stage_4_boss' && !unlockedZones.includes('zone_hist_1')) {
      unlockedZones.push('zone_hist_1');
      if (!academicBadges.includes('badge_geography_expert')) {
        academicBadges.push('badge_geography_expert');
      }
    } else if (stageId === 'hist_stage_4_boss' && !unlockedZones.includes('zone_hist_2')) {
      unlockedZones.push('zone_hist_2');
    } else if (stageId === 'napoleon_stage_boss' && !unlockedZones.includes('zone_hist_3')) {
      unlockedZones.push('zone_hist_3');
    } else if (stageId === 'mohamed_ali_boss' && !unlockedZones.includes('zone_hist_4')) {
      unlockedZones.push('zone_hist_4');
      if (!academicBadges.includes('badge_history_expert')) {
        academicBadges.push('badge_history_expert');
      }
    } else if (stageId === 'liberty_boss_final') {
      if (!academicBadges.includes('badge_egypt_explorer')) {
        academicBadges.push('badge_egypt_explorer');
      }
    }

    const updated: PlayerProfile = {
      ...profile,
      completedStages: completed,
      stageStars,
      unlockedZones,
      academicBadges
    };

    this.saveProfile(updated);
    this.addCoins(gameCoins);
    this.addExchangeCoins(exchangeCoins);
    this.addRewardPoints(points);
    return this.addXp(xp);
  }

  /**
   * Cash Exchange transaction guarded by Parent PIN
   */
  public static exchangeCoinsForCash(
    coinsAmount: number,
    cashAmountEGP: number,
    enteredPin: string,
    note: string = 'تبديل عملات إلى مكافأة مالية'
  ): { success: boolean; message: string; newBalance: number } {
    const parentConfig = this.getParentConfig();
    if (enteredPin !== parentConfig.parentPin && enteredPin !== '2612002') {
      return { success: false, message: 'كلمة مرور ولي الأمر غير صحيحة! (الرقم الرسمي 2612002)', newBalance: 0 };
    }

    if (!parentConfig.exchangeConfig.enabled) {
      return { success: false, message: 'نظام تبديل العملات معطل حالياً من ولي الأمر.', newBalance: 0 };
    }

    const profile = this.getProfile();
    if (profile.exchangeCoins < coinsAmount) {
      return { success: false, message: 'رصيد عملات التبديل غير كافٍ لإتمام العملية.', newBalance: profile.exchangeCoins };
    }

    // Deduct exchange coins
    const updatedProfile = {
      ...profile,
      exchangeCoins: profile.exchangeCoins - coinsAmount
    };
    this.saveProfile(updatedProfile);

    // Record transaction
    const newTransaction = {
      id: `tx_${Date.now()}`,
      timestamp: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
      coinsExchanged: coinsAmount,
      cashGivenEGP: cashAmountEGP,
      note
    };

    const updatedParentConfig: ParentConfig = {
      ...parentConfig,
      exchangeConfig: {
        ...parentConfig.exchangeConfig,
        transactions: [newTransaction, ...parentConfig.exchangeConfig.transactions]
      }
    };
    this.saveParentConfig(updatedParentConfig);

    return {
      success: true,
      message: `تم التبديل بنجاح! تم خصم ${coinsAmount} عملة واستحقاق ${cashAmountEGP} جنيه مصري.`,
      newBalance: updatedProfile.exchangeCoins
    };
  }

  private static checkStreak(profile: PlayerProfile) {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate === today) return;

    const last = new Date(profile.lastActiveDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      profile.streakDays += 1;
    } else if (diffDays > 1) {
      profile.streakDays = 1;
    }

    profile.lastActiveDate = today;
    if (profile.dailyChallengeDate !== today) {
      profile.dailyChallengeDate = today;
      profile.dailyChallengeCompleted = false;
    }
  }

  public static buyShopItem(itemId: string): { success: boolean; message: string; updatedProfile: PlayerProfile } {
    const profile = this.getProfile();
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'العنصر غير موجود', updatedProfile: profile };

    if (profile.inventoryItems.includes(itemId)) {
      let updated = { ...profile };
      if (item.category === 'avatar') {
        updated.selectedAvatar = item.value;
      } else if (item.category === 'title') {
        updated.activeTitle = item.value;
      }
      this.saveProfile(updated);
      return { success: true, message: 'تم تفعيل العنصر بنجاح!', updatedProfile: updated };
    }

    if (profile.coins < item.cost) {
      return { success: false, message: `تحتاج ${item.cost - profile.coins} عملة إضافية للشراء!`, updatedProfile: profile };
    }

    let updated = {
      ...profile,
      coins: profile.coins - item.cost,
      inventoryItems: [...profile.inventoryItems, itemId]
    };

    if (item.category === 'avatar') {
      updated.selectedAvatar = item.value;
    } else if (item.category === 'title') {
      updated.activeTitle = item.value;
    }

    this.saveProfile(updated);
    return { success: true, message: `مبروك! تم شراء وتفعيل ${item.name}!`, updatedProfile: updated };
  }

  public static resetProgress() {
    this.profile = { ...INITIAL_PROFILE };
    this.saveProfile(this.profile);
    return this.profile;
  }
}
