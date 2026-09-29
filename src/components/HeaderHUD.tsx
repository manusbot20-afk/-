import React from 'react';
import { PlayerProfile } from '../types';
import { GameStorage } from '../services/storageService';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { Coins, Banknote, Award, Shield, Volume2, Sparkles, VolumeX, Play } from 'lucide-react';

interface HeaderHUDProps {
  profile: PlayerProfile;
  onOpenParent: () => void;
  onProfileClick: () => void;
  onSoundToggle: () => void;
  onVoiceToggle: () => void;
  onOpenExchange: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  profile,
  onOpenParent,
  onProfileClick,
  onSoundToggle,
  onVoiceToggle,
  onOpenExchange
}) => {
  const xpNeeded = GameStorage.calculateXpForNextLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));

  const handleTestAudio = () => {
    sound.playClick();
    sound.playLevelUp();
    voice.unlockAudio();
    voice.testAudio();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 py-2 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Player Avatar, Name & Level */}
        <button
          onClick={() => {
            sound.playClick();
            onProfileClick();
          }}
          className="flex items-center gap-2 text-right group hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
          title="الملف الشخصي والتقييم الأكاديمي"
        >
          <div className="relative">
            <img
              src={profile.selectedAvatar}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-amber-500 object-cover bg-slate-800 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow">
              {profile.level}
            </span>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-100 truncate max-w-[110px]">{profile.name}</span>
              <span className="text-[11px] text-amber-400 font-semibold truncate max-w-[100px]">({profile.activeTitle})</span>
            </div>
            <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </button>

        {/* Center: DUAL CURRENCY (+5 / -10) */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-semibold">
          {/* 🪙 Game Coins (+5 صح / -10 غلط) */}
          <div
            className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded-xl text-amber-300 shadow-inner"
            title="عملات اللعبة: +5 للإجابة الصح / -10 للغلط"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums font-black">{profile.coins}</span>
          </div>

          {/* 💵 Exchange Coins (convertible to Cash!) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenExchange();
            }}
            className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/60 px-2.5 py-1 rounded-xl text-emerald-300 shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
            title="عملات التبديل بفلوس حقيقية - اضغط للتبديل بكود 2612002"
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span className="tabular-nums font-black">{profile.exchangeCoins}</span>
            <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded font-black hidden xs:inline">تبديل 💵</span>
          </button>

          {/* 📊 Mastery Points */}
          <div
            className="hidden sm:flex items-center gap-1 bg-indigo-950/40 border border-indigo-500/30 px-2 py-1 rounded-xl text-indigo-300"
            title="نقاط الإتقان الأكاديمي"
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span className="tabular-nums font-bold">{profile.masteryScore}</span>
            <span className="text-[10px] text-slate-400">إتقان</span>
          </div>
        </div>

        {/* Right Actions: Audio Test, Voice Narrator Toggle & Parent Mode */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Test Button ⭐ */}
          <button
            onClick={handleTestAudio}
            className="flex items-center gap-1 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-500/40 text-sky-300 px-2 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="فحص واختبار صوت الراوي عم رشيد"
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">فحص الصوت</span>
          </button>

          {/* Voice Narrator Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onVoiceToggle();
            }}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              profile.voiceNarratorEnabled
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={profile.voiceNarratorEnabled ? 'إيقاف الراوي الصوتي' : 'تشغيل الراوي الصوتي'}
            aria-label="Voice Narrator Toggle"
          >
            <Volume2 className={`w-4 h-4 ${profile.voiceNarratorEnabled ? 'animate-pulse text-amber-400' : 'text-slate-500'}`} />
          </button>

          {/* Parent Mode Shield */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenParent();
            }}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-indigo-200 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            title="لوحة تحكم ولي الأمر والتقييم الأكاديمي (الرمز: 2612002)"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">ولي الأمر</span>
          </button>
        </div>
      </div>
    </header>
  );
};
