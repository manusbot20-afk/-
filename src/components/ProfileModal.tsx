import React, { useState } from 'react';
import { PlayerProfile, Achievement } from '../types';
import { ACHIEVEMENTS_DATA, SHOP_ITEMS } from '../data/curriculumData';
import { GameStorage } from '../services/storageService';
import { sound } from '../services/audioService';
import { X, Trophy, Star, Shield, Flame, BookOpen, Compass, Building, Award, CheckCircle2, User } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onUpdateProfile: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  const [editingName, setEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(profile.name);

  if (!isOpen) return null;

  const xpNeeded = GameStorage.calculateXpForNextLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));

  const handleSaveName = () => {
    sound.playClick();
    if (nameInput.trim()) {
      const updated = { ...profile, name: nameInput.trim() };
      GameStorage.saveProfile(updated);
      onUpdateProfile();
      setEditingName(false);
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return Compass;
      case 'Shield': return Shield;
      case 'Flame': return Flame;
      case 'BookOpen': return BookOpen;
      case 'Building': return Building;
      case 'Trophy': return Trophy;
      default: return Award;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-base text-white">الملف الشخصي والإنجازات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Avatar and Info Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <img
              src={profile.selectedAvatar}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full border-2 border-amber-500 object-cover bg-slate-800 shadow-md shrink-0"
            />

            <div className="space-y-1 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                    maxLength={15}
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    حفظ
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-white">{profile.name}</h4>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                  >
                    تعديل
                  </button>
                </div>
              )}

              <span className="text-xs font-bold text-amber-400 block">
                {profile.activeTitle}
              </span>

              {/* XP progress */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>المستوى {profile.level}</span>
                  <span>{profile.xp} / {xpNeeded} XP</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>أوسمة الإنجاز والبطولات:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACHIEVEMENTS_DATA.map((ach) => {
                const Icon = getAchievementIcon(ach.icon);
                // Unlocked logic
                let isUnlocked = false;
                if (ach.id === 'ach_first_lesson' && profile.completedStages.length >= 1) isUnlocked = true;
                if (ach.id === 'ach_first_boss' && profile.completedStages.includes('geo_stage_4_boss')) isUnlocked = true;
                if (ach.id === 'ach_perfect_streak' && profile.streakDays >= 1) isUnlocked = true;
                if (ach.id === 'ach_history_buff' && profile.completedStages.includes('hist_stage_4_boss')) isUnlocked = true;
                if (ach.id === 'ach_modern_egypt' && profile.completedStages.includes('mohamed_ali_boss')) isUnlocked = true;
                if (ach.id === 'ach_knowledge_savior' && profile.completedStages.includes('liberty_boss_final')) isUnlocked = true;

                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border text-right space-y-1 transition-all ${
                      isUnlocked
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isUnlocked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h5 className="font-bold text-xs text-white">{ach.title}</h5>
                      </div>
                      {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {ach.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
