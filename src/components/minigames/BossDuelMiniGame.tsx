import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { sound } from '../../services/audioService';
import { voice } from '../../services/voiceService';
import { GameStorage } from '../../services/storageService';
import { ShieldAlert, Heart, Zap, RotateCcw, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BossDuelMiniGameProps {
  bossName: string;
  questions: Question[];
  onDefeatBoss: () => void;
}

export const BossDuelMiniGame: React.FC<BossDuelMiniGameProps> = ({
  bossName,
  questions,
  onDefeatBoss
}) => {
  const [bossHp, setBossHp] = useState<number>(100);
  const [playerLives, setPlayerLives] = useState<number>(3);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [isHit, setIsHit] = useState<'boss' | 'player' | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const currentQ = questions[currentIndex % questions.length];
  const damagePerHit = Math.ceil(100 / questions.length);

  // Automatically narrate Boss question on appearance
  useEffect(() => {
    if (bossHp > 0 && playerLives > 0 && currentQ) {
      voice.speak(`تحدي الزعيم ${currentIndex + 1}: ${currentQ.question}`);
    }
  }, [currentIndex, bossHp, playerLives, currentQ]);

  const handleSelectOption = (idx: number) => {
    if (answered || bossHp <= 0 || playerLives <= 0) return;
    setSelectedOption(idx);
    setAnswered(true);

    const isCorrect = idx === currentQ.correctAnswer;

    if (isCorrect) {
      sound.playBossHit();
      sound.playCoin();
      sound.playExchangeCoin();
      setIsHit('boss');
      const newHp = Math.max(0, bossHp - damagePerHit);
      setBossHp(newHp);

      // Boss correct answer: +20 coins!
      GameStorage.addCoins(20);
      GameStorage.addExchangeCoins(20);

      setFeedback('ضربة ساحقة في درع الزعيم! +20 عملة!');
      voice.playBossHit();

      if (newHp === 0) {
        sound.playLevelUp();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        voice.playBossWin();
      }
    } else {
      sound.playWrong();
      setIsHit('player');
      setPlayerLives(prev => Math.max(0, prev - 1));

      // Boss wrong answer: -10 coins!
      GameStorage.addCoins(-10);
      GameStorage.addExchangeCoins(-10);

      setFeedback('تصدى الزعيم للهجوم! فقدت قلباً و -10 عملات.');
      voice.playBossWrong();
    }
  };

  const handleNextTurn = () => {
    sound.playClick();
    setIsHit(null);
    setSelectedOption(null);
    setAnswered(false);

    if (bossHp <= 0) {
      onDefeatBoss();
    } else if (playerLives <= 0) {
      // Retry round
      setPlayerLives(3);
      setBossHp(100);
      setCurrentIndex(0);
      setSelectedOption(null);
      setFeedback('استجمع قواك من جديد.. البطل لا يستسلم أبداً!');
      voice.speak('لا تستسلم يا بطل! خذ نفساً عميقاً وجرب من جديد!');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const visibleOptions = currentQ.options.slice(0, 3);

  return (
    <div className="bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-900 border-2 border-rose-500/40 rounded-3xl p-4 sm:p-6 text-slate-100 space-y-5 shadow-2xl relative overflow-hidden animate-fadeIn">
      {/* Boss Arena Header */}
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
          <div>
            <span className="text-[10px] text-rose-400 font-bold tracking-wider uppercase block">معركة الـ BOSS التفاعلية</span>
            <h3 className="text-base font-black text-white">{bossName}</h3>
          </div>
        </div>

        {/* Audio control & Player Hearts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => voice.speak(`سؤال الزعيم: ${currentQ.question}`)}
            className="p-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400 hover:text-white"
            title="تشغيل الصوت"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 transition-all ${
                  heart <= playerLives
                    ? 'text-rose-500 fill-rose-500 scale-105'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Boss Health Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-rose-400">طاقة الزعيم (HP)</span>
          <span className="text-slate-300 font-black tabular-nums">{bossHp}%</span>
        </div>
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-rose-500/30 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              bossHp > 50
                ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
            }`}
            style={{ width: `${bossHp}%` }}
          />
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-3 rounded-2xl text-center text-xs font-black animate-fadeIn ${
          isHit === 'boss'
            ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-200'
            : isHit === 'player'
            ? 'bg-rose-950/70 border border-rose-500/60 text-rose-200'
            : 'bg-slate-800 text-slate-300'
        }`}>
          {feedback}
        </div>
      )}

      {/* Question Card inside Boss Fight */}
      {bossHp > 0 && playerLives > 0 ? (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-400 font-bold">سؤال الهجوم {currentIndex + 1}</span>
            <button
              onClick={() => {
                sound.playClick();
                voice.speak(`سؤال الهجوم: ${currentQ.question}. الخيارات هي: ${visibleOptions.join('، أو ')}`);
              }}
              className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة السؤال</span>
            </button>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
            {currentQ.question}
          </h4>

          {/* Options (Max 3, clean touch) */}
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {visibleOptions.map((opt, idx) => {
              const isCorrectOpt = idx === currentQ.correctAnswer;
              const isSelected = selectedOption === idx;
              let style = 'bg-slate-800/90 border-slate-700 hover:bg-slate-750 text-slate-200';
              if (answered) {
                if (isCorrectOpt) {
                  style = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-black ring-2 ring-emerald-500/40';
                } else if (isSelected && !isCorrectOpt) {
                  style = 'bg-rose-950 border-rose-500 text-rose-200 font-bold';
                } else {
                  style = 'bg-slate-900 border-slate-800 text-slate-600 opacity-50';
                }
              }

              return (
                <button
                  key={`${currentQ.id}-opt-${idx}`}
                  disabled={answered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-2xl border text-xs sm:text-sm text-right font-bold transition-all min-h-[50px] flex items-center justify-between cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-700 text-xs flex items-center justify-center font-bold text-slate-400 shrink-0">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {answered && isCorrectOpt && <Zap className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <button
              onClick={handleNextTurn}
              className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {bossHp <= 0 ? 'إعلان الانتصار الساحق على الـ Boss!' : 'الضربة التالية'}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-6 space-y-3">
          <h4 className="text-xl font-black text-emerald-400">
            {bossHp <= 0 ? 'تم هزيمة الـ BOSS بالكامل!' : 'حاول مرة أخرى!'}
          </h4>
          <button
            onClick={handleNextTurn}
            className="px-6 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-xl cursor-pointer"
          >
            {bossHp <= 0 ? 'استلام غنائم المعركة والمكافآت' : 'إعادة المحاولة'}
          </button>
        </div>
      )}
    </div>
  );
};
