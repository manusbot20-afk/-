import React, { useState } from 'react';
import { sound } from '../../services/audioService';
import { KeyRound, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';

interface CluePuzzleMiniGameProps {
  clues: string[];
  answer: string;
  options: string[];
  instructions: string;
  onComplete: () => void;
}

export const CluePuzzleMiniGame: React.FC<CluePuzzleMiniGameProps> = ({
  clues,
  answer,
  options,
  instructions,
  onComplete
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealedCluesCount, setRevealedCluesCount] = useState<number>(1);

  const handleRevealNext = () => {
    sound.playClick();
    if (revealedCluesCount < clues.length) {
      setRevealedCluesCount(prev => prev + 1);
    }
  };

  const handleSelectOption = (opt: string) => {
    sound.playClick();
    setSelectedOption(opt);
    if (opt === answer) {
      sound.playCorrect();
      setIsCorrect(true);
    } else {
      sound.playWrong();
      setIsCorrect(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-sm text-amber-300">لغز المحقق التاريخي</h3>
        </div>
        <span className="text-xs text-slate-400">
          المفاتيح المكشوفة: <span className="text-amber-400 font-bold">{revealedCluesCount}</span> من {clues.length}
        </span>
      </div>

      <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 leading-relaxed">
        {instructions}
      </p>

      {/* Clues Box */}
      <div className="space-y-2 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
        {clues.map((clue, idx) => {
          const isRevealed = idx < revealedCluesCount;
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                isRevealed
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                  : 'bg-slate-900/40 border-slate-800 text-slate-600'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                isRevealed ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'
              }`}>
                {idx + 1}
              </span>
              <p className="leading-snug">
                {isRevealed ? clue : 'مفتاح سري مشفر... اضغط لكشفه'}
              </p>
            </div>
          );
        })}

        {revealedCluesCount < clues.length && (
          <button
            onClick={handleRevealNext}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 w-full py-1.5 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            كشف المفتاح التالي
          </button>
        )}
      </div>

      {/* Guessing Options */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300">من يكون صاحب اللغز أو الحدث المقصود؟</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => {
            const isSelected = selectedOption === opt;
            const isOptionAnswer = opt === answer;

            return (
              <button
                key={opt}
                disabled={isCorrect === true}
                onClick={() => handleSelectOption(opt)}
                className={`p-3 rounded-xl border text-xs font-bold text-right transition-all min-h-[48px] flex items-center justify-between ${
                  isSelected && isCorrect
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : isSelected && isCorrect === false
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200 animate-shake'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200 active:scale-95'
                }`}
              >
                <span>{opt}</span>
                {isSelected && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {isCorrect === false && (
        <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 p-2 rounded-lg text-center font-medium">
          قريبة جداً! راجع المفاتيح واكشف الباقي لتصل للإجابة الصحيحة.
        </p>
      )}

      {isCorrect && (
        <button
          onClick={() => {
            sound.playCorrect();
            onComplete();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
        >
          <Sparkles className="w-4 h-4" />
          استنتاج عبقري صحيح! متابعة المهمة
        </button>
      )}
    </div>
  );
};
