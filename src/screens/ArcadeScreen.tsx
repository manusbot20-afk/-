import React, { useState } from 'react';
import { Zone, LessonStage } from '../types';
import { sound } from '../services/audioService';
import { Gamepad2, Compass, Calendar, Link2, Eye, KeyRound, Play, ArrowLeft } from 'lucide-react';

interface ArcadeScreenProps {
  zones: Zone[];
  onPlayStage: (stage: LessonStage) => void;
}

export const ArcadeScreen: React.FC<ArcadeScreenProps> = ({
  zones,
  onPlayStage
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const allStages = zones.flatMap(z => z.stages);

  const miniGameCategories = [
    { id: 'all', label: 'الكل' },
    { id: 'map_explore', label: 'الخرائط', icon: Compass },
    { id: 'timeline_order', label: 'الترتيب الزمني', icon: Calendar },
    { id: 'matching_pairs', label: 'المطابقة', icon: Link2 },
    { id: 'memory_cards', label: 'الذاكرة', icon: Eye },
    { id: 'clue_puzzle', label: 'الألغاز', icon: KeyRound },
  ];

  const filteredStages = filterType === 'all'
    ? allStages
    : allStages.filter(s => s.miniGame.type === filterType);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-5 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-amber-400" />
          <span>صالة الألعاب والتحديات التفاعلية</span>
        </h2>
        <p className="text-xs text-slate-300">
          العب التحديات والألعاب المصغرة بحرية لمراجعة المعلومات واكتساب الـ Coins والخبرة!
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {miniGameCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              sound.playClick();
              setFilterType(cat.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              filterType === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Mini-Games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredStages.map((stage) => {
          let typeLabel = 'تحدي تفاعلي';
          let TypeIcon = Gamepad2;
          if (stage.miniGame.type === 'map_explore') {
            typeLabel = 'استكشاف الخريطة';
            TypeIcon = Compass;
          } else if (stage.miniGame.type === 'timeline_order') {
            typeLabel = 'ترتيب زمني تاريخي';
            TypeIcon = Calendar;
          } else if (stage.miniGame.type === 'matching_pairs') {
            typeLabel = 'مطابقة المفاهيم';
            TypeIcon = Link2;
          } else if (stage.miniGame.type === 'memory_cards') {
            typeLabel = 'كروت الذاكرة';
            TypeIcon = Eye;
          } else if (stage.miniGame.type === 'clue_puzzle') {
            typeLabel = 'لغز المحقق';
            TypeIcon = KeyRound;
          }

          return (
            <div
              key={stage.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-right space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <TypeIcon className="w-3 h-3" />
                    {typeLabel}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {stage.subject === 'geography' ? 'جغرافيا' : 'تاريخ'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">
                  {stage.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {stage.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  +{stage.xpReward} XP
                </span>

                <button
                  onClick={() => {
                    sound.playClick();
                    onPlayStage(stage);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
                >
                  <span>العب الآن</span>
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
