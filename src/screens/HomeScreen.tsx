import React, { useEffect } from 'react';
import { PlayerProfile, Zone, LessonStage } from '../types';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { GameStorage } from '../services/storageService';
import { Play, Map, Sparkles, Trophy, Flame, Gift, ArrowLeft, RefreshCw, Star, Compass, Banknote, Volume2, Award, Headphones, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomeScreenProps {
  profile: PlayerProfile;
  zones: Zone[];
  onStartStage: (stage: LessonStage) => void;
  onNavigateTab: (tab: 'map' | 'arcade' | 'rewards' | 'review' | 'profile') => void;
  onOpenExchange: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  zones,
  onStartStage,
  onNavigateTab,
  onOpenExchange
}) => {
  // Find next uncompleted stage
  let nextStage: LessonStage | null = null;
  let nextZone: Zone | null = null;

  for (const zone of zones) {
    if (profile.unlockedZones.includes(zone.id)) {
      for (const stg of zone.stages) {
        if (!profile.completedStages.includes(stg.id)) {
          nextStage = stg;
          nextZone = zone;
          break;
        }
      }
      if (nextStage) break;
    }
  }

  if (!nextStage) {
    nextZone = zones[0];
    nextStage = zones[0].stages[0];
  }

  const totalStages = zones.reduce((acc, z) => acc + z.stages.length, 0);
  const completedCount = profile.completedStages.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalStages) * 100));

  const handleClaimDailyChallenge = () => {
    if (profile.dailyChallengeCompleted) return;
    sound.playLevelUp();
    confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });
    voice.speak('ألف مبروك! استلمت مكافأة التحدي اليومي ونقاط الخبرة!');
    GameStorage.addXp(100);
    GameStorage.addCoins(10); // Daily challenge: +10 coins according to new rules
    GameStorage.addExchangeCoins(10);
    GameStorage.addRewardPoints(20);
    const updated = { ...profile, dailyChallengeCompleted: true };
    GameStorage.saveProfile(updated);
  };

  const handlePlayWelcomeNarrator = () => {
    sound.playClick();
    sound.playLevelUp();
    voice.unlockAudio();
    voice.playWelcomeAudio();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-4 animate-fadeIn">
      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 shadow-2xl bg-slate-900 group">
        <div className="aspect-[16/9] w-full relative">
          <img
            src="/src/assets/images/map_knowledge_realm_1790663125356.jpg"
            alt="خريطة المعرفة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end text-right">
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-amber-400 uppercase bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded-full inline-block">
                مغامرة مسموعة وتفاعلية · 3 إعدادي
              </span>
              <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Banknote className="w-3 h-3" />
                تبديل بفلوس حقيقية
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight text-balance">
              استمع، المس، وتعلّم بدون قراءة طويلة!
            </h1>
            <p className="text-xs text-slate-300 max-w-md line-clamp-2">
              كل درس مسموع بتخلصه بيزود عملات التبديل ونقاط إتقانك الأكاديمي!
            </p>
          </div>

          {/* Action Row: Listen Welcome & Start Adventure */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* MAIN PROMINENT CONTINUE BUTTON */}
            <button
              onClick={() => {
                sound.playClick();
                voice.unlockAudio();
                if (nextStage) onStartStage(nextStage);
              }}
              className="flex-1 py-3.5 sm:py-4 px-5 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-between cursor-pointer group/btn"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shadow">
                  <Play className="w-5 h-5 fill-amber-400 ml-0.5" />
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold text-slate-900 leading-none">
                    {completedCount === 0 ? 'ابدأ الاستماع واللعب' : 'متابعة المغامرة'}
                  </span>
                  <span className="block text-sm font-black text-slate-950">
                    {nextStage ? nextStage.title : 'استكشف الخريطة'}
                  </span>
                </div>
              </div>

              <ArrowLeft className="w-5 h-5 text-slate-950 group-hover/btn:-translate-x-1 transition-transform" />
            </button>

            {/* Narrator Voice Welcome Button */}
            <button
              onClick={handlePlayWelcomeNarrator}
              className="py-3 px-4 rounded-2xl font-black text-xs bg-slate-950/90 border border-amber-500/50 hover:bg-slate-900 text-amber-300 shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shrink-0"
              title="استمع لصوت عم رشيد الترحيبي"
            >
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>استمع للراوي 🎙️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules Banner (+5 / -10 Coins) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
            🪙
          </div>
          <div>
            <span className="font-bold text-white block">قوانين العملات في رحلة المعرفة:</span>
            <span className="text-[11px] text-amber-300">
              <strong className="text-emerald-400">+5 عملات</strong> للإجابة الصحيحة · <strong className="text-rose-400">-10 عملات</strong> للإجابة الغلط (الحد الأدنى 0)
            </span>
          </div>
        </div>

        <button
          onClick={handlePlayWelcomeNarrator}
          className="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-500/30 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1"
        >
          <Volume2 className="w-3 h-3" />
          <span>تشغيل الصوت</span>
        </button>
      </div>

      {/* Real Cash Exchange Prompt Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <Banknote className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">معاك {profile.exchangeCoins} عملة تبديل!</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black">فلوس حقيقية</span>
            </div>
            <p className="text-[11px] text-slate-300">
              تقدر تبدلها الآن بنقود كاش مع ولي أمرك عبر الرمز السري <strong>2612002</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenExchange();
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          تبديل الآن 💵
        </button>
      </div>

      {/* Progress & Academic Stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            نسبة استعادة خريطة المعرفة
          </span>
          <span className="font-black text-amber-400 tabular-nums">{progressPercent}%</span>
        </div>

        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">المراحل</span>
            <span className="text-xs font-bold text-white tabular-nums">{completedCount} / {totalStages}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">الشارات</span>
            <span className="text-xs font-bold text-amber-400 tabular-nums">{profile.academicBadges.length} 🎖️</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">إتقان</span>
            <span className="text-xs font-bold text-indigo-400 tabular-nums">{profile.masteryScore}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">الحماس</span>
            <span className="text-xs font-bold text-rose-400 tabular-nums">{profile.streakDays} يوم 🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
};
