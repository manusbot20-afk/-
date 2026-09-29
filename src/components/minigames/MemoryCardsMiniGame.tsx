import React, { useState } from 'react';
import { MemoryCard } from '../../types';
import { sound } from '../../services/audioService';
import { Eye, HelpCircle, CheckCircle, Sparkles } from 'lucide-react';

interface MemoryCardsMiniGameProps {
  cards: MemoryCard[];
  instructions: string;
  onComplete: () => void;
}

export const MemoryCardsMiniGame: React.FC<MemoryCardsMiniGameProps> = ({
  cards,
  instructions,
  onComplete
}) => {
  const [shuffledCards] = useState(() => {
    return [...cards].sort(() => Math.random() - 0.5);
  });

  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedMatchIds, setMatchedMatchIds] = useState<string[]>([]);

  const handleCardClick = (index: number) => {
    // If already flipped or matched or 2 cards already open
    if (flippedIndices.includes(index)) return;
    if (matchedMatchIds.includes(shuffledCards[index].matchId)) return;
    if (flippedIndices.length >= 2) return;

    sound.playClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = shuffledCards[newFlipped[0]];
      const card2 = shuffledCards[newFlipped[1]];

      if (card1.matchId === card2.matchId) {
        // Matched!
        setTimeout(() => {
          sound.playCorrect();
          setMatchedMatchIds(prev => [...prev, card1.matchId]);
          setFlippedIndices([]);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          sound.playWrong();
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const totalPairs = cards.length / 2;
  const isAllFound = matchedMatchIds.length === totalPairs;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-emerald-300">كروت الذاكرة الجغرافية</h3>
        </div>
        <span className="text-xs text-slate-400">
          الأزواج المكتشفة: <span className="text-emerald-400 font-bold tabular-nums">{matchedMatchIds.length}</span> من {totalPairs}
        </span>
      </div>

      <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 leading-relaxed">
        {instructions}
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {shuffledCards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx);
          const isMatched = matchedMatchIds.includes(card.matchId);
          const showFace = isFlipped || isMatched;

          return (
            <button
              key={`${card.id}_${idx}`}
              onClick={() => handleCardClick(idx)}
              disabled={isMatched || isFlipped}
              className={`min-h-[90px] rounded-xl p-2.5 text-center flex flex-col items-center justify-center border transition-all text-xs font-bold ${
                isMatched
                  ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200 cursor-default shadow-sm'
                  : showFace
                  ? 'bg-indigo-900/90 border-indigo-400 text-indigo-100 shadow-md ring-2 ring-indigo-400/40'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-400 hover:text-slate-200 cursor-pointer active:scale-95'
              }`}
            >
              {showFace ? (
                <>
                  <span className="text-[10px] text-slate-400 mb-1">
                    {card.category === 'climate' ? 'إقليم مناخي' : 'نبات / حيوان'}
                  </span>
                  <span className="leading-snug">{card.text}</span>
                  {isMatched && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-1" />}
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-60">
                  <HelpCircle className="w-6 h-6 text-slate-500" />
                  <span className="text-[10px] text-slate-400">انقر للكشف</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {isAllFound && (
        <button
          onClick={() => {
            sound.playCorrect();
            onComplete();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
        >
          <Sparkles className="w-4 h-4" />
          أحسنت! فتحت كل كروت الذاكرة (متابعة)
        </button>
      )}
    </div>
  );
};
