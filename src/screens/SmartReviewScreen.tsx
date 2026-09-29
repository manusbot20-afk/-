import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { GameStorage } from '../services/storageService';
import { sound } from '../services/audioService';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartReviewScreenProps {
  profile: PlayerProfile;
  onRefreshProfile: () => void;
}

export const SmartReviewScreen: React.FC<SmartReviewScreenProps> = ({
  profile,
  onRefreshProfile
}) => {
  const unresolvedMistakes = profile.mistakesHistory.filter(m => !m.resolved);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const handleResolve = (questionId: string) => {
    sound.playCorrect();
    confetti({ particleCount: 40, spread: 30, origin: { y: 0.6 } });
    GameStorage.resolveMistake(questionId);
    GameStorage.addXp(40);
    GameStorage.addCoins(20);
    setResolvedIds(prev => [...prev, questionId]);
    onRefreshProfile();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-5 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-indigo-400" />
          <span>غرفة المراجعة والتدريب الذكي</span>
        </h2>
        <p className="text-xs text-slate-300">
          النظام يسجل تلقائياً النقاط التي واجهت فيها صعوبة لتعيد مراجعتها وتثبيتها دون أي إحباط.
        </p>
      </div>

      {unresolvedMistakes.length === 0 ? (
        /* Empty clean state */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-lg text-emerald-300">
              ما شاء الله! سجلك ناصع تماماً!
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
              لا توجد أية مفاهيم أو أسئلة تحتاج إلى مراجعة حالياً. واصل تقدمك في الخريطة ومواجهة الـ Boss!
            </p>
          </div>
        </div>
      ) : (
        /* List of questions to review */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>مفاهيم تحتاج إلى تثبيت ({unresolvedMistakes.length})</span>
            <span className="text-indigo-400 font-bold">+40 XP لكل مراجعة</span>
          </div>

          {unresolvedMistakes.map((mistake) => {
            const isResolvedNow = resolvedIds.includes(mistake.questionId);

            return (
              <div
                key={mistake.questionId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-right space-y-3 shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      تكرر {mistake.count} مرة
                    </span>
                    <span className="text-[10px] text-slate-400">
                      الدرس: {mistake.topic}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 leading-snug pt-1">
                    {mistake.questionText}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    أتقنت المعلومة وفهمت سبب الإجابة؟
                  </span>

                  <button
                    disabled={isResolvedNow}
                    onClick={() => handleResolve(mistake.questionId)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      isResolvedNow
                        ? 'bg-slate-800 text-emerald-400 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow active:scale-95 cursor-pointer'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isResolvedNow ? 'تمت المراجعة ✓' : 'تم تثبيت المعلومة'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
