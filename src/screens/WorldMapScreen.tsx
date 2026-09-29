import React, { useState } from 'react';
import { Zone, LessonStage, PlayerProfile } from '../types';
import { sound } from '../services/audioService';
import { Lock, CheckCircle2, Star, ShieldAlert, Play, ArrowLeft, Globe, Shield, Compass, Building, Flame, ChevronDown } from 'lucide-react';

interface WorldMapScreenProps {
  zones: Zone[];
  profile: PlayerProfile;
  onSelectStage: (stage: LessonStage) => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  zones,
  profile,
  onSelectStage
}) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(zones[0]);

  const getZoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return Globe;
      case 'Shield': return Shield;
      case 'Compass': return Compass;
      case 'Building': return Building;
      case 'Flame': return Flame;
      default: return Globe;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-5 animate-fadeIn">
      {/* Screen Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-amber-400" />
          <span>خريطة عوالم المعرفة</span>
        </h2>
        <p className="text-xs text-slate-300">
          اختر المنطقة ثم انطلق في مراحل الدروس وصولاً إلى مواجهة الـ BOSS الأكبر!
        </p>
      </div>

      {/* Zones Horizontal / Vertical List */}
      <div className="space-y-3">
        {zones.map((zone) => {
          const isUnlocked = profile.unlockedZones.includes(zone.id);
          const isSelected = selectedZone?.id === zone.id;
          const completedStagesInZone = zone.stages.filter(s => profile.completedStages.includes(s.id)).length;
          const zonePercent = Math.round((completedStagesInZone / zone.stages.length) * 100);
          const Icon = getZoneIcon(zone.iconName);

          return (
            <div
              key={zone.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/70 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : isUnlocked
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              {/* Zone Header Button */}
              <button
                disabled={!isUnlocked}
                onClick={() => {
                  sound.playClick();
                  setSelectedZone(isSelected ? null : zone);
                }}
                className={`w-full p-4 text-right flex items-center justify-between gap-3 transition-colors ${
                  !isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Zone Badge/Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-slate-800 to-slate-700 text-amber-400 border-amber-500/40 shadow-inner'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}>
                    {isUnlocked ? (
                      <Icon className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                        المنطقة {zone.number} · {zone.subject === 'geography' ? 'جغرافيا' : 'تاريخ'}
                      </span>
                      {zonePercent === 100 && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          مكتملة
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white mt-0.5">
                      {zone.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {zone.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  {isUnlocked ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-amber-400 tabular-nums">
                        {zonePercent}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {completedStagesInZone} من {zone.stages.length}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded">
                      <Lock className="w-3 h-3" />
                      أنهِ السابقة
                    </span>
                  )}
                </div>
              </button>

              {/* Collapsible Stages Roadmap if selected */}
              {isSelected && isUnlocked && (
                <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-2.5 animate-fadeIn">
                  <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    {zone.description}
                  </p>

                  <h4 className="text-xs font-bold text-slate-400 mb-2">
                    محطات ودروس المنطقة:
                  </h4>

                  <div className="space-y-2">
                    {zone.stages.map((stage, idx) => {
                      const isStageDone = profile.completedStages.includes(stage.id);
                      const stars = profile.stageStars[stage.id] || 0;
                      // Stage unlocked if previous completed or first stage
                      const isStageUnlocked = idx === 0 || profile.completedStages.includes(zone.stages[idx - 1].id) || isStageDone;

                      return (
                        <div
                          key={stage.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            stage.isBossStage
                              ? 'bg-rose-950/30 border-rose-500/50 shadow-md'
                              : isStageDone
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : isStageUnlocked
                              ? 'bg-slate-900 border-slate-700'
                              : 'bg-slate-900/40 border-slate-800 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              stage.isBossStage
                                ? 'bg-rose-600 text-white'
                                : isStageDone
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {stage.isBossStage ? <ShieldAlert className="w-4 h-4" /> : stage.lessonNumber}
                            </span>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-bold text-xs sm:text-sm text-white">
                                  {stage.title}
                                </h5>
                                {stage.isBossStage && (
                                  <span className="text-[9px] bg-rose-900 text-rose-200 px-1.5 py-0.2 rounded font-black">
                                    BOSS
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {stage.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Stars if completed */}
                            {isStageDone && stars > 0 && (
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3].map(s => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Play / Lock Button */}
                            <button
                              disabled={!isStageUnlocked}
                              onClick={() => {
                                sound.playClick();
                                onSelectStage(stage);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                !isStageUnlocked
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                  : stage.isBossStage
                                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow active:scale-95 cursor-pointer'
                                  : isStageDone
                                  ? 'bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 active:scale-95 cursor-pointer'
                                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95 cursor-pointer'
                              }`}
                            >
                              {isStageDone ? 'إعادة' : isStageUnlocked ? 'ابدأ' : 'مغلق'}
                              {isStageUnlocked && <Play className="w-3 h-3 fill-current ml-0.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
