import React, { useState } from 'react';
import { MatchingPair } from '../../types';
import { sound } from '../../services/audioService';
import { Link2, CheckCircle, Sparkles } from 'lucide-react';

interface MatchingPairsMiniGameProps {
  pairs: MatchingPair[];
  instructions: string;
  onComplete: () => void;
}

export const MatchingPairsMiniGame: React.FC<MatchingPairsMiniGameProps> = ({
  pairs,
  instructions,
  onComplete
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongAttempt, setWrongAttempt] = useState<{ left: string; right: string } | null>(null);

  // Shuffle right items once
  const [shuffledRights] = useState(() => {
    return [...pairs].sort(() => Math.random() - 0.5);
  });

  const handleLeftClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    sound.playClick();
    setSelectedLeft(id);
    setWrongAttempt(null);
  };

  const handleRightClick = (id: string) => {
    if (matchedIds.includes(id) || !selectedLeft) return;

    if (selectedLeft === id) {
      // Correct match!
      sound.playCorrect();
      setMatchedIds([...matchedIds, id]);
      setSelectedLeft(null);
      setWrongAttempt(null);
    } else {
      // Wrong match
      sound.playWrong();
      setWrongAttempt({ left: selectedLeft, right: id });
      setTimeout(() => {
        setWrongAttempt(null);
        setSelectedLeft(null);
      }, 700);
    }
  };

  const isAllMatched = matchedIds.length === pairs.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-indigo-300">لعبة المطابقة: ربط المفاهيم</h3>
        </div>
        <span className="text-xs text-slate-400">
          تمت مطابقة: <span className="text-indigo-400 font-bold tabular-nums">{matchedIds.length}</span> من {pairs.length}
        </span>
      </div>

      <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 leading-relaxed">
        {instructions}
      </p>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-slate-400 mb-1">المصطلح / الشخصية / الظاهرة</h4>
          {pairs.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isSelected = selectedLeft === p.id;
            const isWrong = wrongAttempt?.left === p.id;

            return (
              <button
                key={p.id}
                disabled={isMatched}
                onClick={() => handleLeftClick(p.id)}
                className={`w-full text-right p-3 rounded-xl border text-xs font-semibold transition-all min-h-[52px] flex items-center justify-between ${
                  isMatched
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 opacity-80 cursor-default'
                    : isWrong
                    ? 'bg-rose-950/40 border-rose-500 text-rose-200 animate-shake'
                    : isSelected
                    ? 'bg-indigo-900/60 border-indigo-400 text-indigo-100 shadow-md ring-2 ring-indigo-500/40'
                    : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95'
                }`}
              >
                <span>{p.leftText}</span>
                {isMatched && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-slate-400 mb-1">الوصف / المعلومة المطابقة</h4>
          {shuffledRights.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isWrong = wrongAttempt?.right === p.id;

            return (
              <button
                key={p.id}
                disabled={isMatched || !selectedLeft}
                onClick={() => handleRightClick(p.id)}
                className={`w-full text-right p-3 rounded-xl border text-xs leading-snug transition-all min-h-[52px] flex items-center justify-between ${
                  isMatched
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 opacity-80 cursor-default'
                    : isWrong
                    ? 'bg-rose-950/40 border-rose-500 text-rose-200 animate-shake'
                    : selectedLeft
                    ? 'bg-slate-800 border-indigo-500/50 text-slate-100 hover:bg-indigo-950/50 active:scale-95 cursor-pointer'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{p.rightText}</span>
                {isMatched && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {isAllMatched && (
        <button
          onClick={() => {
            sound.playCorrect();
            onComplete();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
        >
          <Sparkles className="w-4 h-4" />
          اكتملت جميع المطابقات بنجاح! متابعة
        </button>
      )}
    </div>
  );
};
