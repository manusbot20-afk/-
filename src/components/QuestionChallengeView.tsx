import React, { useState } from 'react';
import { Question } from '../types';
import { sound } from '../services/audioService';
import { GameStorage } from '../services/storageService';
import { HelpCircle, CheckCircle2, AlertCircle, Sparkles, ArrowLeft, Lightbulb } from 'lucide-react';

interface QuestionChallengeViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  playerCoins: number;
  onAnswer: (isCorrect: boolean, usedHint: boolean) => void;
  onNext: () => void;
}

const COMMENTARY_QUOTES = [
  'يااااااه! إجابة في الوقت القاتل!',
  'هدف عالمي في شباك الامتحان!',
  'تركيز أسطوري من بطل الجمهورية!',
  'تسديدة متقنة لا تصد ولا ترد!',
  'الله على الثقة والدقة.. أستاذ!'
];

export const QuestionChallengeView: React.FC<QuestionChallengeViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  playerCoins,
  onAnswer,
  onNext
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [commentary, setCommentary] = useState<string>('');

  const HINT_COST = 3;

  // Strict state isolation per question
  React.useEffect(() => {
    setSelectedOption(null);
    setAnswered(false);
    setIsCorrect(false);
    setHintUsed(false);
    setShowHint(false);
    setCommentary('');
  }, [question.id]);

  const handleUseHint = () => {
    if (showHint) return;
    if (playerCoins < HINT_COST) {
      sound.playWrong();
      return;
    }
    sound.playCoin();
    GameStorage.addCoins(-HINT_COST);
    GameStorage.addExchangeCoins(-HINT_COST);
    setHintUsed(true);
    setShowHint(true);
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);

    const correct = idx === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
      sound.playCoin();
      GameStorage.addCoins(5);
      GameStorage.addExchangeCoins(5);
      const quote = COMMENTARY_QUOTES[Math.floor(Math.random() * COMMENTARY_QUOTES.length)];
      setCommentary(quote);
    } else {
      sound.playWrong();
      GameStorage.addCoins(-10);
      GameStorage.addExchangeCoins(-10);
      GameStorage.recordMistake(question.id, question.question, question.sourceLesson);
    }

    onAnswer(correct, hintUsed);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-4 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
          تحدي {questionNumber} من {totalQuestions}
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          المصدر: {question.sourceLesson}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-base sm:text-lg font-black text-slate-100 leading-snug pt-1">
        {question.question}
      </h3>

      {/* Hint Accordion */}
      {showHint && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-200 animate-fadeIn">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">تلميح عم رشيد الذكي:</span>
            <span>{question.hint}</span>
          </div>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2.5 pt-1">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isThisCorrect = idx === question.correctAnswer;

          let btnStyle = 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600 active:scale-98';
          if (answered) {
            if (isThisCorrect) {
              btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 animate-shake';
            } else {
              btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              disabled={answered}
              onClick={() => handleSelect(idx)}
              className={`w-full p-3.5 rounded-xl border text-right text-xs sm:text-sm font-bold transition-all min-h-[52px] flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-950/70 border border-slate-700 text-xs flex items-center justify-center font-bold text-slate-400">
                  {idx + 1}
                </span>
                <span>{opt}</span>
              </div>

              {answered && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions: Hint button or Explanation */}
      {!answered ? (
        <div className="flex items-center justify-between pt-2">
          {!showHint && (
            <button
              onClick={handleUseHint}
              disabled={playerCoins < HINT_COST}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                playerCoins >= HINT_COST
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50 cursor-pointer active:scale-95'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>طلب تلميح ({HINT_COST} عملة)</span>
            </button>
          )}
          <span className="text-[11px] text-slate-500 mr-auto">
            اختر الإجابة الصحيحة لتسجيل النقاط
          </span>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {/* Sports commentary if correct, or encouraging hint if wrong */}
          {isCorrect ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl text-center text-xs font-black text-emerald-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>{commentary}</span>
            </div>
          ) : (
            <div className="bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl text-center text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>قريبة جداً! راجع الشرح التعليمي أدناه وسنراجعها في التدريب الذكي.</span>
            </div>
          )}

          {/* Explanation Box */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
            <span className="font-bold text-amber-400 block">شرح كبسولة المنهج:</span>
            <p className="text-slate-300 leading-relaxed">{question.explanation}</p>
          </div>

          {/* Continue Next Button */}
          <button
            onClick={() => {
              sound.playClick();
              onNext();
            }}
            className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{questionNumber === totalQuestions ? 'إنهاء المرحلة واستلام المكافآت' : 'التحدي التالي'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
