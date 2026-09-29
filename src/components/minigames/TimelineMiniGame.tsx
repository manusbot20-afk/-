import React, { useState } from 'react';
import { TimelineItem } from '../../types';
import { sound } from '../../services/audioService';
import { ArrowUp, ArrowDown, CheckCircle, RotateCcw, Calendar, Sparkles } from 'lucide-react';

interface TimelineMiniGameProps {
  items: TimelineItem[];
  instructions: string;
  onComplete: () => void;
}

export const TimelineMiniGame: React.FC<TimelineMiniGameProps> = ({
  items,
  instructions,
  onComplete
}) => {
  // Shuffle initially so it's a real puzzle
  const [currentOrder, setCurrentOrder] = useState<TimelineItem[]>(() => {
    return [...items].sort(() => Math.random() - 0.5);
  });
  const [checked, setChecked] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    sound.playClick();
    const newItems = [...currentOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setCurrentOrder(newItems);
    setChecked(false);
  };

  const handleValidate = () => {
    const isCorrect = currentOrder.every((item, idx) => item.order === idx + 1);
    setChecked(true);
    if (isCorrect) {
      sound.playCorrect();
      setIsSuccess(true);
    } else {
      sound.playWrong();
      setIsSuccess(false);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setCurrentOrder([...items].sort(() => Math.random() - 0.5));
    setChecked(false);
    setIsSuccess(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-sm text-amber-300">الترتيب الزمني: قطار الأحداث التاريخية</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
        >
          <RotateCcw className="w-3 h-3" />
          إعادة الترتيب
        </button>
      </div>

      <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 leading-relaxed">
        {instructions}
      </p>

      {/* Timeline items list */}
      <div className="space-y-2 relative before:absolute before:top-4 before:bottom-4 before:right-6 before:w-0.5 before:bg-slate-700">
        {currentOrder.map((item, index) => {
          const isItemCorrect = checked && item.order === index + 1;
          const isItemWrong = checked && item.order !== index + 1;

          return (
            <div
              key={item.id}
              className={`relative flex items-center justify-between p-3 rounded-xl border transition-all ${
                isItemCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-900/20'
                  : isItemWrong
                  ? 'bg-rose-950/30 border-rose-500/50'
                  : 'bg-slate-800/80 border-slate-700'
              }`}
            >
              {/* Event details */}
              <div className="flex items-center gap-3 pr-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-600 text-[11px] font-bold flex items-center justify-center text-slate-300 shrink-0">
                  {index + 1}
                </span>

                <div>
                  <span className="inline-block text-[11px] font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 mb-1">
                    {item.year}
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-snug">
                    {item.event}
                  </p>
                </div>
              </div>

              {/* Move buttons */}
              <div className="flex flex-col gap-1 pl-1 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
                  title="تحريك لأعلى"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === currentOrder.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
                  title="تحريك لأسفل"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation button / feedback */}
      {!isSuccess ? (
        <button
          onClick={handleValidate}
          className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          تحقق من صحة الترتيب الزمني
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-emerald-950/50 border border-emerald-500/50 p-2.5 rounded-xl text-center text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            عظيم! ترتيب تاريخي سليم 100%!
          </div>
          <button
            onClick={() => {
              sound.playCorrect();
              onComplete();
            }}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            متابعة التحدي واستلام نقاط الخبرة
          </button>
        </div>
      )}
    </div>
  );
};
